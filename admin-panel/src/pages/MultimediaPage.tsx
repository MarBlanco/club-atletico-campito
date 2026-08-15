import { useEffect, useState, useRef } from 'react'
import { useIsMobile } from '../hooks/useMediaQuery'
import type { Media, CreateMediaDTO, UpdateMediaDTO, MediaType } from '../types/media'
import type { Gallery } from '../types/galleries'
import { getMedia, createMedia, updateMedia, deleteMedia } from '../services/mediaService'
import { getGalleries } from '../services/galleriesService'
import { uploadImage, uploadVideo } from '../services/storageService'
import { optimizeImageFromFile } from '../lib/optimizeImage'
import { generateThumbnailFromFile } from '../lib/thumbnail'
import CropModal from '../components/media/CropModal'

const TYPE_LABELS: Record<MediaType, string> = {
  image: 'Imagen',
  video: 'Video',
}

const EMPTY_FORM: CreateMediaDTO = {
  gallery_id: '',
  type: 'image',
  url: '',
  thumbnail_url: null,
}

function MultimediaPage() {
  const isMobile = useIsMobile()
  const [media, setMedia] = useState<Media[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<CreateMediaDTO>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [galleries, setGalleries] = useState<Gallery[]>([])
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [cropBlob, setCropBlob] = useState<Blob | null>(null)
  const [cropSrc, setCropSrc] = useState<string | null>(null)
  const [previewSrc, setPreviewSrc] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    getMedia()
      .then(data => { setMedia(data); setError(null) })
      .catch(e => setError(e instanceof Error ? e.message : 'Error al cargar multimedia'))
      .finally(() => setLoading(false))
    getGalleries()
      .then(setGalleries)
      .catch(() => {})
  }, [refreshKey])

  function reload() { setRefreshKey(k => k + 1) }

  function openCreate() {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setFile(null)
    setCropBlob(null)
    setCropSrc(null)
    setPreviewSrc(null)
    setShowForm(true)
  }

  function openEdit(m: Media) {
    setEditingId(m.id)
    setForm({
      gallery_id: m.gallery_id,
      type: m.type,
      url: m.url,
      thumbnail_url: m.thumbnail_url,
    })
    setFile(null)
    setCropBlob(null)
    setCropSrc(null)
    setPreviewSrc(null)
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setEditingId(null)
    setForm(EMPTY_FORM)
    setFile(null)
    setCropBlob(null)
    if (cropSrc) URL.revokeObjectURL(cropSrc)
    setCropSrc(null)
    if (previewSrc) URL.revokeObjectURL(previewSrc)
    setPreviewSrc(null)
  }

  function openCrop() {
    if (!file) return
    if (cropSrc) URL.revokeObjectURL(cropSrc)
    setCropSrc(URL.createObjectURL(file))
  }

  function closeCrop() {
    if (cropSrc) URL.revokeObjectURL(cropSrc)
    setCropSrc(null)
  }

  function handleCropSave(blob: Blob) {
    setCropBlob(blob)
    if (previewSrc) URL.revokeObjectURL(previewSrc)
    setPreviewSrc(URL.createObjectURL(blob))
    closeCrop()
  }

  async function handleUpload() {
    if (!file) return
    const targetType = form.type
    setUploading(true)
    try {
      if (targetType === 'video') {
        const { publicUrl } = await uploadVideo(file, 'videos')
        setForm(p => (p.type === targetType ? { ...p, url: publicUrl } : p))
      } else {
        const source = cropBlob ?? file
        const optimized = await optimizeImageFromFile(new File([source], 'image.jpg', { type: 'image/jpeg' }))
        const extension = optimized.type === 'image/webp' ? 'webp' : 'jpg'
        const optimizedFile = new File([optimized], `image.${extension}`, { type: optimized.type })
        const { publicUrl } = await uploadImage(optimizedFile, 'galleries')
        const thumb = await generateThumbnailFromFile(optimizedFile)
        const thumbFile = new File([thumb], 'thumb.jpg', { type: thumb.type })
        const thumbResult = await uploadImage(thumbFile, 'galleries')
        setForm(p => (p.type === targetType ? { ...p, url: publicUrl, thumbnail_url: thumbResult.publicUrl } : p))
      }
      setFile(null)
      setCropBlob(null)
      if (previewSrc) URL.revokeObjectURL(previewSrc)
      setPreviewSrc(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al subir archivo')
    } finally {
      setUploading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      if (editingId) {
        const dto: UpdateMediaDTO = form
        await updateMedia(editingId, dto)
      } else {
        await createMedia(form)
      }
      closeForm()
      reload()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm('¿Eliminar este archivo multimedia?')) return
    try {
      await deleteMedia(id)
      setMedia(prev => prev.filter(m => m.id !== id))
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al eliminar')
    }
  }

  function truncate(str: string, max = 40) {
    return str.length > max ? str.slice(0, max) + '…' : str
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1a1a2e', margin: 0 }}>Multimedia</h2>
        <button onClick={openCreate} style={btnStyle('#1a1a2e')}>+ Nuevo archivo</button>
      </div>

      {error && <p style={{ color: '#ef4444', marginBottom: 16, fontSize: 13 }} role="alert">{error}</p>}

      {showForm && (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: 24, marginBottom: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20, color: '#1a1a2e' }}>
            {editingId ? 'Editar archivo' : 'Nuevo archivo'}
          </h3>
<form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 14 }}>
            <Field label="Tipo" htmlFor="media-type">
              <select id="media-type" value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value as MediaType }))} style={inputStyle}>
                <option value="image">Imagen</option>
                <option value="video">Video</option>
              </select>
            </Field>
            <Field label="Galería" htmlFor="media-gallery">
              <select id="media-gallery" value={form.gallery_id} onChange={e => setForm(p => ({ ...p, gallery_id: e.target.value }))} required style={inputStyle}>
                <option value="" disabled>Seleccionar galería</option>
                {galleries.map(g => <option key={g.id} value={g.id}>{g.title}</option>)}
              </select>
            </Field>
            <Field label="Archivo" htmlFor="media-file" style={{ gridColumn: '1 / -1' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input
                    ref={fileInputRef}
                    id="media-file"
                    type="file"
accept={form.type === 'video' ? 'video/mp4' : 'image/jpeg,image/png,image/webp'}
                    onChange={e => {
                      const next = e.target.files?.[0] ?? null
                      setFile(next)
                      setCropBlob(null)
                      if (previewSrc) URL.revokeObjectURL(previewSrc)
                      setPreviewSrc(next ? URL.createObjectURL(next) : null)
                    }}
                    style={{ fontSize: 13, flex: 1 }}
                  />
                  {form.type === 'image' && (
                    <button
                      type="button"
                      onClick={openCrop}
                      disabled={!file || uploading}
                      style={btnStyle(file && !uploading ? '#3b82f6' : '#9ca3af')}
                    >
                      Recortar
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleUpload}
                    disabled={!file || uploading}
                    style={btnStyle(file && !uploading ? '#059669' : '#9ca3af')}
                  >
                    {uploading ? 'Subiendo...' : 'Subir'}
                  </button>
                </div>
                {(previewSrc || form.url) && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {form.type === 'video' ? (
                      <video
                        src={previewSrc ?? form.url}
                        controls
                        style={{ maxHeight: 120, maxWidth: '100%', borderRadius: 6, border: '1px solid #e5e7eb' }}
                      />
                    ) : (
                      <img
                        src={previewSrc ?? form.url}
                        alt="Preview"
                        style={{ maxHeight: 120, maxWidth: '100%', borderRadius: 6, objectFit: 'cover', border: '1px solid #e5e7eb' }}
                      />
                    )}
                    {form.url && <span style={{ fontSize: 11, color: '#6b7280', wordBreak: 'break-all' }}>{form.url}</span>}
                  </div>
                )}
              </div>
            </Field>
            <Field label="URL del archivo" htmlFor="media-url" style={{ gridColumn: '1 / -1' }}>
              <input
                id="media-url"
                value={form.url}
                onChange={e => setForm(p => ({ ...p, url: e.target.value }))}
                required
                style={inputStyle}
              />
            </Field>
            <Field label="URL de thumbnail (opcional)" htmlFor="media-thumbnail" style={{ gridColumn: '1 / -1' }}>
              <input
                id="media-thumbnail"
                value={form.thumbnail_url ?? ''}
                onChange={e => setForm(p => ({ ...p, thumbnail_url: e.target.value || null }))}
                style={inputStyle}
              />
            </Field>
            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 10 }}>
              <button type="submit" disabled={saving} style={btnStyle('#1a1a2e')}>
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
              <button type="button" onClick={closeForm} style={btnStyle('#6b7280')}>Cancelar</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <p style={{ color: '#6b7280', fontSize: 14 }} role="status" aria-live="polite">Cargando...</p>
      ) : media.length === 0 ? (
        <p style={{ color: '#6b7280', fontSize: 14 }}>No hay archivos multimedia todavía.</p>
      ) : (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                <th style={thStyle}>Tipo</th>
                <th style={thStyle}>URL</th>
                <th style={thStyle}>Thumbnail</th>
                <th style={thStyle}>Galería</th>
                <th style={{ ...thStyle, width: 140 }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {media.map((m, i) => (
                <tr key={m.id} style={{ borderBottom: i < media.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                  <td style={tdStyle}>
                    <span style={{
                      display: 'inline-block',
                      padding: '2px 10px',
                      borderRadius: 12,
                      fontSize: 12,
                      fontWeight: 600,
                      background: m.type === 'image' ? '#dbeafe' : '#fef3c7',
                      color: m.type === 'image' ? '#1d4ed8' : '#92400e',
                    }}>
                      {TYPE_LABELS[m.type]}
                    </span>
                  </td>
                  <td style={{ ...tdStyle, fontFamily: 'monospace', fontSize: 12 }}>{truncate(m.url)}</td>
                  <td style={{ ...tdStyle, fontFamily: 'monospace', fontSize: 12 }}>{m.thumbnail_url ? truncate(m.thumbnail_url) : '—'}</td>
                  <td style={tdStyle}>{galleries.find(g => g.id === m.gallery_id)?.title ?? truncate(m.gallery_id, 20)}</td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => openEdit(m)} style={btnSmall('#3b82f6')}>Editar</button>
                      <button onClick={() => handleDelete(m.id)} style={btnSmall('#ef4444')}>Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {cropSrc && (
        <CropModal
          src={cropSrc}
          onCancel={closeCrop}
          onSave={handleCropSave}
        />
      )}
    </div>
  )
}

function Field({ label, htmlFor, children, style }: { label: string; htmlFor?: string; children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5, ...style }}>
      <label htmlFor={htmlFor} style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>{label}</label>
      {children}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  padding: '9px 12px',
  border: '1px solid #d1d5db',
  borderRadius: 6,
  fontSize: 14,
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
}

const thStyle: React.CSSProperties = {
  padding: '11px 16px',
  textAlign: 'left',
  fontSize: 12,
  fontWeight: 600,
  color: '#6b7280',
  textTransform: 'uppercase',
  letterSpacing: 0.5,
}

const tdStyle: React.CSSProperties = {
  padding: '12px 16px',
  color: '#374151',
  verticalAlign: 'middle',
}

function btnStyle(bg: string): React.CSSProperties {
  return { padding: '9px 18px', background: bg, color: '#fff', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer' }
}

function btnSmall(bg: string): React.CSSProperties {
  return { padding: '5px 12px', background: bg, color: '#fff', border: 'none', borderRadius: 5, fontSize: 12, fontWeight: 600, cursor: 'pointer' }
}

export default MultimediaPage

import { useEffect, useState, useRef } from 'react'
import { useIsMobile } from '../hooks/useMediaQuery'
import type { Media, CreateMediaDTO, UpdateMediaDTO, MediaType } from '../types/media'
import { getMedia, createMedia, updateMedia, deleteMedia } from '../services/mediaService'
import { uploadImage, uploadVideo } from '../services/storageService'
import DataTable, { type DataTableColumn } from '../components/admin/DataTable'
import ActionMenu from '../components/admin/ActionMenu'
import StatusBadge from '../components/admin/StatusBadge'
import FormActions from '../components/admin/FormActions'

const TYPE_LABELS: Record<MediaType, string> = {
  image: 'Imagen',
  video: 'Video',
}

const COLUMNS: DataTableColumn[] = [
  { key: 'type', label: 'Tipo' },
  { key: 'url', label: 'URL' },
  { key: 'thumbnail', label: 'Thumbnail' },
  { key: 'gallery', label: 'Galería' },
  { key: 'actions', label: 'Acciones', width: 140 },
]

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
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    getMedia()
      .then(data => { setMedia(data); setError(null) })
      .catch(e => setError(e instanceof Error ? e.message : 'Error al cargar multimedia'))
      .finally(() => setLoading(false))
  }, [refreshKey])

  function reload() { setRefreshKey(k => k + 1) }

  function openCreate() {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setFile(null)
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
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setEditingId(null)
    setForm(EMPTY_FORM)
    setFile(null)
  }

  async function handleUpload() {
    if (!file) return
    const targetType = form.type
    setUploading(true)
    try {
      const { publicUrl } = targetType === 'video'
        ? await uploadVideo(file, 'videos')
        : await uploadImage(file, 'galleries')
      setForm(p => (p.type === targetType ? { ...p, url: publicUrl } : p))
      setFile(null)
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
            <Field label="ID de galería" htmlFor="media-gallery">
              <input
                id="media-gallery"
                value={form.gallery_id}
                onChange={e => setForm(p => ({ ...p, gallery_id: e.target.value }))}
                required
                placeholder="UUID de la galería"
                style={inputStyle}
              />
            </Field>
            <Field label="Archivo" htmlFor="media-file" style={{ gridColumn: '1 / -1' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input
                    ref={fileInputRef}
                    id="media-file"
                    type="file"
                    accept={form.type === 'video' ? 'video/*' : 'image/*'}
                    onChange={e => setFile(e.target.files?.[0] ?? null)}
                    style={{ fontSize: 13, flex: 1 }}
                  />
                  <button
                    type="button"
                    onClick={handleUpload}
                    disabled={!file || uploading}
                    style={btnStyle(file && !uploading ? '#059669' : '#9ca3af')}
                  >
                    {uploading ? 'Subiendo...' : 'Subir'}
                  </button>
                </div>
                {form.url && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {form.type === 'video' ? (
                      <video
                        src={form.url}
                        controls
                        style={{ maxHeight: 120, maxWidth: '100%', borderRadius: 6, border: '1px solid #e5e7eb' }}
                      />
                    ) : (
                      <img
                        src={form.url}
                        alt="Preview"
                        style={{ maxHeight: 120, maxWidth: '100%', borderRadius: 6, objectFit: 'cover', border: '1px solid #e5e7eb' }}
                      />
                    )}
                    <span style={{ fontSize: 11, color: '#6b7280', wordBreak: 'break-all' }}>{form.url}</span>
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
            <div style={{ gridColumn: '1 / -1' }}>
              <FormActions saving={saving} onCancel={closeForm} style={{ gridColumn: '1 / -1', marginTop: 0 }} />
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <p style={{ color: '#6b7280', fontSize: 14 }} role="status" aria-live="polite">Cargando...</p>
      ) : media.length === 0 ? (
        <p style={{ color: '#6b7280', fontSize: 14 }}>No hay archivos multimedia todavía.</p>
      ) : (
        <DataTable
          columns={COLUMNS}
          rows={media}
          keyField={m => m.id}
          renderCell={(m, column) => {
            switch (column.key) {
              case 'type':
                return <StatusBadge label={TYPE_LABELS[m.type]} tone={m.type === 'image' ? 'blue' : 'amber'} />
              case 'url':
                return <span style={{ fontFamily: 'monospace', fontSize: 12 }}>{truncate(m.url)}</span>
              case 'thumbnail':
                return <span style={{ fontFamily: 'monospace', fontSize: 12 }}>{m.thumbnail_url ? truncate(m.thumbnail_url) : '—'}</span>
              case 'gallery':
                return <span style={{ fontFamily: 'monospace', fontSize: 12 }}>{truncate(m.gallery_id, 20)}</span>
              case 'actions':
                return <ActionMenu onEdit={() => openEdit(m)} onDelete={() => handleDelete(m.id)} />
              default:
                return null
            }
          }}
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

export default MultimediaPage

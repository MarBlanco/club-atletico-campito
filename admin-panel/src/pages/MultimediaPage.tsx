import { useEffect, useState } from 'react'
import { useIsMobile } from '../hooks/useMediaQuery'
import type { Media, CreateMediaDTO, UpdateMediaDTO, MediaType } from '../types/media'
import type { Gallery } from '../types/galleries'
import { getMedia, createMedia, updateMedia, deleteMedia } from '../services/mediaService'
import { getGalleries } from '../services/galleriesService'
import ImageUploader from '../components/media/ImageUploader'
import VideoUploader from '../components/media/VideoUploader'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import Badge from '../components/ui/Badge'
import EmptyState from '../components/ui/EmptyState'
import LoadingState from '../components/ui/LoadingState'
import ConfirmDialog from '../components/ui/ConfirmDialog'

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
  const [confirmId, setConfirmId] = useState<string | null>(null)

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
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setEditingId(null)
    setForm(EMPTY_FORM)
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

  function handleDelete(id: string) {
    setConfirmId(id)
  }

  async function performDelete() {
    if (!confirmId) return
    try {
      await deleteMedia(confirmId)
      setMedia(prev => prev.filter(m => m.id !== confirmId))
      setConfirmId(null)
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
              <Select id="media-type" value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value as MediaType }))}>
                <option value="image">Imagen</option>
                <option value="video">Video</option>
              </Select>
            </Field>
<Field label="Galería" htmlFor="media-gallery">
              <select id="media-gallery" value={form.gallery_id} onChange={e => setForm(p => ({ ...p, gallery_id: e.target.value }))} required>
                <option value="" disabled>Seleccionar galería</option>
                {galleries.map(g => <option key={g.id} value={g.id}>{g.title}</option>)}
              </select>
            </Field>
            <Field label="Archivo" htmlFor="media-file" style={{ gridColumn: '1 / -1' }}>
              {form.type === 'video' ? (
                <VideoUploader
                  id="media-file"
                  folder="videos"
                  value={form.url}
                  onChange={url => setForm(p => ({ ...p, url }))}
                />
              ) : (
                <ImageUploader
                  id="media-file"
                  folder="galleries"
                  value={form.url}
                  onChange={url => setForm(p => ({ ...p, url }))}
                  onThumbnailChange={thumb => setForm(p => ({ ...p, thumbnail_url: thumb }))}
                  aspectRatio={16 / 9}
                  label="Imagen"
                />
              )}
            </Field>
            <Field label="URL del archivo" htmlFor="media-url" style={{ gridColumn: '1 / -1' }}>
              <Input
                id="media-url"
                value={form.url}
                onChange={e => setForm(p => ({ ...p, url: e.target.value }))}
                required
              />
            </Field>
            <Field label="URL de thumbnail (opcional)" htmlFor="media-thumbnail" style={{ gridColumn: '1 / -1' }}>
              <Input
                id="media-thumbnail"
                value={form.thumbnail_url ?? ''}
                onChange={e => setForm(p => ({ ...p, thumbnail_url: e.target.value || null }))}
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
        <LoadingState />
      ) : media.length === 0 ? (
        <EmptyState message="No hay archivos multimedia todavía." />
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
                    <Badge variant={m.type === 'image' ? 'blue' : 'amber'}>
                      {TYPE_LABELS[m.type]}
                    </Badge>
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

      {confirmId && (
        <ConfirmDialog
          title="Eliminar archivo"
          message="¿Eliminar este archivo multimedia?"
          onCancel={() => setConfirmId(null)}
          onConfirm={performDelete}
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
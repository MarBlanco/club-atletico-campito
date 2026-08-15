import { useEffect, useState, useRef } from 'react'
import { useIsMobile } from '../hooks/useMediaQuery'
import type { Gallery, CreateGalleryDTO, UpdateGalleryDTO, GalleryCategory } from '../types/galleries'
import { getGalleries, createGallery, updateGallery, deleteGallery } from '../services/galleriesService'
import { uploadImage } from '../services/storageService'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import Badge from '../components/ui/Badge'
import EmptyState from '../components/ui/EmptyState'
import LoadingState from '../components/ui/LoadingState'
import ConfirmDialog from '../components/ui/ConfirmDialog'

const CATEGORIES: GalleryCategory[] = ['primera', 'infanto', 'femenino', 'veteranos', 'familias', 'hinchas']

const CATEGORY_LABELS: Record<GalleryCategory, string> = {
  primera: 'Primera',
  infanto: 'Infanto Juvenil',
  femenino: 'Femenino',
  veteranos: 'Veteranos',
  familias: 'Familias',
  hinchas: 'Hinchas',
}

const EMPTY_FORM: CreateGalleryDTO = {
  title: '',
  category: 'primera',
  match_date: '',
  cover_image: '',
}

function GalleriesPage() {
  const isMobile = useIsMobile()
  const [galleries, setGalleries] = useState<Gallery[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<CreateGalleryDTO>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
const [imageFile, setImageFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)

  useEffect(() => {
    getGalleries()
      .then(data => { setGalleries(data); setError(null) })
      .catch(e => setError(e instanceof Error ? e.message : 'Error al cargar momentos'))
      .finally(() => setLoading(false))
  }, [refreshKey])

  function reload() { setRefreshKey(k => k + 1) }

  function openCreate() {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setShowForm(true)
  }

  function openEdit(g: Gallery) {
    setEditingId(g.id)
    setForm({
      title: g.title,
      category: g.category,
      match_date: g.match_date,
      cover_image: g.cover_image,
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
        const dto: UpdateGalleryDTO = form
        await updateGallery(editingId, dto)
      } else {
        await createGallery(form)
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
      await deleteGallery(confirmId)
      setGalleries(prev => prev.filter(g => g.id !== confirmId))
      setConfirmId(null)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al eliminar')
    }
  }

  async function handleUploadImage() {
    if (!imageFile) return
    setUploading(true)
    try {
      const { publicUrl } = await uploadImage(imageFile, 'galleries')
      setForm(p => ({ ...p, cover_image: publicUrl }))
      setImageFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al subir imagen')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1a1a2e', margin: 0 }}>Momentos Campito</h2>
        <button onClick={openCreate} style={btnStyle('#1a1a2e')}>+ Nuevo momento</button>
      </div>

      {error && <p style={{ color: '#ef4444', marginBottom: 16, fontSize: 13 }} role="alert">{error}</p>}

      {showForm && (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: 24, marginBottom: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20, color: '#1a1a2e' }}>
            {editingId ? 'Editar momento' : 'Nuevo momento'}
          </h3>
<form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 14 }}>
            <Field label="Título" htmlFor="gallery-title" style={{ gridColumn: '1 / -1' }}>
              <Input id="gallery-title" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required />
            </Field>
            <Field label="Categoría" htmlFor="gallery-category">
              <Select id="gallery-category" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value as GalleryCategory }))}>
                {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
              </Select>
            </Field>
            <Field label="Fecha del partido" htmlFor="gallery-date">
              <Input id="gallery-date" type="date" value={form.match_date} onChange={e => setForm(p => ({ ...p, match_date: e.target.value }))} required />
            </Field>
            <Field label="URL imagen de portada" htmlFor="gallery-cover" style={{ gridColumn: '1 / -1' }}>
<Input id="gallery-cover" value={form.cover_image} onChange={e => setForm(p => ({ ...p, cover_image: e.target.value }))} required />
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={e => setImageFile(e.target.files?.[0] ?? null)}
                  style={{ fontSize: 13, flex: 1 }}
                />
                <button
                  type="button"
                  onClick={handleUploadImage}
                  disabled={!imageFile || uploading}
                  style={btnStyle(imageFile && !uploading ? '#059669' : '#9ca3af')}
                >
                  {uploading ? 'Subiendo...' : 'Subir'}
                </button>
              </div>
              {form.cover_image && (
                <img
                  src={form.cover_image}
                  alt="Preview portada"
                  style={{ maxHeight: 120, maxWidth: '100%', borderRadius: 6, objectFit: 'cover', border: '1px solid #e5e7eb' }}
                />
              )}
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
      ) : galleries.length === 0 ? (
<EmptyState message="No hay momentos todavía." />
      ) : (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                <th style={thStyle}>Título</th>
                <th style={thStyle}>Categoría</th>
                <th style={thStyle}>Fecha partido</th>
                <th style={thStyle}>Portada</th>
                <th style={{ ...thStyle, width: 140 }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {galleries.map((g, i) => (
                <tr key={g.id} style={{ borderBottom: i < galleries.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                  <td style={{ ...tdStyle, fontWeight: 600 }}>{g.title}</td>
                  <td style={tdStyle}>
                    <Badge variant="gray">
                      {CATEGORY_LABELS[g.category]}
                    </Badge>
                  </td>
                  <td style={tdStyle}>{new Date(g.match_date).toLocaleDateString('es-AR')}</td>
                  <td style={tdStyle}>
                    {g.cover_image
                      ? <img src={g.cover_image} alt={g.title} style={{ height: 40, width: 64, objectFit: 'cover', borderRadius: 4 }} />
                      : '—'
                    }
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => openEdit(g)} style={btnSmall('#3b82f6')}>Editar</button>
                      <button onClick={() => handleDelete(g.id)} style={btnSmall('#ef4444')}>Eliminar</button>
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
          title="Eliminar galería"
          message="¿Eliminar esta galería?"
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

export default GalleriesPage

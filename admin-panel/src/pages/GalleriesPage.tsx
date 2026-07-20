import { useEffect, useState } from 'react'
import type { Gallery, CreateGalleryDTO, UpdateGalleryDTO, GalleryCategory } from '../types/galleries'
import { getGalleries, createGallery, updateGallery, deleteGallery } from '../services/galleriesService'

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
  const [galleries, setGalleries] = useState<Gallery[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<CreateGalleryDTO>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getGalleries()
      .then(data => { setGalleries(data); setError(null) })
      .catch(e => setError(e instanceof Error ? e.message : 'Error al cargar galerías'))
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

  async function handleDelete(id: string) {
    if (!window.confirm('¿Eliminar esta galería?')) return
    try {
      await deleteGallery(id)
      setGalleries(prev => prev.filter(g => g.id !== id))
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al eliminar')
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1a1a2e', margin: 0 }}>Galerías</h2>
        <button onClick={openCreate} style={btnStyle('#1a1a2e')}>+ Nueva galería</button>
      </div>

      {error && <p style={{ color: '#ef4444', marginBottom: 16, fontSize: 13 }}>{error}</p>}

      {showForm && (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: 24, marginBottom: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20, color: '#1a1a2e' }}>
            {editingId ? 'Editar galería' : 'Nueva galería'}
          </h3>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Field label="Título" style={{ gridColumn: '1 / -1' }}>
              <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required style={inputStyle} />
            </Field>
            <Field label="Categoría">
              <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value as GalleryCategory }))} style={inputStyle}>
                {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
              </select>
            </Field>
            <Field label="Fecha del partido">
              <input type="date" value={form.match_date} onChange={e => setForm(p => ({ ...p, match_date: e.target.value }))} required style={inputStyle} />
            </Field>
            <Field label="URL imagen de portada" style={{ gridColumn: '1 / -1' }}>
              <input value={form.cover_image} onChange={e => setForm(p => ({ ...p, cover_image: e.target.value }))} required style={inputStyle} />
            </Field>
            {form.cover_image && (
              <div style={{ gridColumn: '1 / -1' }}>
                <img
                  src={form.cover_image}
                  alt="Preview portada"
                  style={{ maxHeight: 120, maxWidth: '100%', borderRadius: 6, objectFit: 'cover', border: '1px solid #e5e7eb' }}
                />
              </div>
            )}
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
        <p style={{ color: '#6b7280', fontSize: 14 }}>Cargando...</p>
      ) : galleries.length === 0 ? (
        <p style={{ color: '#6b7280', fontSize: 14 }}>No hay galerías todavía.</p>
      ) : (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
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
                    <span style={{
                      display: 'inline-block',
                      padding: '2px 10px',
                      borderRadius: 12,
                      fontSize: 12,
                      fontWeight: 600,
                      background: '#f3f4f6',
                      color: '#374151',
                    }}>
                      {CATEGORY_LABELS[g.category]}
                    </span>
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
      )}
    </div>
  )
}

function Field({ label, children, style }: { label: string; children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5, ...style }}>
      <label style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>{label}</label>
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

export default GalleriesPage

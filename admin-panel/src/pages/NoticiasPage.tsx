import { useEffect, useState, useRef } from 'react'
import type { News, CreateNewsDTO, UpdateNewsDTO } from '../types/news'
import { getNews, createNews, updateNews, deleteNews } from '../services/newsService'
import { uploadImage } from '../services/storageService'
import DataTable, { type DataTableColumn } from '../components/admin/DataTable'
import ActionMenu from '../components/admin/ActionMenu'
import StatusBadge from '../components/admin/StatusBadge'
import FormActions from '../components/admin/FormActions'

const EMPTY_FORM: CreateNewsDTO = {
  title: '',
  excerpt: '',
  content: '',
  image_url: '',
  published: false,
}

const COLUMNS: DataTableColumn[] = [
  { key: 'title', label: 'Título' },
  { key: 'date', label: 'Fecha' },
  { key: 'status', label: 'Estado' },
  { key: 'actions', label: 'Acciones', width: 140 },
]

type FormData = CreateNewsDTO

function NoticiasPage() {
  const [news, setNews] = useState<News[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormData>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setLoading(true)
    getNews()
      .then(data => { setNews(data); setError(null) })
      .catch(e => setError(e instanceof Error ? e.message : 'Error al cargar noticias'))
      .finally(() => setLoading(false))
  }, [refreshKey])

  function reload() { setRefreshKey(k => k + 1) }

  function openCreate() {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setImageFile(null)
    setShowForm(true)
  }

  function openEdit(item: News) {
    setEditingId(item.id)
    setForm({
      title: item.title,
      excerpt: item.excerpt,
      content: item.content,
      image_url: item.image_url,
      published: item.published,
    })
    setImageFile(null)
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setEditingId(null)
    setForm(EMPTY_FORM)
    setImageFile(null)
  }

  async function handleUploadImage() {
    if (!imageFile) return
    setUploading(true)
    try {
      const { publicUrl } = await uploadImage(imageFile, 'news')
      setForm(p => ({ ...p, image_url: publicUrl }))
      setImageFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al subir imagen')
    } finally {
      setUploading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      if (editingId) {
        const dto: UpdateNewsDTO = form
        await updateNews(editingId, dto)
      } else {
        await createNews(form)
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
    if (!window.confirm('¿Eliminar esta noticia?')) return
    try {
      await deleteNews(id)
      setNews(prev => prev.filter(n => n.id !== id))
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al eliminar')
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1a1a2e', margin: 0 }}>Noticias</h2>
        <button onClick={openCreate} style={btnStyle('#1a1a2e')}>+ Nueva noticia</button>
      </div>

      {error && <p style={{ color: '#ef4444', marginBottom: 16, fontSize: 13 }} role="alert">{error}</p>}

      {showForm && (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: 24, marginBottom: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20, color: '#1a1a2e' }}>
            {editingId ? 'Editar noticia' : 'Nueva noticia'}
          </h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Field label="Título" htmlFor="news-title">
              <input
                id="news-title"
                value={form.title}
                onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                required
                style={inputStyle}
              />
            </Field>
            <Field label="Extracto" htmlFor="news-excerpt">
              <input
                id="news-excerpt"
                value={form.excerpt}
                onChange={e => setForm(p => ({ ...p, excerpt: e.target.value }))}
                required
                style={inputStyle}
              />
            </Field>
            <Field label="Contenido" htmlFor="news-content">
              <textarea
                id="news-content"
                value={form.content}
                onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
                required
                rows={5}
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </Field>
            <Field label="Imagen" htmlFor="news-image">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input
                    ref={fileInputRef}
                    id="news-image"
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
                {form.image_url && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <img
                      src={form.image_url}
                      alt="Preview"
                      style={{ maxHeight: 120, maxWidth: '100%', borderRadius: 6, objectFit: 'cover', border: '1px solid #e5e7eb' }}
                    />
                    <span style={{ fontSize: 11, color: '#6b7280', wordBreak: 'break-all' }}>{form.image_url}</span>
                  </div>
                )}
              </div>
            </Field>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
              <input
                type="checkbox"
                checked={form.published}
                onChange={e => setForm(p => ({ ...p, published: e.target.checked }))}
              />
              Publicada
            </label>
            <FormActions saving={saving} onCancel={closeForm} />
          </form>
        </div>
      )}

      {loading ? (
        <p style={{ color: '#6b7280', fontSize: 14 }} role="status" aria-live="polite">Cargando...</p>
      ) : news.length === 0 ? (
        <p style={{ color: '#6b7280', fontSize: 14 }}>No hay noticias todavía.</p>
      ) : (
        <DataTable
          columns={COLUMNS}
          rows={news}
          keyField={item => item.id}
          renderCell={(item, column) => {
            switch (column.key) {
              case 'title':
                return item.title
              case 'date':
                return new Date(item.created_at).toLocaleDateString('es-AR')
              case 'status':
                return <StatusBadge label={item.published ? 'Publicada' : 'Borrador'} tone={item.published ? 'green' : 'gray'} />
              case 'actions':
                return <ActionMenu onEdit={() => openEdit(item)} onDelete={() => handleDelete(item.id)} />
              default:
                return null
            }
          }}
        />
      )}
    </div>
  )
}

function Field({ label, htmlFor, children }: { label: string; htmlFor?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
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

export default NoticiasPage

import { useEffect, useState } from 'react'
import type { News, CreateNewsDTO, UpdateNewsDTO } from '../types/news'
import { getNews, createNews, updateNews, deleteNews } from '../services/newsService'
import { useAuth } from '../context/AuthContext'
import Input from '../components/ui/Input'
import Textarea from '../components/ui/Textarea'
import EmptyState from '../components/ui/EmptyState'
import LoadingState from '../components/ui/LoadingState'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import ImageUploader from '../components/media/ImageUploader'
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
  const { user } = useAuth()
  const [news, setNews] = useState<News[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormData>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
const [confirmId, setConfirmId] = useState<string | null>(null)

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      if (editingId) {
        const dto: UpdateNewsDTO = form
        await updateNews(editingId, dto)
      } else {
        await createNews({ ...form, author_id: user?.id ?? null })
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
      await deleteNews(confirmId)
      setNews(prev => prev.filter(n => n.id !== confirmId))
      setConfirmId(null)
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
              <Input
                id="news-title"
                value={form.title}
                onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                required
              />
            </Field>
            <Field label="Extracto" htmlFor="news-excerpt">
              <Input
                id="news-excerpt"
                value={form.excerpt}
                onChange={e => setForm(p => ({ ...p, excerpt: e.target.value }))}
                required
              />
            </Field>
            <Field label="Contenido" htmlFor="news-content">
              <Textarea
                id="news-content"
                value={form.content}
                onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
                required
                rows={5}
              />
            </Field>
            <Field label="Imagen" htmlFor="news-image">
              <ImageUploader
                id="news-image"
                folder="news"
                value={form.image_url}
                onChange={url => setForm(p => ({ ...p, image_url: url }))}
                aspectRatio={4 / 3}
                label="Imagen"
              />
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
        <LoadingState />
      ) : news.length === 0 ? (
        <EmptyState message="No hay noticias todavía." />
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

      {confirmId && (
        <ConfirmDialog
          title="Eliminar noticia"
          message="¿Eliminar esta noticia?"
          onCancel={() => setConfirmId(null)}
          onConfirm={performDelete}
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

function btnStyle(bg: string): React.CSSProperties {
  return {
    padding: '9px 18px',
    background: bg,
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
  }
}

export default NoticiasPage

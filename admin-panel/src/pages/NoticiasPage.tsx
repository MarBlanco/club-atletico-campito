import { useEffect, useState, useRef } from 'react'
import type { News, CreateNewsDTO, UpdateNewsDTO } from '../types/news'
import { getNews, createNews, updateNews, deleteNews } from '../services/newsService'
import { uploadImage } from '../services/storageService'
import { useAuth } from '../context/AuthContext'
import Input from '../components/ui/Input'
import Textarea from '../components/ui/Textarea'
import Badge from '../components/ui/Badge'
import EmptyState from '../components/ui/EmptyState'
import LoadingState from '../components/ui/LoadingState'
import ConfirmDialog from '../components/ui/ConfirmDialog'

const EMPTY_FORM: CreateNewsDTO = {
  title: '',
  excerpt: '',
  content: '',
  image_url: '',
  published: false,
}

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
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [confirmId, setConfirmId] = useState<string | null>(null)
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
            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              <button type="submit" disabled={saving} style={btnStyle('#1a1a2e')}>
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
              <button type="button" onClick={closeForm} style={btnStyle('#6b7280')}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <LoadingState />
      ) : news.length === 0 ? (
        <EmptyState message="No hay noticias todavía." />
      ) : (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                <th style={thStyle}>Título</th>
                <th style={thStyle}>Fecha</th>
                <th style={thStyle}>Estado</th>
                <th style={{ ...thStyle, width: 140 }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {news.map((item, i) => (
                <tr key={item.id} style={{ borderBottom: i < news.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                  <td style={tdStyle}>{item.title}</td>
                  <td style={tdStyle}>{new Date(item.created_at).toLocaleDateString('es-AR')}</td>
                  <td style={tdStyle}>
                    <Badge variant={item.published ? 'green' : 'gray'}>
                      {item.published ? 'Publicada' : 'Borrador'}
                    </Badge>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => openEdit(item)} style={btnSmall('#3b82f6')}>Editar</button>
                      <button onClick={() => handleDelete(item.id)} style={btnSmall('#ef4444')}>Eliminar</button>
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

function btnSmall(bg: string): React.CSSProperties {
  return {
    padding: '5px 12px',
    background: bg,
    color: '#fff',
    border: 'none',
    borderRadius: 5,
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
  }
}

export default NoticiasPage

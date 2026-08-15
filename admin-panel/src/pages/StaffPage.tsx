import { useEffect, useState, useRef } from 'react'
import { useIsMobile } from '../hooks/useMediaQuery'
import type { Staff, CreateStaffDTO, UpdateStaffDTO, StaffCategory } from '../types/staff'
import { getStaff, createStaff, updateStaff, deleteStaff } from '../services/staffService'
import { uploadImage } from '../services/storageService'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import Badge from '../components/ui/Badge'
import EmptyState from '../components/ui/EmptyState'
import LoadingState from '../components/ui/LoadingState'
import ConfirmDialog from '../components/ui/ConfirmDialog'

const CATEGORIES: StaffCategory[] = ['primera', 'infanto', 'directivos']

const CATEGORY_LABELS: Record<StaffCategory, string> = {
  primera: 'Primera',
  infanto: 'Infanto Juvenil',
  directivos: 'Directivos',
}

const EMPTY_FORM: CreateStaffDTO = {
  name: '',
  role: '',
  category: 'primera',
  image_url: null,
  active: true,
}

function StaffPage() {
  const isMobile = useIsMobile()
  const [staff, setStaff] = useState<Staff[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<CreateStaffDTO>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
const [imageFile, setImageFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)

  useEffect(() => {
    getStaff()
      .then(data => { setStaff(data); setError(null) })
      .catch(e => setError(e instanceof Error ? e.message : 'Error al cargar staff'))
      .finally(() => setLoading(false))
  }, [refreshKey])

  function reload() { setRefreshKey(k => k + 1) }

  function openCreate() {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setShowForm(true)
  }

  function openEdit(s: Staff) {
    setEditingId(s.id)
    setForm({
      name: s.name,
      role: s.role,
      category: s.category,
      image_url: s.image_url,
      active: s.active,
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
        const dto: UpdateStaffDTO = form
        await updateStaff(editingId, dto)
      } else {
        await createStaff(form)
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
      await deleteStaff(confirmId)
      setStaff(prev => prev.filter(s => s.id !== confirmId))
      setConfirmId(null)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al eliminar')
    }
  }

  async function handleUploadImage() {
    if (!imageFile) return
    setUploading(true)
    try {
      const { publicUrl } = await uploadImage(imageFile, 'staff')
      setForm(p => ({ ...p, image_url: publicUrl }))
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
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1a1a2e', margin: 0 }}>Staff</h2>
        <button onClick={openCreate} style={btnStyle('#1a1a2e')}>+ Nuevo miembro</button>
      </div>

      {error && <p style={{ color: '#ef4444', marginBottom: 16, fontSize: 13 }} role="alert">{error}</p>}

      {showForm && (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: 24, marginBottom: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20, color: '#1a1a2e' }}>
            {editingId ? 'Editar miembro' : 'Nuevo miembro'}
          </h3>
<form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 14 }}>
            <Field label="Nombre" htmlFor="staff-name">
              <Input id="staff-name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
            </Field>
            <Field label="Rol" htmlFor="staff-role">
              <Input id="staff-role" value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))} required />
            </Field>
            <Field label="Categoría" htmlFor="staff-category">
              <Select id="staff-category" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value as StaffCategory }))}>
                {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
              </Select>
            </Field>
            <Field label="URL de imagen (opcional)" htmlFor="staff-image">
              <Input
                id="staff-image"
                value={form.image_url ?? ''}
                onChange={e => setForm(p => ({ ...p, image_url: e.target.value || null }))}
              />
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
              {form.image_url && (
                <img
                  src={form.image_url}
                  alt="Preview"
                  style={{ maxHeight: 120, maxWidth: '100%', borderRadius: 6, objectFit: 'cover', border: '1px solid #e5e7eb' }}
                />
              )}
            </Field>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
                <input type="checkbox" checked={form.active} onChange={e => setForm(p => ({ ...p, active: e.target.checked }))} />
                Activo
              </label>
            </div>
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
      ) : staff.length === 0 ? (
        <EmptyState message="No hay miembros del staff todavía." />
      ) : (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                <th style={thStyle}>Nombre</th>
                <th style={thStyle}>Rol</th>
                <th style={thStyle}>Categoría</th>
                <th style={thStyle}>Estado</th>
                <th style={{ ...thStyle, width: 140 }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {staff.map((s, i) => (
                <tr key={s.id} style={{ borderBottom: i < staff.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                  <td style={{ ...tdStyle, fontWeight: 600 }}>{s.name}</td>
                  <td style={tdStyle}>{s.role}</td>
                  <td style={tdStyle}>{CATEGORY_LABELS[s.category]}</td>
                  <td style={tdStyle}>
                    <Badge variant={s.active ? 'green' : 'gray'}>
                      {s.active ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => openEdit(s)} style={btnSmall('#3b82f6')}>Editar</button>
                      <button onClick={() => handleDelete(s.id)} style={btnSmall('#ef4444')}>Eliminar</button>
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
          title="Eliminar miembro"
          message="¿Eliminar este miembro del staff?"
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

export default StaffPage

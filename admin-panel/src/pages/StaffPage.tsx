import { useEffect, useState, useRef } from 'react'
import { useIsMobile } from '../hooks/useMediaQuery'
import type { Staff, CreateStaffDTO, UpdateStaffDTO, StaffCategory } from '../types/staff'
import { getStaff, createStaff, updateStaff, deleteStaff } from '../services/staffService'
import { uploadImage } from '../services/storageService'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import EmptyState from '../components/ui/EmptyState'
import LoadingState from '../components/ui/LoadingState'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import DataTable, { type DataTableColumn } from '../components/admin/DataTable'
import ActionMenu from '../components/admin/ActionMenu'
import StatusBadge from '../components/admin/StatusBadge'
import FormActions from '../components/admin/FormActions'

const CATEGORIES: StaffCategory[] = ['primera', 'infanto', 'directivos']

const CATEGORY_LABELS: Record<StaffCategory, string> = {
  primera: 'Primera',
  infanto: 'Infanto Juvenil',
  directivos: 'Directivos',
}

const COLUMNS: DataTableColumn[] = [
  { key: 'name', label: 'Nombre' },
  { key: 'role', label: 'Rol' },
  { key: 'category', label: 'Categoría' },
  { key: 'status', label: 'Estado' },
  { key: 'actions', label: 'Acciones', width: 140 },
]

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
            <div style={{ gridColumn: '1 / -1' }}>
              <FormActions saving={saving} onCancel={closeForm} style={{ gridColumn: '1 / -1', marginTop: 0 }} />
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <LoadingState />
      ) : staff.length === 0 ? (
        <EmptyState message="No hay miembros del staff todavía." />
      ) : (
<DataTable
          columns={COLUMNS}
          rows={staff}
          keyField={s => s.id}
          renderCell={(s, column) => {
            switch (column.key) {
              case 'name':
                return <span style={{ fontWeight: 600 }}>{s.name}</span>
              case 'role':
                return s.role
              case 'category':
                return <StatusBadge label={CATEGORY_LABELS[s.category]} tone="gray" />
              case 'status':
                return <StatusBadge label={s.active ? 'Activo' : 'Inactivo'} tone={s.active ? 'green' : 'gray'} />
              case 'actions':
                return <ActionMenu onEdit={() => openEdit(s)} onDelete={() => handleDelete(s.id)} />
              default:
                return null
            }
          }}
        />
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

function btnStyle(bg: string): React.CSSProperties {
  return { padding: '9px 18px', background: bg, color: '#fff', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer' }
}

export default StaffPage

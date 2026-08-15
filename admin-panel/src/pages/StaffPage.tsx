import { useEffect, useState } from 'react'
import { useIsMobile } from '../hooks/useMediaQuery'
import type { Staff, CreateStaffDTO, UpdateStaffDTO, StaffCategory } from '../types/staff'
import { getStaff, createStaff, updateStaff, deleteStaff } from '../services/staffService'
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

  async function handleDelete(id: string) {
    if (!window.confirm('¿Eliminar este miembro del staff?')) return
    try {
      await deleteStaff(id)
      setStaff(prev => prev.filter(s => s.id !== id))
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al eliminar')
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
              <input id="staff-name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required style={inputStyle} />
            </Field>
            <Field label="Rol" htmlFor="staff-role">
              <input id="staff-role" value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))} required style={inputStyle} />
            </Field>
            <Field label="Categoría" htmlFor="staff-category">
              <select id="staff-category" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value as StaffCategory }))} style={inputStyle}>
                {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
              </select>
            </Field>
            <Field label="URL de imagen (opcional)" htmlFor="staff-image">
              <input
                id="staff-image"
                value={form.image_url ?? ''}
                onChange={e => setForm(p => ({ ...p, image_url: e.target.value || null }))}
                style={inputStyle}
              />
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
        <p style={{ color: '#6b7280', fontSize: 14 }} role="status" aria-live="polite">Cargando...</p>
      ) : staff.length === 0 ? (
        <p style={{ color: '#6b7280', fontSize: 14 }}>No hay miembros del staff todavía.</p>
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

export default StaffPage

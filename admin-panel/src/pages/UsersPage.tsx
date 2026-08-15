import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import type { AdminUser, UserRole } from '../types/user'
import {
  getAdminUsers,
  adminCreateUser,
  adminUpdateUser,
  adminUpdateUserPassword,
  adminSetUserBanned,
  adminDeleteUser,
} from '../services/usersService'
import Modal from '../components/ui/Modal'
import Input from '../components/ui/Input'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import LoadingState from '../components/ui/LoadingState'
import EmptyState from '../components/ui/EmptyState'
import FormActions from '../components/admin/FormActions'

const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Admin',
  colaborador: 'Colaborador',
}

type ModalState =
  | { kind: 'create' }
  | { kind: 'edit'; user: AdminUser }
  | { kind: 'password'; user: AdminUser }
  | { kind: 'ban'; user: AdminUser }
  | { kind: 'delete'; user: AdminUser }
  | null

const EMPTY_CREATE = { name: '', email: '', password: '', confirm: '' }
const EMPTY_PASSWORD = { password: '', confirm: '' }

function UsersPage() {
  const { role, user } = useAuth()
  const isAdmin = role === 'admin'

  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const [modal, setModal] = useState<ModalState>(null)
  const [createForm, setCreateForm] = useState(EMPTY_CREATE)
  const [editForm, setEditForm] = useState({ name: '', email: '' })
  const [passwordForm, setPasswordForm] = useState(EMPTY_PASSWORD)
  const [saving, setSaving] = useState(false)
  const [modalError, setModalError] = useState<string | null>(null)

  useEffect(() => {
    getAdminUsers()
      .then(data => { setUsers(data); setError(null) })
      .catch(e => setError(e instanceof Error ? e.message : 'Error al cargar usuarios'))
      .finally(() => setLoading(false))
  }, [refreshKey])

  function reload() { setRefreshKey(k => k + 1) }

  function openCreate() {
    setCreateForm(EMPTY_CREATE)
    setModalError(null)
    setModal({ kind: 'create' })
  }

  function openEdit(u: AdminUser) {
    setEditForm({ name: u.name, email: u.email })
    setModalError(null)
    setModal({ kind: 'edit', user: u })
  }

  function openPassword(u: AdminUser) {
    setPasswordForm(EMPTY_PASSWORD)
    setModalError(null)
    setModal({ kind: 'password', user: u })
  }

  function openBan(u: AdminUser) {
    setModalError(null)
    setModal({ kind: 'ban', user: u })
  }

  function openDelete(u: AdminUser) {
    setModalError(null)
    setModal({ kind: 'delete', user: u })
  }

  function closeModal() {
    setModal(null)
    setSaving(false)
    setModalError(null)
  }

  function validateEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  function validatePassword(password: string, confirm: string) {
    if (password.length < 6) return 'La contraseña debe tener al menos 6 caracteres'
    if (password !== confirm) return 'Las contraseñas no coinciden'
    return null
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    const name = createForm.name.trim()
    const email = createForm.email.trim()
    if (!name) { setModalError('El nombre es obligatorio'); return }
    if (!validateEmail(email)) { setModalError('Email inválido'); return }
    const pwError = validatePassword(createForm.password, createForm.confirm)
    if (pwError) { setModalError(pwError); return }

    setSaving(true)
    setModalError(null)
    try {
      await adminCreateUser({ name, email, password: createForm.password })
      closeModal()
      reload()
    } catch (e: unknown) {
      setModalError(e instanceof Error ? e.message : 'Error al crear colaborador')
      setSaving(false)
    }
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault()
    if (!modal || modal.kind !== 'edit') return
    const name = editForm.name.trim()
    const email = editForm.email.trim()
    if (!name) { setModalError('El nombre es obligatorio'); return }
    if (!validateEmail(email)) { setModalError('Email inválido'); return }

    setSaving(true)
    setModalError(null)
    try {
      await adminUpdateUser(modal.user.id, { name, email })
      closeModal()
      reload()
    } catch (e: unknown) {
      setModalError(e instanceof Error ? e.message : 'Error al editar colaborador')
      setSaving(false)
    }
  }

  async function handlePassword(e: React.FormEvent) {
    e.preventDefault()
    if (!modal || modal.kind !== 'password') return
    const pwError = validatePassword(passwordForm.password, passwordForm.confirm)
    if (pwError) { setModalError(pwError); return }

    setSaving(true)
    setModalError(null)
    try {
      await adminUpdateUserPassword(modal.user.id, passwordForm.password)
      closeModal()
    } catch (e: unknown) {
      setModalError(e instanceof Error ? e.message : 'Error al cambiar la contraseña')
      setSaving(false)
    }
  }

  async function performBan() {
    if (!modal || modal.kind !== 'ban') return
    const target = modal.user
    setSaving(true)
    setModalError(null)
    try {
      await adminSetUserBanned(target.id, !target.banned)
      closeModal()
      reload()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al cambiar el estado del usuario')
      setSaving(false)
      closeModal()
    }
  }

  async function performDelete() {
    if (!modal || modal.kind !== 'delete') return
    const target = modal.user
    setSaving(true)
    setModalError(null)
    try {
      await adminDeleteUser(target.id)
      setUsers(prev => prev.filter(u => u.id !== target.id))
      closeModal()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al eliminar usuario')
      setSaving(false)
      closeModal()
    }
  }

  function formatDate(value: string) {
    return new Date(value).toLocaleDateString()
  }

  function renderModal() {
    if (!modal) return null
    if (modal.kind === 'create') {
      return (
        <Modal title="Nuevo colaborador" onClose={closeModal}>
          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Field label="Nombre" htmlFor="user-name">
              <Input id="user-name" value={createForm.name} onChange={e => setCreateForm(p => ({ ...p, name: e.target.value }))} required autoFocus />
            </Field>
            <Field label="Email" htmlFor="user-email">
              <Input id="user-email" type="email" value={createForm.email} onChange={e => setCreateForm(p => ({ ...p, email: e.target.value }))} required />
            </Field>
            <Field label="Contraseña" htmlFor="user-password">
              <Input id="user-password" type="password" value={createForm.password} onChange={e => setCreateForm(p => ({ ...p, password: e.target.value }))} required />
            </Field>
            <Field label="Confirmar contraseña" htmlFor="user-password-confirm">
              <Input id="user-password-confirm" type="password" value={createForm.confirm} onChange={e => setCreateForm(p => ({ ...p, confirm: e.target.value }))} required />
            </Field>
            {modalError && <p style={errorText} role="alert">{modalError}</p>}
            <FormActions saving={saving} saveLabel="Crear" savingLabel="Creando..." onCancel={closeModal} />
          </form>
        </Modal>
      )
    }

    if (modal.kind === 'edit') {
      return (
        <Modal title={`Editar colaborador`} onClose={closeModal}>
          <form onSubmit={handleEdit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Field label="Nombre" htmlFor="user-name">
              <Input id="user-name" value={editForm.name} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))} required autoFocus />
            </Field>
            <Field label="Email" htmlFor="user-email">
              <Input id="user-email" type="email" value={editForm.email} onChange={e => setEditForm(p => ({ ...p, email: e.target.value }))} required />
            </Field>
            {modalError && <p style={errorText} role="alert">{modalError}</p>}
            <FormActions saving={saving} onCancel={closeModal} />
          </form>
        </Modal>
      )
    }

    if (modal.kind === 'password') {
      return (
        <Modal title={`Cambiar contraseña`} onClose={closeModal}>
          <p style={{ color: '#374151', fontSize: 13, margin: '0 0 4px' }}>
            Colaborador: <strong>{modal.user.name}</strong>
          </p>
          <form onSubmit={handlePassword} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Field label="Nueva contraseña" htmlFor="user-password">
              <Input id="user-password" type="password" value={passwordForm.password} onChange={e => setPasswordForm(p => ({ ...p, password: e.target.value }))} required autoFocus />
            </Field>
            <Field label="Confirmar contraseña" htmlFor="user-password-confirm">
              <Input id="user-password-confirm" type="password" value={passwordForm.confirm} onChange={e => setPasswordForm(p => ({ ...p, confirm: e.target.value }))} required />
            </Field>
            {modalError && <p style={errorText} role="alert">{modalError}</p>}
            <FormActions saving={saving} saveLabel="Cambiar contraseña" savingLabel="Cambiando..." onCancel={closeModal} />
          </form>
        </Modal>
      )
    }

    if (modal.kind === 'ban') {
      return (
        <ConfirmDialog
          title={modal.user.banned ? 'Reactivar acceso' : 'Desactivar acceso'}
          message={
            modal.user.banned
              ? `¿Reactivar el acceso de ${modal.user.name}?`
              : `¿Desactivar el acceso de ${modal.user.name}? Podrá volver a activarse cuando se necesite.`
          }
          confirmLabel={modal.user.banned ? 'Reactivar' : 'Desactivar'}
          onCancel={closeModal}
          onConfirm={performBan}
        />
      )
    }

    return (
      <ConfirmDialog
        title="Eliminar colaborador"
        message={`¿Eliminar definitivamente a ${modal.user.name}? No podrá volver a acceder.`}
        onCancel={closeModal}
        onConfirm={performDelete}
      />
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1a1a2e', margin: 0 }}>Usuarios</h2>
        {isAdmin && (
          <button onClick={openCreate} style={btnStyle('#1a1a2e')}>+ Nuevo colaborador</button>
        )}
      </div>

      {error && <p style={{ color: '#ef4444', marginBottom: 16, fontSize: 13 }} role="alert">{error}</p>}

      {loading ? (
        <LoadingState />
      ) : users.length === 0 ? (
        <EmptyState message="No hay usuarios todavía." />
      ) : (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                  <th style={thStyle}>Nombre</th>
                  <th style={thStyle}>Email</th>
                  <th style={thStyle}>Rol</th>
                  <th style={thStyle}>Estado</th>
                  <th style={thStyle}>Creado</th>
                  <th style={thStyle}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => {
                  const isSelf = user?.id === u.id
                  return (
                    <tr key={u.id} style={{ borderBottom: i < users.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                      <td style={{ ...tdStyle, fontWeight: 600 }}>
                        {u.name}
                        {isSelf && <span style={{ color: '#6b7280', fontSize: 12, fontWeight: 500 }}> (vos)</span>}
                      </td>
                      <td style={tdStyle}>{u.email}</td>
                      <td style={tdStyle}>
                        <span style={badgeStyle(u.role)}>{ROLE_LABELS[u.role]}</span>
                      </td>
                      <td style={tdStyle}>
                        {u.banned
                          ? <span style={badgeStyle('banned')}>Desactivado</span>
                          : <span style={badgeStyle('active')}>Activo</span>}
                      </td>
                      <td style={tdStyle}>{formatDate(u.created_at)}</td>
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          <button onClick={() => openEdit(u)} style={btnSmall('#3b82f6')}>Editar</button>
                          <button onClick={() => openPassword(u)} style={btnSmall('#d97706')}>Contraseña</button>
                          {!isSelf && (
                            <>
                              <button onClick={() => openBan(u)} style={btnSmall(u.banned ? '#059669' : '#6b7280')}>
                                {u.banned ? 'Reactivar' : 'Desactivar'}
                              </button>
                              <button onClick={() => openDelete(u)} style={btnSmall('#ef4444')}>Eliminar</button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {renderModal()}
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

function badgeStyle(tone: UserRole | 'active' | 'banned'): React.CSSProperties {
  const palette: Record<string, { bg: string; color: string }> = {
    admin: { bg: '#dbeafe', color: '#1d4ed8' },
    colaborador: { bg: '#f3f4f6', color: '#6b7280' },
    active: { bg: '#d1fae5', color: '#047857' },
    banned: { bg: '#fee2e2', color: '#b91c1c' },
  }
  const p = palette[tone]
  return {
    display: 'inline-block',
    padding: '2px 10px',
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 600,
    background: p.bg,
    color: p.color,
  }
}

function btnStyle(bg: string): React.CSSProperties {
  return { padding: '9px 18px', background: bg, color: '#fff', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer' }
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

const errorText: React.CSSProperties = {
  color: '#ef4444',
  fontSize: 13,
  margin: 0,
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

export default UsersPage
import { useEffect, useState } from 'react'
import type { AppUser, UserRole } from '../types/user'
import { getUsers } from '../services/usersService'

const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Admin',
  colaborador: 'Colaborador',
}

function UsersPage() {
  const [users, setUsers] = useState<AppUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getUsers()
      .then(data => { setUsers(data); setError(null) })
      .catch(e => setError(e instanceof Error ? e.message : 'Error al cargar usuarios'))
      .finally(() => setLoading(false))
  }, [])

  function formatDate(value: string) {
    return new Date(value).toLocaleDateString()
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1a1a2e', margin: 0 }}>Usuarios</h2>
      </div>

      {error && <p style={{ color: '#ef4444', marginBottom: 16, fontSize: 13 }} role="alert">{error}</p>}

      {loading ? (
        <p style={{ color: '#6b7280', fontSize: 14 }} role="status" aria-live="polite">Cargando...</p>
      ) : users.length === 0 ? (
        <p style={{ color: '#6b7280', fontSize: 14 }}>No hay usuarios todavía.</p>
      ) : (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                  <th style={thStyle}>Nombre</th>
                  <th style={thStyle}>Email</th>
                  <th style={thStyle}>Rol</th>
                  <th style={thStyle}>Creado</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <tr key={u.id} style={{ borderBottom: i < users.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                    <td style={{ ...tdStyle, fontWeight: 600 }}>{u.name}</td>
                    <td style={tdStyle}>{u.email}</td>
                    <td style={tdStyle}>
                      <span style={badgeStyle(u.role)}>{ROLE_LABELS[u.role]}</span>
                    </td>
                    <td style={tdStyle}>{formatDate(u.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

function badgeStyle(role: UserRole): React.CSSProperties {
  const isAdmin = role === 'admin'
  return {
    display: 'inline-block',
    padding: '2px 10px',
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 600,
    background: isAdmin ? '#dbeafe' : '#f3f4f6',
    color: isAdmin ? '#1d4ed8' : '#6b7280',
  }
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
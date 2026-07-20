import { useEffect, useState } from 'react'
import type { Player, CreatePlayerDTO, UpdatePlayerDTO } from '../types/players'
import type { Position } from '../types/players'
import { getPlayers, createPlayer, updatePlayer, deletePlayer } from '../services/playersService'

const POSITIONS: Position[] = ['Arquero', 'Defensor', 'Mediocampista', 'Delantero']

const EMPTY_FORM: CreatePlayerDTO = {
  name: '',
  surname: '',
  number: 0,
  position: 'Defensor',
  image_url: '',
  active: true,
}

function JugadoresPage() {
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<CreatePlayerDTO>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setLoading(true)
    getPlayers()
      .then(data => { setPlayers(data); setError(null) })
      .catch(e => setError(e instanceof Error ? e.message : 'Error al cargar jugadores'))
      .finally(() => setLoading(false))
  }, [refreshKey])

  function reload() { setRefreshKey(k => k + 1) }

  function openCreate() {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setShowForm(true)
  }

  function openEdit(p: Player) {
    setEditingId(p.id)
    setForm({
      name: p.name,
      surname: p.surname,
      number: p.number,
      position: p.position,
      image_url: p.image_url,
      active: p.active,
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
        const dto: UpdatePlayerDTO = form
        await updatePlayer(editingId, dto)
      } else {
        await createPlayer(form)
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
    if (!window.confirm('¿Eliminar este jugador?')) return
    try {
      await deletePlayer(id)
      setPlayers(prev => prev.filter(p => p.id !== id))
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al eliminar')
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1a1a2e', margin: 0 }}>Jugadores</h2>
        <button onClick={openCreate} style={btnStyle('#1a1a2e')}>+ Nuevo jugador</button>
      </div>

      {error && <p style={{ color: '#ef4444', marginBottom: 16, fontSize: 13 }}>{error}</p>}

      {showForm && (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: 24, marginBottom: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20, color: '#1a1a2e' }}>
            {editingId ? 'Editar jugador' : 'Nuevo jugador'}
          </h3>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Field label="Nombre">
              <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required style={inputStyle} />
            </Field>
            <Field label="Apellido">
              <input value={form.surname} onChange={e => setForm(p => ({ ...p, surname: e.target.value }))} required style={inputStyle} />
            </Field>
            <Field label="Número">
              <input type="number" min={0} max={99} value={form.number} onChange={e => setForm(p => ({ ...p, number: Number(e.target.value) }))} required style={inputStyle} />
            </Field>
            <Field label="Posición">
              <select value={form.position} onChange={e => setForm(p => ({ ...p, position: e.target.value as Position }))} style={inputStyle}>
                {POSITIONS.map(pos => <option key={pos} value={pos}>{pos}</option>)}
              </select>
            </Field>
            <Field label="URL de imagen" style={{ gridColumn: '1 / -1' }}>
              <input value={form.image_url} onChange={e => setForm(p => ({ ...p, image_url: e.target.value }))} required style={inputStyle} />
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
        <p style={{ color: '#6b7280', fontSize: 14 }}>Cargando...</p>
      ) : players.length === 0 ? (
        <p style={{ color: '#6b7280', fontSize: 14 }}>No hay jugadores todavía.</p>
      ) : (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                <th style={thStyle}>#</th>
                <th style={thStyle}>Apellido</th>
                <th style={thStyle}>Nombre</th>
                <th style={thStyle}>Posición</th>
                <th style={thStyle}>Estado</th>
                <th style={{ ...thStyle, width: 140 }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {players.map((p, i) => (
                <tr key={p.id} style={{ borderBottom: i < players.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                  <td style={tdStyle}>{p.number}</td>
                  <td style={{ ...tdStyle, fontWeight: 600 }}>{p.surname}</td>
                  <td style={tdStyle}>{p.name}</td>
                  <td style={tdStyle}>{p.position}</td>
                  <td style={tdStyle}>
                    <span style={{
                      display: 'inline-block',
                      padding: '2px 10px',
                      borderRadius: 12,
                      fontSize: 12,
                      fontWeight: 600,
                      background: p.active ? '#dcfce7' : '#f3f4f6',
                      color: p.active ? '#16a34a' : '#6b7280',
                    }}>
                      {p.active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => openEdit(p)} style={btnSmall('#3b82f6')}>Editar</button>
                      <button onClick={() => handleDelete(p.id)} style={btnSmall('#ef4444')}>Eliminar</button>
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

export default JugadoresPage

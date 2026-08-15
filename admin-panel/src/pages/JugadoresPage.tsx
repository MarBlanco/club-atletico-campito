import { useEffect, useState, useRef } from 'react'
import { useIsMobile } from '../hooks/useMediaQuery'
import type { Player, CreatePlayerDTO, UpdatePlayerDTO } from '../types/players'
import type { Position } from '../types/players'
import { getPlayers, createPlayer, updatePlayer, deletePlayer } from '../services/playersService'
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

const POSITIONS: Position[] = ['Arquero', 'Defensor', 'Mediocampista', 'Delantero']

const COLUMNS: DataTableColumn[] = [
  { key: 'number', label: '#' },
  { key: 'surname', label: 'Apellido' },
  { key: 'name', label: 'Nombre' },
  { key: 'position', label: 'Posición' },
  { key: 'status', label: 'Estado' },
  { key: 'actions', label: 'Acciones', width: 140 },
]

const EMPTY_FORM: CreatePlayerDTO = {
  name: '',
  surname: '',
  number: 0,
  position: 'Defensor',
  image_url: '',
  active: true,
}

function JugadoresPage() {
  const isMobile = useIsMobile()
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<CreatePlayerDTO>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
const [imageFile, setImageFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)

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

  function handleDelete(id: string) {
    setConfirmId(id)
  }

  async function performDelete() {
    if (!confirmId) return
    try {
      await deletePlayer(confirmId)
      setPlayers(prev => prev.filter(p => p.id !== confirmId))
      setConfirmId(null)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al eliminar')
    }
  }

  async function handleUploadImage() {
    if (!imageFile) return
    setUploading(true)
    try {
      const { publicUrl } = await uploadImage(imageFile, 'players')
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
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1a1a2e', margin: 0 }}>Jugadores</h2>
        <button onClick={openCreate} style={btnStyle('#1a1a2e')}>+ Nuevo jugador</button>
      </div>

      {error && <p style={{ color: '#ef4444', marginBottom: 16, fontSize: 13 }} role="alert">{error}</p>}

      {showForm && (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: 24, marginBottom: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20, color: '#1a1a2e' }}>
            {editingId ? 'Editar jugador' : 'Nuevo jugador'}
          </h3>
<form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 14 }}>
            <Field label="Nombre" htmlFor="player-name">
              <Input id="player-name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
            </Field>
            <Field label="Apellido" htmlFor="player-surname">
              <Input id="player-surname" value={form.surname} onChange={e => setForm(p => ({ ...p, surname: e.target.value }))} required />
            </Field>
            <Field label="Número" htmlFor="player-number">
              <Input id="player-number" type="number" min={0} max={99} value={form.number} onChange={e => setForm(p => ({ ...p, number: Number(e.target.value) }))} required />
            </Field>
            <Field label="Posición" htmlFor="player-position">
              <Select id="player-position" value={form.position} onChange={e => setForm(p => ({ ...p, position: e.target.value as Position }))}>
                {POSITIONS.map(pos => <option key={pos} value={pos}>{pos}</option>)}
              </Select>
            </Field>
            <Field label="URL de imagen" htmlFor="player-image" style={{ gridColumn: '1 / -1' }}>
<Input id="player-image" value={form.image_url} onChange={e => setForm(p => ({ ...p, image_url: e.target.value }))} required />
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
      ) : players.length === 0 ? (
        <EmptyState message="No hay jugadores todavía." />
      ) : (
<DataTable
          columns={COLUMNS}
          rows={players}
          keyField={p => p.id}
          renderCell={(p, column) => {
            switch (column.key) {
              case 'number':
                return p.number
              case 'surname':
                return <span style={{ fontWeight: 600 }}>{p.surname}</span>
              case 'name':
                return p.name
              case 'position':
                return p.position
              case 'status':
                return <StatusBadge label={p.active ? 'Activo' : 'Inactivo'} tone={p.active ? 'green' : 'gray'} />
              case 'actions':
                return <ActionMenu onEdit={() => openEdit(p)} onDelete={() => handleDelete(p.id)} />
              default:
                return null
            }
          }}
        />
      )}

      {confirmId && (
        <ConfirmDialog
          title="Eliminar jugador"
          message="¿Eliminar este jugador?"
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

export default JugadoresPage

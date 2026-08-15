import { useEffect, useState } from 'react'
import { useIsMobile } from '../hooks/useMediaQuery'
import type { Match, CreateMatchDTO, MatchStatus } from '../types/matches'
import { getMatches, createMatch, updateMatch, deleteMatch } from '../services/matchesService'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import EmptyState from '../components/ui/EmptyState'
import LoadingState from '../components/ui/LoadingState'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import DataTable, { type DataTableColumn } from '../components/admin/DataTable'
import ActionMenu from '../components/admin/ActionMenu'
import StatusBadge from '../components/admin/StatusBadge'
import FormActions from '../components/admin/FormActions'

const STATUS_LABELS: Record<MatchStatus, string> = {
  upcoming: 'Próximo',
  finished: 'Finalizado',
}

const COLUMNS: DataTableColumn[] = [
  { key: 'date', label: 'Fecha' },
  { key: 'rival', label: 'Rival' },
  { key: 'competition', label: 'Competición' },
  { key: 'status', label: 'Estado' },
  { key: 'result', label: 'Resultado' },
  { key: 'actions', label: 'Acciones', width: 140 },
]

const EMPTY_FORM: CreateMatchDTO = {
  rival: '',
  date: '',
  competition: '',
  status: 'upcoming',
  goals_for: null,
  goals_against: null,
}

function toDatetimeLocal(iso: string) {
  if (!iso) return ''
  return iso.slice(0, 16)
}

function FixturePage() {
  const isMobile = useIsMobile()
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<CreateMatchDTO>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
const [formError, setFormError] = useState<string | null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)

  useEffect(() => {
    getMatches()
      .then(data => { setMatches(data); setError(null) })
      .catch(e => setError(e instanceof Error ? e.message : 'Error al cargar partidos'))
      .finally(() => setLoading(false))
  }, [refreshKey])

  function reload() { setRefreshKey(k => k + 1) }

  function openCreate() {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setShowForm(true)
  }

  function openEdit(m: Match) {
    setEditingId(m.id)
    setForm({
      rival: m.rival,
      date: toDatetimeLocal(m.date),
      competition: m.competition,
      status: m.status,
      goals_for: m.goals_for,
      goals_against: m.goals_against,
    })
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setEditingId(null)
    setForm(EMPTY_FORM)
    setFormError(null)
  }

  function handleStatusChange(status: MatchStatus) {
    setForm(p => ({
      ...p,
      status,
      goals_for: status === 'upcoming' ? null : p.goals_for,
      goals_against: status === 'upcoming' ? null : p.goals_against,
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)
    if (form.status === 'finished' && (form.goals_for === null || form.goals_against === null)) {
      setFormError('Ingresá los goles para marcar el partido como finalizado')
      return
    }
    const dto: CreateMatchDTO = {
      ...form,
      goals_for: form.status === 'upcoming' ? null : form.goals_for,
      goals_against: form.status === 'upcoming' ? null : form.goals_against,
    }
    setSaving(true)
    try {
      if (editingId) {
        await updateMatch(editingId, dto)
      } else {
        await createMatch(dto)
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
      await deleteMatch(confirmId)
      setMatches(prev => prev.filter(m => m.id !== confirmId))
      setConfirmId(null)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al eliminar')
    }
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  function formatResult(m: Match) {
    if (m.status === 'finished' && m.goals_for !== null && m.goals_against !== null) {
      return `${m.goals_for} - ${m.goals_against}`
    }
    return '-'
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1a1a2e', margin: 0 }}>Fixture</h2>
        <button onClick={openCreate} style={btnStyle('#1a1a2e')}>+ Nuevo partido</button>
      </div>

      {error && <p style={{ color: '#ef4444', marginBottom: 16, fontSize: 13 }} role="alert">{error}</p>}

      {showForm && (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: 24, marginBottom: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20, color: '#1a1a2e' }}>
            {editingId ? 'Editar partido' : 'Nuevo partido'}
          </h3>
<form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 14 }}>
            <Field label="Rival" htmlFor="match-rival">
              <Input id="match-rival" value={form.rival} onChange={e => setForm(p => ({ ...p, rival: e.target.value }))} required />
            </Field>
            <Field label="Fecha y hora" htmlFor="match-date">
              <Input id="match-date" type="datetime-local" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} required />
            </Field>
            <Field label="Competición" htmlFor="match-competition">
              <Input id="match-competition" value={form.competition} onChange={e => setForm(p => ({ ...p, competition: e.target.value }))} required />
            </Field>
            <Field label="Estado" htmlFor="match-status">
<Select id="match-status" value={form.status} onChange={e => handleStatusChange(e.target.value as MatchStatus)}>
                <option value="upcoming">Próximo</option>
                <option value="finished">Finalizado</option>
              </Select>
            </Field>
            <Field label="Goles a favor" htmlFor="match-goals-for">
              <Input
                id="match-goals-for"
                type="number"
                min={0}
                value={form.goals_for ?? ''}
onChange={e => setForm(p => ({ ...p, goals_for: e.target.value === '' ? null : Math.max(0, Number(e.target.value)) }))}
              />
            </Field>
            <Field label="Goles en contra" htmlFor="match-goals-against">
              <Input
                id="match-goals-against"
                type="number"
                min={0}
                value={form.goals_against ?? ''}
onChange={e => setForm(p => ({ ...p, goals_against: e.target.value === '' ? null : Math.max(0, Number(e.target.value)) }))}
              />
            </Field>
            <div style={{ gridColumn: '1 / -1' }}>
<div style={{ gridColumn: '1 / -1' }}>
              {formError && <p style={{ color: '#ef4444', marginBottom: 10, fontSize: 13 }} role="alert">{formError}</p>}
              <FormActions saving={saving} onCancel={closeForm} style={{ gridColumn: '1 / -1', marginTop: 0 }} />
            </div>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <LoadingState />
      ) : matches.length === 0 ? (
        <EmptyState message="No hay partidos todavía." />
      ) : (
<DataTable
          columns={COLUMNS}
          rows={matches}
          keyField={m => m.id}
          renderCell={(m, column) => {
            switch (column.key) {
              case 'date':
                return formatDate(m.date)
              case 'rival':
                return <span style={{ fontWeight: 600 }}>{m.rival}</span>
              case 'competition':
                return m.competition
              case 'status':
                return <StatusBadge label={STATUS_LABELS[m.status]} tone={m.status === 'finished' ? 'gray' : 'blue'} />
              case 'result':
                return <span style={{ fontWeight: 600 }}>{formatResult(m)}</span>
              case 'actions':
                return <ActionMenu onEdit={() => openEdit(m)} onDelete={() => handleDelete(m.id)} />
              default:
                return null
            }
          }}
        />
      )}

      {confirmId && (
        <ConfirmDialog
          title="Eliminar partido"
          message="¿Eliminar este partido?"
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
  return { padding: '9px 18px', background: bg, color: '#fff', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer' }
}

export default FixturePage

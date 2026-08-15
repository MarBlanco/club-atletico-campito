import { useEffect, useMemo, useState } from 'react'
import { useIsMobile } from '../hooks/useMediaQuery'
import { useAuth } from '../context/AuthContext'
import type { Match, CreateMatchDTO, MatchStatus } from '../types/matches'
import type { Competition } from '../types/competitions'
import type { Rival } from '../types/rivals'
import { getMatches, createMatch, updateMatch, deleteMatch } from '../services/matchesService'
import { getCompetitions, createCompetition, updateCompetition, deleteCompetition } from '../services/competitionsService'
import { getRivals, createRival, updateRival, deleteRival } from '../services/rivalsService'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import EmptyState from '../components/ui/EmptyState'
import LoadingState from '../components/ui/LoadingState'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import DataTable, { type DataTableColumn } from '../components/admin/DataTable'
import ActionMenu from '../components/admin/ActionMenu'
import StatusBadge from '../components/admin/StatusBadge'
import FormActions from '../components/admin/FormActions'
import GoalCounter from '../components/fixture/GoalCounter'
import EntityManagerModal, { type EntityItem } from '../components/fixture/EntityManagerModal'
import { goalsRequiredForStatus, goalsAfterStatusChange, showGoalsForStatus } from '../lib/fixtureRules'

const STATUS_LABELS: Record<MatchStatus, string> = {
  upcoming: 'Próximo',
  finished: 'Finalizado',
  suspended: 'Suspendido',
}

const STATUS_TONES: Record<MatchStatus, 'blue' | 'gray' | 'amber'> = {
  upcoming: 'blue',
  finished: 'gray',
  suspended: 'amber',
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
  rival_id: '',
  date: '',
  competition_id: '',
  status: 'upcoming',
  goals_for: null,
  goals_against: null,
}

type ManagerKind = 'rival' | 'competition'

function toDatetimeLocal(iso: string) {
  if (!iso) return ''
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function FixturePage() {
  const isMobile = useIsMobile()
  const { role } = useAuth()
  const isAdmin = role === 'admin'

  const [matches, setMatches] = useState<Match[]>([])
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [rivals, setRivals] = useState<Rival[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [referenceError, setReferenceError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<CreateMatchDTO>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [manager, setManager] = useState<ManagerKind | null>(null)

  useEffect(() => {
    let active = true

    getMatches()
      .then(m => {
        if (!active) return
        setMatches(m)
        setError(null)
      })
      .catch(e => {
        if (!active) return
        setError(e instanceof Error ? e.message : 'Error al cargar fixture')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    Promise.all([getCompetitions(), getRivals()])
      .then(([c, r]) => {
        if (!active) return
        setCompetitions(c)
        setRivals(r)
        setReferenceError(null)
      })
      .catch(e => {
        if (!active) return
        setReferenceError(e instanceof Error ? e.message : 'Error al cargar competiciones y rivales')
      })

    return () => {
      active = false
    }
  }, [refreshKey])

  function reload() {
    setRefreshKey(k => k + 1)
  }

  const rivalNames = useMemo(() => new Map(rivals.map(r => [r.id, r.name])), [rivals])
  const competitionNames = useMemo(() => new Map(competitions.map(c => [c.id, c.name])), [competitions])

  const usageByRival = useMemo(() => {
    const map = new Map<string, number>()
    matches.forEach(m => map.set(m.rival_id, (map.get(m.rival_id) ?? 0) + 1))
    return map
  }, [matches])

  const usageByCompetition = useMemo(() => {
    const map = new Map<string, number>()
    matches.forEach(m => map.set(m.competition_id, (map.get(m.competition_id) ?? 0) + 1))
    return map
  }, [matches])

  function openCreate() {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setShowForm(true)
  }

  function openEdit(m: Match) {
    setEditingId(m.id)
    setForm({
      rival_id: m.rival_id,
      date: toDatetimeLocal(m.date),
      competition_id: m.competition_id,
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
    setForm(p => {
      const goals = goalsAfterStatusChange(status, { goals_for: p.goals_for, goals_against: p.goals_against })
      return { ...p, status, ...goals }
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)
    if (goalsRequiredForStatus(form.status) && (form.goals_for === null || form.goals_against === null)) {
      setFormError('Ingresá los goles para marcar el partido como finalizado')
      return
    }
    const dto: CreateMatchDTO = {
      ...form,
      date: form.date ? new Date(form.date).toISOString() : '',
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

  async function handleAddRival(name: string): Promise<EntityItem | null> {
    const created = await createRival({ name })
    setRivals(prev => [...prev, created])
    setForm(p => ({ ...p, rival_id: created.id }))
    setManager(null)
    return created
  }

  async function handleUpdateRival(id: string, name: string): Promise<void> {
    const updated = await updateRival(id, name)
    setRivals(prev => prev.map(r => (r.id === id ? updated : r)))
  }

  async function handleDeleteRival(id: string): Promise<void> {
    await deleteRival(id)
    setRivals(prev => prev.filter(r => r.id !== id))
  }

  async function handleAddCompetition(name: string): Promise<EntityItem | null> {
    const created = await createCompetition({ name })
    setCompetitions(prev => [...prev, created])
    setForm(p => ({ ...p, competition_id: created.id }))
    setManager(null)
    return created
  }

  async function handleUpdateCompetition(id: string, name: string): Promise<void> {
    const updated = await updateCompetition(id, name)
    setCompetitions(prev => prev.map(c => (c.id === id ? updated : c)))
  }

  async function handleDeleteCompetition(id: string): Promise<void> {
    await deleteCompetition(id)
    setCompetitions(prev => prev.filter(c => c.id !== id))
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

      {referenceError && (
        <p style={{ color: '#b45309', marginBottom: 16, fontSize: 13 }} role="alert">
          {referenceError}
        </p>
      )}

      {showForm && (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: 24, marginBottom: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20, color: '#1a1a2e' }}>
            {editingId ? 'Editar partido' : 'Nuevo partido'}
          </h3>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 14 }}>
            <Field label="Competición" htmlFor="match-competition" emphasis>
              <Select id="match-competition" value={form.competition_id} onChange={e => setForm(p => ({ ...p, competition_id: e.target.value }))} required>
                <option value="" disabled>Seleccioná una competición</option>
                {competitions.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </Select>
              {isAdmin && (
                <button type="button" onClick={() => setManager('competition')} style={linkBtnStyle()}>+ Nueva competición</button>
              )}
            </Field>
            <Field label="Fecha y hora" htmlFor="match-date">
              <Input id="match-date" type="datetime-local" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} required />
            </Field>
            <Field label="Rival" htmlFor="match-rival" emphasis>
              <Select id="match-rival" value={form.rival_id} onChange={e => setForm(p => ({ ...p, rival_id: e.target.value }))} required>
                <option value="" disabled>Seleccioná un rival</option>
                {rivals.map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </Select>
              {isAdmin && (
                <button type="button" onClick={() => setManager('rival')} style={linkBtnStyle()}>+ Nuevo rival</button>
              )}
            </Field>
            <Field label="Estado" htmlFor="match-status">
              <Select id="match-status" value={form.status} onChange={e => handleStatusChange(e.target.value as MatchStatus)}>
                <option value="upcoming">Próximo</option>
                <option value="finished">Finalizado</option>
                <option value="suspended">Suspendido</option>
              </Select>
            </Field>
            {showGoalsForStatus(form.status) && (
              <>
                <Field label="Goles a favor">
                  <GoalCounter value={form.goals_for} ariaLabel="Goles a favor" onChange={v => setForm(p => ({ ...p, goals_for: v }))} />
                </Field>
                <Field label="Goles en contra">
                  <GoalCounter value={form.goals_against} ariaLabel="Goles en contra" onChange={v => setForm(p => ({ ...p, goals_against: v }))} />
                </Field>
              </>
            )}
            <div style={{ gridColumn: '1 / -1' }}>
              {formError && <p style={{ color: '#ef4444', marginBottom: 10, fontSize: 13 }} role="alert">{formError}</p>}
              <FormActions saving={saving} onCancel={closeForm} style={{ gridColumn: '1 / -1', marginTop: 0 }} />
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <LoadingState />
      ) : error ? null : matches.length === 0 ? (
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
                return <span style={{ fontWeight: 600 }}>{rivalNames.get(m.rival_id) ?? '—'}</span>
              case 'competition':
                return competitionNames.get(m.competition_id) ?? '—'
              case 'status':
                return <StatusBadge label={STATUS_LABELS[m.status]} tone={STATUS_TONES[m.status]} />
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

      {manager === 'rival' && (
        <EntityManagerModal
          title="Rivales"
          noun="rival"
          plural="rivales"
          items={rivals}
          getUsage={id => usageByRival.get(id) ?? 0}
          onAdd={handleAddRival}
          onUpdate={handleUpdateRival}
          onDelete={handleDeleteRival}
          onClose={() => setManager(null)}
        />
      )}

      {manager === 'competition' && (
        <EntityManagerModal
          title="Competiciones"
          noun="competición"
          plural="competiciones"
          items={competitions}
          getUsage={id => usageByCompetition.get(id) ?? 0}
          onAdd={handleAddCompetition}
          onUpdate={handleUpdateCompetition}
          onDelete={handleDeleteCompetition}
          onClose={() => setManager(null)}
        />
      )}
    </div>
  )
}

function Field({ label, htmlFor, children, emphasis = false }: { label: string; htmlFor?: string; children: React.ReactNode; emphasis?: boolean }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <label
        htmlFor={htmlFor}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          fontSize: emphasis ? 14 : 13,
          fontWeight: emphasis ? 700 : 500,
          color: emphasis ? '#1a1a2e' : '#374151',
        }}
      >
        {emphasis && (
          <span style={{ width: 3, height: 14, background: '#1d4ed8', borderRadius: 2, flexShrink: 0 }} />
        )}
        {label}
      </label>
      {children}
    </div>
  )
}

function btnStyle(bg: string): React.CSSProperties {
  return { padding: '9px 18px', background: bg, color: '#fff', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer' }
}

function linkBtnStyle(): React.CSSProperties {
  return { background: 'none', border: 'none', color: '#1d4ed8', fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: 0, marginTop: 6, textAlign: 'left' }
}

export default FixturePage
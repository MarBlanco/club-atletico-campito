import { useEffect, useState } from 'react'
import { useIsMobile } from '../hooks/useMediaQuery'
import type { Match, CreateMatchDTO, MatchStatus } from '../types/matches'
import { getMatches, createMatch, updateMatch, deleteMatch } from '../services/matchesService'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import Badge from '../components/ui/Badge'
import EmptyState from '../components/ui/EmptyState'
import LoadingState from '../components/ui/LoadingState'
import ConfirmDialog from '../components/ui/ConfirmDialog'

const STATUS_LABELS: Record<MatchStatus, string> = {
  upcoming: 'Próximo',
  finished: 'Finalizado',
}

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
              {formError && <p style={{ color: '#ef4444', marginBottom: 10, fontSize: 13 }} role="alert">{formError}</p>}
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
      ) : matches.length === 0 ? (
        <EmptyState message="No hay partidos todavía." />
      ) : (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                <th style={thStyle}>Fecha</th>
                <th style={thStyle}>Rival</th>
                <th style={thStyle}>Competición</th>
                <th style={thStyle}>Estado</th>
                <th style={thStyle}>Resultado</th>
                <th style={{ ...thStyle, width: 140 }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {matches.map((m, i) => (
                <tr key={m.id} style={{ borderBottom: i < matches.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                  <td style={tdStyle}>{formatDate(m.date)}</td>
                  <td style={{ ...tdStyle, fontWeight: 600 }}>{m.rival}</td>
                  <td style={tdStyle}>{m.competition}</td>
                  <td style={tdStyle}>
                    <Badge variant={m.status === 'finished' ? 'gray' : 'blue'}>
                      {STATUS_LABELS[m.status]}
                    </Badge>
                  </td>
                  <td style={{ ...tdStyle, fontWeight: 600 }}>{formatResult(m)}</td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => openEdit(m)} style={btnSmall('#3b82f6')}>Editar</button>
                      <button onClick={() => handleDelete(m.id)} style={btnSmall('#ef4444')}>Eliminar</button>
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

export default FixturePage

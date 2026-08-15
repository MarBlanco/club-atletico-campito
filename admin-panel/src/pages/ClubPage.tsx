import { useEffect, useState } from 'react'
import type { Club, UpdateClubDTO } from '../types/club'
import { getClub, updateClub } from '../services/clubService'
import ImageUploader from '../components/media/ImageUploader'

function ClubPage() {
  const [club, setClub] = useState<Club | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState<UpdateClubDTO>({
    history: '',
    mission: '',
    values: '',
    location: '',
    logo_url: '',
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    getClub()
      .then(data => {
        setClub(data)
        setForm({
          history: data.history,
          mission: data.mission,
          values: data.values,
          location: data.location,
          logo_url: data.logo_url,
        })
        setError(null)
      })
      .catch(e => setError(e instanceof Error ? e.message : 'Error al cargar club'))
      .finally(() => setLoading(false))
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!club) return
    setSaving(true)
    setSaved(false)
    try {
      const updated = await updateClub(club.id, form)
      setClub(updated)
      setForm({
        history: updated.history,
        mission: updated.mission,
        values: updated.values,
        location: updated.location,
        logo_url: updated.logo_url,
      })
      setError(null)
      setSaved(true)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <p style={{ color: '#6b7280', fontSize: 14 }} role="status" aria-live="polite">Cargando...</p>
  }

  if (!club) {
    return error ? (
      <p style={{ color: '#ef4444', fontSize: 14 }} role="alert">{error}</p>
    ) : (
      <p style={{ color: '#ef4444', fontSize: 14 }}>No se encontró el registro del club.</p>
    )
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1a1a2e', margin: 0 }}>Club</h2>
        <p style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>
          Información institucional del club.
        </p>
      </div>

      {error && <p style={{ color: '#ef4444', marginBottom: 16, fontSize: 13 }} role="alert">{error}</p>}
      {saved && <p style={{ color: '#16a34a', marginBottom: 16, fontSize: 13 }}>Cambios guardados.</p>}

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: 24 }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Field label="Historia" htmlFor="club-history">
            <textarea
              id="club-history"
              value={form.history ?? ''}
              onChange={e => setForm(p => ({ ...p, history: e.target.value }))}
              required
              rows={6}
              style={textareaStyle}
            />
          </Field>
          <Field label="Misión" htmlFor="club-mission">
            <textarea
              id="club-mission"
              value={form.mission ?? ''}
              onChange={e => setForm(p => ({ ...p, mission: e.target.value || null }))}
              rows={4}
              style={textareaStyle}
            />
          </Field>
          <Field label="Valores" htmlFor="club-values">
            <textarea
              id="club-values"
              value={form.values ?? ''}
              onChange={e => setForm(p => ({ ...p, values: e.target.value || null }))}
              rows={4}
              style={textareaStyle}
            />
          </Field>
          <Field label="Ubicación" htmlFor="club-location">
            <input
              id="club-location"
              value={form.location ?? ''}
              onChange={e => setForm(p => ({ ...p, location: e.target.value }))}
              required
              style={inputStyle}
            />
          </Field>
          <Field label="Logo" htmlFor="club-logo">
            <ImageUploader
              id="club-logo"
              folder="club"
              value={typeof form.logo_url === 'string' ? form.logo_url : ''}
              onChange={url => setForm(p => ({ ...p, logo_url: url }))}
              label="Logo"
            />
          </Field>
          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button type="submit" disabled={saving} style={btnStyle('#1a1a2e')}>
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
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

const inputStyle: React.CSSProperties = {
  padding: '9px 12px',
  border: '1px solid #d1d5db',
  borderRadius: 6,
  fontSize: 14,
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
}

const textareaStyle: React.CSSProperties = {
  ...inputStyle,
  resize: 'vertical',
}

function btnStyle(bg: string): React.CSSProperties {
  return {
    padding: '9px 18px',
    background: bg,
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
  }
}

export default ClubPage

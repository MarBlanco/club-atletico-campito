import { useRef, useState } from 'react'
import type { Club, UpdateClubDTO } from '../../types/club'
import { updateClub } from '../../services/clubService'
import { uploadImage } from '../../services/storageService'

interface ClubFormProps {
  club: Club
  onSaved: (club: Club) => void
}

function ClubForm({ club, onSaved }: ClubFormProps) {
  const [form, setForm] = useState<UpdateClubDTO>({
    history: club.history,
    mission: club.mission,
    values: club.values,
    location: club.location,
    logo_url: club.logo_url,
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleUploadImage() {
    if (!imageFile) return
    setUploading(true)
    try {
      const { publicUrl } = await uploadImage(imageFile, 'club')
      setForm(p => ({ ...p, logo_url: publicUrl }))
      setImageFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al subir imagen')
    } finally {
      setUploading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setSaved(false)
    try {
      const updated = await updateClub(club.id, form)
      setForm({
        history: updated.history,
        mission: updated.mission,
        values: updated.values,
        location: updated.location,
        logo_url: updated.logo_url,
      })
      setError(null)
      setSaved(true)
      onSaved(updated)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input
                  ref={fileInputRef}
                  id="club-logo"
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
              {typeof form.logo_url === 'string' && form.logo_url.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <img
                    src={form.logo_url}
                    alt="Preview"
                    style={{ maxHeight: 120, maxWidth: '100%', borderRadius: 6, objectFit: 'cover', border: '1px solid #e5e7eb' }}
                  />
                  <span style={{ fontSize: 11, color: '#6b7280', wordBreak: 'break-all' }}>{form.logo_url}</span>
                </div>
              )}
            </div>
          </Field>
          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button type="submit" disabled={saving || uploading} style={btnStyle('#1a1a2e')}>
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

export default ClubForm
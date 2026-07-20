import { useEffect, useState, useRef } from 'react'
import type { Club, UpdateClubDTO } from '../types/club'
import { getClub, updateClub } from '../services/clubService'
import { uploadImage } from '../services/storageService'

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
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
    return <p style={{ color: '#6b7280', fontSize: 14 }}>Cargando...</p>
  }

  if (!club) {
    return <p style={{ color: '#ef4444', fontSize: 14 }}>No se encontró el registro del club.</p>
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1a1a2e', margin: 0 }}>Club</h2>
        <p style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>
          Información institucional del club.
        </p>
      </div>

      {error && <p style={{ color: '#ef4444', marginBottom: 16, fontSize: 13 }}>{error}</p>}
      {saved && <p style={{ color: '#16a34a', marginBottom: 16, fontSize: 13 }}>Cambios guardados.</p>}

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: 24 }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Field label="Historia">
            <textarea
              value={form.history ?? ''}
              onChange={e => setForm(p => ({ ...p, history: e.target.value }))}
              required
              rows={6}
              style={textareaStyle}
            />
          </Field>
          <Field label="Misión">
            <textarea
              value={form.mission ?? ''}
              onChange={e => setForm(p => ({ ...p, mission: e.target.value || null }))}
              rows={4}
              style={textareaStyle}
            />
          </Field>
          <Field label="Valores">
            <textarea
              value={form.values ?? ''}
              onChange={e => setForm(p => ({ ...p, values: e.target.value || null }))}
              rows={4}
              style={textareaStyle}
            />
          </Field>
          <Field label="Ubicación">
            <input
              value={form.location ?? ''}
              onChange={e => setForm(p => ({ ...p, location: e.target.value }))}
              required
              style={inputStyle}
            />
          </Field>
          <Field label="Logo">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
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
            <button type="submit" disabled={saving} style={btnStyle('#1a1a2e')}>
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
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

import { useEffect, useState } from 'react'
import type { Club } from '../types/club'
import { getClub } from '../services/clubService'
import ClubForm from '../components/club/ClubForm'

function ConfiguracionPage() {
  const [club, setClub] = useState<Club | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getClub()
      .then(data => { setClub(data); setError(null) })
      .catch(e => setError(e instanceof Error ? e.message : 'Error al cargar configuración'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <p style={{ color: '#6b7280', fontSize: 14 }} role="status" aria-live="polite">Cargando...</p>
  }

  if (!club) {
    return error ? (
      <p style={{ color: '#ef4444', fontSize: 14 }} role="alert">{error}</p>
    ) : (
      <p style={{ color: '#ef4444', fontSize: 14 }}>No se encontró la configuración.</p>
    )
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1a1a2e', margin: 0 }}>Configuración</h2>
        <p style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>
          Configuración global del sistema.
        </p>
      </div>

      <ClubForm club={club} onSaved={setClub} />
    </div>
  )
}

export default ConfiguracionPage
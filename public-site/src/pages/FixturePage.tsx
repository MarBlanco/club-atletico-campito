import { useEffect, useState } from 'react'
import { getMatches } from '../services/matchesService'
import type { Match } from '../types/matches'
import MatchCard from '../components/content/MatchCard'

const styles = {
  header: {
    marginBottom: 32,
  } as React.CSSProperties,

  title: {
    fontSize: 32,
    fontWeight: 800,
    color: '#123A9E',
    margin: 0,
    lineHeight: 1.1,
  } as React.CSSProperties,

  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    margin: '8px 0 0',
  } as React.CSSProperties,

  status: {
    color: '#6b7280',
    fontSize: 14,
  } as React.CSSProperties,

  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: 20,
  } as React.CSSProperties,

  empty: {
    backgroundColor: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: 8,
    padding: 32,
    textAlign: 'center' as const,
    color: '#6b7280',
    fontSize: 14,
  } as React.CSSProperties,
}

function FixturePage() {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    getMatches()
      .then(data => {
        if (!active) return
        setMatches(data)
      })
      .catch(() => {
        if (!active) return
        setError('No se pudo cargar el fixture.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  return (
    <div>
      <div style={styles.header}>
        <h1 style={styles.title}>Fixture</h1>
        <p style={styles.subtitle}>Partidos del Club Atlético Campito</p>
      </div>

      {loading ? (
        <p style={styles.status} role="status" aria-live="polite">Cargando fixture...</p>
      ) : error ? (
        <p style={styles.status} role="alert">{error}</p>
      ) : matches.length === 0 ? (
        <div style={styles.empty}>No hay partidos cargados todavía.</div>
      ) : (
        <div style={styles.grid}>
          {matches.map(match => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>
      )}
    </div>
  )
}

export default FixturePage
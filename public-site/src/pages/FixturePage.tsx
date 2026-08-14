import { useEffect, useState } from 'react'
import { getMatches } from '../services/matchesService'
import type { Match, MatchStatus } from '../types/matches'

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

  card: {
    backgroundColor: '#ffffff',
    border: '1px solid #e5e7eb',
    borderLeft: '4px solid #1EB9E8',
    borderRadius: 8,
    padding: 24,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 12,
  } as React.CSSProperties,

  cardStatus: {
    fontSize: 11,
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
    color: '#1EB9E8',
    margin: 0,
  } as React.CSSProperties,

  rival: {
    fontSize: 20,
    fontWeight: 700,
    color: '#123A9E',
    margin: 0,
    lineHeight: 1.2,
  } as React.CSSProperties,

  metaRow: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: 16,
    fontSize: 14,
    color: '#111111',
    margin: 0,
  } as React.CSSProperties,

  metaItem: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 2,
  } as React.CSSProperties,

  metaLabel: {
    fontSize: 11,
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
    color: '#6b7280',
  } as React.CSSProperties,

  metaValue: {
    fontSize: 14,
    fontWeight: 500,
    color: '#111111',
  } as React.CSSProperties,

  result: {
    fontSize: 20,
    fontWeight: 700,
    color: '#111111',
    margin: 0,
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

const STATUS_LABELS: Record<MatchStatus, string> = {
  upcoming: 'Próximo partido',
  finished: 'Finalizado',
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

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('es-AR', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  function showResult(match: Match): boolean {
    return match.status === 'finished' && match.goals_for !== null && match.goals_against !== null
  }

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
            <article key={match.id} style={styles.card}>
              <p style={styles.cardStatus}>{STATUS_LABELS[match.status]}</p>
              <h3 style={styles.rival}>{`vs ${match.rival}`}</h3>

              <div style={styles.metaRow}>
                <div style={styles.metaItem}>
                  <span style={styles.metaLabel}>Fecha</span>
                  <span style={styles.metaValue}>{formatDate(match.date)}</span>
                </div>
                <div style={styles.metaItem}>
                  <span style={styles.metaLabel}>Hora</span>
                  <span style={styles.metaValue}>{formatTime(match.date)}</span>
                </div>
                <div style={styles.metaItem}>
                  <span style={styles.metaLabel}>Torneo</span>
                  <span style={styles.metaValue}>{match.competition}</span>
                </div>
              </div>

              {showResult(match) && (
                <p style={styles.result}>
                  {match.goals_for} - {match.goals_against}
                </p>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

export default FixturePage
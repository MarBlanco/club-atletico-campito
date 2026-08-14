import { useEffect, useState } from 'react'
import type { Club } from '../types/club'
import { getClub } from '../services/clubService'

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

  card: {
    backgroundColor: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: 8,
    padding: 28,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 20,
  } as React.CSSProperties,

  head: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
  } as React.CSSProperties,

  logo: {
    width: 64,
    height: 64,
    objectFit: 'contain' as const,
    borderRadius: 8,
    flexShrink: 0,
  } as React.CSSProperties,

  location: {
    fontSize: 13,
    color: '#1EB9E8',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
    margin: 0,
  } as React.CSSProperties,

  block: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 4,
  } as React.CSSProperties,

  blockLabel: {
    fontSize: 11,
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
    color: '#123A9E',
    margin: 0,
  } as React.CSSProperties,

  blockText: {
    fontSize: 14,
    lineHeight: 1.6,
    color: '#374151',
    margin: 0,
    whiteSpace: 'pre-line' as const,
  } as React.CSSProperties,

  status: {
    color: '#6b7280',
    fontSize: 14,
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

function ClubPage() {
  const [club, setClub] = useState<Club | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    getClub()
      .then(data => {
        if (!cancelled) {
          setClub(data)
          setError(null)
        }
      })
      .catch(e => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : String(e))
          setClub(null)
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div>
      <div style={styles.header}>
        <h1 style={styles.title}>Club</h1>
        <p style={styles.subtitle}>
          Identidad e historia del Club Atlético Campito
        </p>
      </div>

      {loading ? (
        <p style={styles.status} role="status" aria-live="polite">Cargando club...</p>
      ) : error ? (
        <p style={styles.status} role="alert">{error}</p>
      ) : !club ? (
        <div style={styles.empty}>El club no tiene información cargada todavía.</div>
      ) : (
        <article style={styles.card}>
          <div style={styles.head}>
            {club.logo_url && (
              <img
                src={club.logo_url}
                alt="Escudo Club Atlético Campito"
                loading="lazy"
                decoding="async"
                style={styles.logo}
              />
            )}
            <p style={styles.location}>{club.location}</p>
          </div>
          <div style={styles.block}>
            <p style={styles.blockLabel}>Historia</p>
            <p style={styles.blockText}>{club.history}</p>
          </div>
          {club.mission && (
            <div style={styles.block}>
              <p style={styles.blockLabel}>Misión</p>
              <p style={styles.blockText}>{club.mission}</p>
            </div>
          )}
          {club.values && (
            <div style={styles.block}>
              <p style={styles.blockLabel}>Valores</p>
              <p style={styles.blockText}>{club.values}</p>
            </div>
          )}
        </article>
      )}
    </div>
  )
}

export default ClubPage

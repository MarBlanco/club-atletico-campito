import { useEffect, useState } from 'react'
import { getClub } from '../services/clubService'
import type { Club } from '../types/club'

// Mock genérico y aislado: el contrato actual de `club` solo define `location`.
// Reemplazar cuando existan campos reales de contacto en el modelo.
const MOCK_CONTACT_ITEMS = [
  { label: 'Teléfono', value: 'Próximamente' },
  { label: 'Email', value: 'Próximamente' },
  { label: 'Redes sociales', value: 'Próximamente' },
]

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

  sectionTitle: {
    fontSize: 20,
    fontWeight: 700,
    color: '#111111',
    margin: '0 0 16px',
    borderLeft: '4px solid #123A9E',
    paddingLeft: 12,
  } as React.CSSProperties,

  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: 20,
  } as React.CSSProperties,

  card: {
    backgroundColor: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: 8,
    padding: 20,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 6,
  } as React.CSSProperties,

  cardLabel: {
    fontSize: 11,
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
    color: '#1EB9E8',
    margin: 0,
  } as React.CSSProperties,

  cardValue: {
    fontSize: 15,
    fontWeight: 500,
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

function ContactPage() {
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
      .catch(() => {
        if (!cancelled) {
          setError('No se pudieron cargar los datos de contacto.')
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
        <h1 style={styles.title}>Contacto</h1>
        <p style={styles.subtitle}>
          Información de contacto del Club Atlético Campito
        </p>
      </div>

      {loading ? (
        <p style={styles.status}>Cargando contacto...</p>
      ) : error ? (
        <p style={styles.status}>{error}</p>
      ) : (
        <>
          <h2 style={styles.sectionTitle}>Ubicación</h2>
          {!club ? (
            <div style={styles.empty}>
              El club no tiene información cargada todavía.
            </div>
          ) : (
            <div style={styles.grid}>
              <article style={styles.card}>
                <p style={styles.cardLabel}>Ubicación</p>
                <p style={styles.cardValue}>{club.location}</p>
              </article>
            </div>
          )}

          <h2 style={styles.sectionTitle}>Otros medios</h2>
          <div style={styles.grid}>
            {MOCK_CONTACT_ITEMS.map(item => (
              <article key={item.label} style={styles.card}>
                <p style={styles.cardLabel}>{item.label}</p>
                <p style={styles.cardValue}>{item.value}</p>
              </article>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default ContactPage
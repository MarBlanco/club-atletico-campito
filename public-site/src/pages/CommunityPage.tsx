import { useEffect, useState } from 'react'
import { getGalleries } from '../services/galleriesService'
import type { Gallery } from '../types/galleries'

const CATEGORY_LABELS: Record<string, string> = {
  primera: 'Primera',
  infanto: 'Infanto Juvenil',
  femenino: 'Femenino',
  veteranos: 'Veteranos',
  familias: 'Familias',
  hinchas: 'Hinchas',
}

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
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: 20,
  } as React.CSSProperties,

  card: {
    backgroundColor: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: 8,
    overflow: 'hidden' as const,
    display: 'flex',
    flexDirection: 'column' as const,
  } as React.CSSProperties,

  cover: {
    width: '100%',
    height: 140,
    objectFit: 'cover' as const,
    backgroundColor: '#f3f4f6',
  } as React.CSSProperties,

  body: {
    padding: 14,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 4,
  } as React.CSSProperties,

  category: {
    fontSize: 11,
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
    color: '#1EB9E8',
    margin: 0,
  } as React.CSSProperties,

  galleryTitle: {
    fontSize: 15,
    fontWeight: 600,
    color: '#111111',
    margin: 0,
    lineHeight: 1.3,
  } as React.CSSProperties,

  date: {
    fontSize: 12,
    color: '#6b7280',
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

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-AR', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

function CommunityPage() {
  const [galleries, setGalleries] = useState<Gallery[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    getGalleries()
      .then(data => {
        if (!active) return
        setGalleries(data)
      })
      .catch(() => {
        if (!active) return
        setError('No se pudieron cargar los momentos.')
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
        <h1 style={styles.title}>Momentos Campito</h1>
        <p style={styles.subtitle}>La comunidad del Club Atlético Campito</p>
      </div>

      {loading ? (
        <p style={styles.status} role="status" aria-live="polite">Cargando momentos...</p>
      ) : error ? (
        <p style={styles.status} role="alert">{error}</p>
      ) : galleries.length === 0 ? (
        <div style={styles.empty}>No hay momentos cargados todavía.</div>
      ) : (
        <div style={styles.grid}>
          {galleries.map(gallery => (
            <article key={gallery.id} style={styles.card}>
              <img
                src={gallery.cover_image}
                alt={gallery.title}
                style={styles.cover}
              />
              <div style={styles.body}>
                <p style={styles.category}>
                  {CATEGORY_LABELS[gallery.category] ?? gallery.category}
                </p>
                <h3 style={styles.galleryTitle}>{gallery.title}</h3>
                <p style={styles.date}>{formatDate(gallery.match_date)}</p>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

export default CommunityPage
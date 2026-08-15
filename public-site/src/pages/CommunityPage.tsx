import { useEffect, useState } from 'react'
import { getGalleries } from '../services/galleriesService'
import type { Gallery } from '../types/galleries'
import GalleryCard from '../components/content/GalleryCard'

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
            <GalleryCard key={gallery.id} gallery={gallery} />
          ))}
        </div>
      )}
    </div>
  )
}

export default CommunityPage
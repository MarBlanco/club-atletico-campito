import { useEffect, useState } from 'react'
import { getMedia } from '../services/mediaService'
import type { Media, MediaType } from '../types/media'

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
    position: 'relative' as const,
    display: 'flex',
    flexDirection: 'column' as const,
  } as React.CSSProperties,

  thumb: {
    width: '100%',
    aspectRatio: '16 / 9',
    objectFit: 'cover' as const,
    display: 'block',
    backgroundColor: '#f3f4f6',
  } as React.CSSProperties,

  badge: {
    position: 'absolute' as const,
    top: 12,
    left: 12,
    fontSize: 11,
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
    color: '#ffffff',
    backgroundColor: '#123A9E',
    padding: '4px 10px',
    borderRadius: 4,
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

const TYPE_LABELS: Record<MediaType, string> = {
  image: 'Imagen',
  video: 'Video',
}

function MultimediaPage() {
  const [items, setItems] = useState<Media[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    getMedia()
      .then(data => {
        if (!active) return
        setItems(data)
      })
      .catch(() => {
        if (!active) return
        setError('No se pudo cargar la multimedia.')
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
        <h1 style={styles.title}>Multimedia</h1>
        <p style={styles.subtitle}>Imágenes y videos del Club Atlético Campito</p>
      </div>

      {loading ? (
        <p style={styles.status} role="status" aria-live="polite">
          Cargando multimedia...
        </p>
      ) : error ? (
        <p style={styles.status} role="alert">
          {error}
        </p>
      ) : items.length === 0 ? (
        <div style={styles.empty}>No hay contenido multimedia cargado todavía.</div>
      ) : (
        <div style={styles.grid}>
          {items.map(item => (
            <article key={item.id} style={styles.card}>
              {item.type === 'video' ? (
                <video
                  src={item.url}
                  poster={item.thumbnail_url || undefined}
                  controls
                  style={styles.thumb}
                />
              ) : (
                <img
                  src={item.thumbnail_url || item.url}
                  alt={`${TYPE_LABELS[item.type]} multimedia`}
                  style={styles.thumb}
                />
              )}
              <span style={styles.badge}>{TYPE_LABELS[item.type]}</span>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

export default MultimediaPage
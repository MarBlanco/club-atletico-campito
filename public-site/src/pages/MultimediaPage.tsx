import { useEffect, useState } from 'react'
import { getMedia } from '../services/mediaService'
import type { Media } from '../types/media'
import GalleryGrid from '../components/media/GalleryGrid'
import Lightbox from '../components/media/Lightbox'

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

function MultimediaPage() {
  const [items, setItems] = useState<Media[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lightbox, setLightbox] = useState<Media | null>(null)

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
        <GalleryGrid items={items} onSelect={setLightbox} />
      )}

      {lightbox && <Lightbox item={lightbox} onClose={() => setLightbox(null)} />}
    </div>
  )
}

export default MultimediaPage
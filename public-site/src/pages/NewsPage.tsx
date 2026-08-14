import { useEffect, useState } from 'react'
import type { News } from '../types/news'
import { getPublishedNews } from '../services/newsService'

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

  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: 24,
  } as React.CSSProperties,

  card: {
    backgroundColor: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: 8,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column' as const,
  } as React.CSSProperties,

  image: {
    width: '100%',
    height: 180,
    objectFit: 'cover' as const,
    backgroundColor: '#f3f4f6',
  } as React.CSSProperties,

  body: {
    padding: 20,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 8,
  } as React.CSSProperties,

  date: {
    fontSize: 11,
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
    color: '#1EB9E8',
    margin: 0,
  } as React.CSSProperties,

  cardTitle: {
    fontSize: 18,
    fontWeight: 600,
    color: '#111111',
    margin: 0,
    lineHeight: 1.3,
  } as React.CSSProperties,

  excerpt: {
    fontSize: 14,
    color: '#6b7280',
    margin: 0,
    lineHeight: 1.5,
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

function NewsPage() {
  const [news, setNews] = useState<News[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    getPublishedNews()
      .then(data => {
        if (!cancelled) {
          setNews(data)
          setError(null)
        }
      })
      .catch(e => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Error al cargar noticias')
          setNews([])
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  return (
    <div>
      <div style={styles.header}>
        <h1 style={styles.title}>Noticias</h1>
        <p style={styles.subtitle}>
          Noticias institucionales y deportivas del Club Atlético Campito
        </p>
      </div>

      {loading ? (
        <p style={styles.status}>Cargando noticias...</p>
      ) : error ? (
        <p style={styles.status}>{error}</p>
      ) : news.length === 0 ? (
        <div style={styles.empty}>
          No hay noticias publicadas todavía.
        </div>
      ) : (
        <div style={styles.grid}>
          {news.map(item => (
            <article key={item.id} style={styles.card}>
              {item.image_url && (
                <img
                  src={item.image_url}
                  alt={item.title}
                  loading="lazy"
                  decoding="async"
                  style={styles.image}
                />
              )}
              <div style={styles.body}>
                <p style={styles.date}>{formatDate(item.created_at)}</p>
                <h2 style={styles.cardTitle}>{item.title}</h2>
                <p style={styles.excerpt}>{item.excerpt}</p>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

export default NewsPage

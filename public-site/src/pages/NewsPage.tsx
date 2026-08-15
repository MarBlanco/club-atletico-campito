import { useEffect, useState } from 'react'
import type { News } from '../types/news'
import { getPublishedNews } from '../services/newsService'
import NewsCard from '../components/content/NewsCard'

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

  return (
    <div>
      <div style={styles.header}>
        <h1 style={styles.title}>Noticias</h1>
        <p style={styles.subtitle}>
          Noticias institucionales y deportivas del Club Atlético Campito
        </p>
      </div>

      {loading ? (
        <p style={styles.status} role="status" aria-live="polite">Cargando noticias...</p>
      ) : error ? (
        <p style={styles.status} role="alert">{error}</p>
      ) : news.length === 0 ? (
        <div style={styles.empty}>
          No hay noticias publicadas todavía.
        </div>
      ) : (
        <div style={styles.grid}>
          {news.map(item => (
            <NewsCard key={item.id} news={item} />
          ))}
        </div>
      )}
    </div>
  )
}

export default NewsPage

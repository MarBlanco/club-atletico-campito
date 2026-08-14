import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import type { News } from '../types/news'
import { getPublishedNewsById } from '../services/newsService'

const styles = {
  back: {
    display: 'inline-block',
    marginBottom: 24,
    fontSize: 14,
    color: '#123A9E',
    textDecoration: 'none',
    fontWeight: 500,
  } as React.CSSProperties,

  article: {
    backgroundColor: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: 8,
    overflow: 'hidden',
  } as React.CSSProperties,

  heroImage: {
    width: '100%',
    maxHeight: 420,
    objectFit: 'cover' as const,
    backgroundColor: '#f3f4f6',
  } as React.CSSProperties,

  body: {
    padding: '32px 32px 40px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 16,
  } as React.CSSProperties,

  date: {
    fontSize: 12,
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
    color: '#1EB9E8',
    margin: 0,
  } as React.CSSProperties,

  title: {
    fontSize: 32,
    fontWeight: 800,
    color: '#123A9E',
    margin: 0,
    lineHeight: 1.2,
  } as React.CSSProperties,

  excerpt: {
    fontSize: 18,
    color: '#374151',
    margin: 0,
    lineHeight: 1.5,
    fontStyle: 'italic' as const,
  } as React.CSSProperties,

  content: {
    fontSize: 16,
    color: '#111111',
    margin: '8px 0 0',
    lineHeight: 1.7,
    whiteSpace: 'pre-line' as const,
  } as React.CSSProperties,

  status: {
    color: '#6b7280',
    fontSize: 14,
  } as React.CSSProperties,

  notFound: {
    textAlign: 'center' as const,
    padding: '80px 24px',
  } as React.CSSProperties,

  notFoundTitle: {
    fontSize: 28,
    fontWeight: 700,
    color: '#123A9E',
    margin: '0 0 12px',
  } as React.CSSProperties,

  notFoundText: {
    fontSize: 15,
    color: '#6b7280',
    margin: '0 0 24px',
  } as React.CSSProperties,
}

function NewsDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [news, setNews] = useState<News | null>(null)
  const [loading, setLoading] = useState<boolean>(() => Boolean(id))
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    getPublishedNewsById(id)
      .then(data => {
        if (!cancelled) {
          setNews(data)
          setError(null)
        }
      })
      .catch(e => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Error al cargar la noticia')
          setNews(null)
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [id])

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('es-AR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
  }

  if (loading) {
    return (
      <div>
        <Link to="/noticias" style={styles.back}>← Volver a noticias</Link>
        <p style={styles.status}>Cargando noticia...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <Link to="/noticias" style={styles.back}>← Volver a noticias</Link>
        <p style={styles.status}>{error}</p>
      </div>
    )
  }

  if (!news) {
    return (
      <div style={styles.notFound}>
        <h1 style={styles.notFoundTitle}>Noticia no encontrada</h1>
        <p style={styles.notFoundText}>
          La noticia que buscás no existe o fue eliminada.
        </p>
        <Link to="/noticias" style={styles.back}>← Volver a noticias</Link>
      </div>
    )
  }

  return (
    <div>
      <Link to="/noticias" style={styles.back}>← Volver a noticias</Link>

      <article style={styles.article}>
        {news.image_url && (
          <img
            src={news.image_url}
            alt={news.title}
            decoding="async"
            fetchPriority="high"
            style={styles.heroImage}
          />
        )}
        <div style={styles.body}>
          <p style={styles.date}>{formatDate(news.created_at)}</p>
          <h1 style={styles.title}>{news.title}</h1>
          <p style={styles.excerpt}>{news.excerpt}</p>
          <p style={styles.content}>{news.content}</p>
        </div>
      </article>
    </div>
  )
}

export default NewsDetailPage

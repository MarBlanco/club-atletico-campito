import { useEffect, useState } from 'react'
import type { News } from '../types/news'
import { getLatestNews } from '../services/newsService'

function HomePage() {
  const [news, setNews] = useState<News[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    getLatestNews(3)
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

  const styles = {
    hero: {
      backgroundColor: '#123A9E',
      color: '#ffffff',
      padding: '80px 24px',
      borderRadius: 8,
      textAlign: 'center' as const,
      marginBottom: 48,
    } as React.CSSProperties,

    heroTitle: {
      fontSize: 40,
      fontWeight: 800,
      letterSpacing: 0.5,
      margin: 0,
      lineHeight: 1.1,
    } as React.CSSProperties,

    heroSubtitle: {
      fontSize: 18,
      fontWeight: 400,
      margin: '16px 0 0',
      color: '#1EB9E8',
    } as React.CSSProperties,

    section: {
      marginBottom: 48,
    } as React.CSSProperties,

    sectionTitle: {
      fontSize: 24,
      fontWeight: 700,
      color: '#111111',
      margin: '0 0 20px',
      borderLeft: '4px solid #123A9E',
      paddingLeft: 12,
    } as React.CSSProperties,

    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
      gap: 20,
    } as React.CSSProperties,

    placeholderCard: {
      backgroundColor: '#ffffff',
      border: '1px solid #e5e7eb',
      borderRadius: 8,
      padding: 24,
      minHeight: 160,
      display: 'flex',
      flexDirection: 'column' as const,
      gap: 8,
    } as React.CSSProperties,

    placeholderLabel: {
      fontSize: 12,
      fontWeight: 600,
      textTransform: 'uppercase' as const,
      letterSpacing: 1,
      color: '#1EB9E8',
    } as React.CSSProperties,

    placeholderText: {
      fontSize: 14,
      color: '#6b7280',
      margin: 0,
    } as React.CSSProperties,

    newsCard: {
      backgroundColor: '#ffffff',
      border: '1px solid #e5e7eb',
      borderRadius: 8,
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column' as const,
      minHeight: 160,
    } as React.CSSProperties,

    newsImage: {
      width: '100%',
      height: 160,
      objectFit: 'cover' as const,
      backgroundColor: '#f3f4f6',
    } as React.CSSProperties,

    newsBody: {
      padding: 16,
      display: 'flex',
      flexDirection: 'column' as const,
      gap: 6,
    } as React.CSSProperties,

    newsDate: {
      fontSize: 11,
      fontWeight: 600,
      textTransform: 'uppercase' as const,
      letterSpacing: 0.5,
      color: '#1EB9E8',
      margin: 0,
    } as React.CSSProperties,

    newsTitle: {
      fontSize: 16,
      fontWeight: 600,
      color: '#111111',
      margin: 0,
      lineHeight: 1.3,
    } as React.CSSProperties,

    newsExcerpt: {
      fontSize: 13,
      color: '#6b7280',
      margin: 0,
      lineHeight: 1.5,
    } as React.CSSProperties,

    status: {
      color: '#6b7280',
      fontSize: 14,
    } as React.CSSProperties,
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const staticSections = [
    {
      title: 'Club',
      items: ['Identidad', 'Historia'],
    },
    {
      title: 'Equipos',
      items: ['Primera', 'Infanto Juvenil'],
    },
    {
      title: 'Fixture',
      items: ['Próximo partido'],
    },
    {
      title: 'Momentos Campito',
      items: ['Destacado reciente'],
    },
  ]

  return (
    <div>
      <section style={styles.hero}>
        <h1 style={styles.heroTitle}>CLUB ATLÉTICO CAMPITO</h1>
        <p style={styles.heroSubtitle}>
          Colón, Entre Ríos · Argentina
        </p>
      </section>

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Noticias</h2>
        <div style={styles.grid}>
          {loading ? (
            <p style={styles.status}>Cargando noticias...</p>
          ) : error ? (
            <p style={styles.status}>{error}</p>
          ) : news.length === 0 ? (
            <div style={styles.placeholderCard}>
              <span style={styles.placeholderLabel}>Noticias</span>
              <p style={styles.placeholderText}>Última novedad</p>
            </div>
          ) : (
            news.map(item => (
              <article key={item.id} style={styles.newsCard}>
                {item.image_url && (
                  <img
                    src={item.image_url}
                    alt={item.title}
                    style={styles.newsImage}
                  />
                )}
                <div style={styles.newsBody}>
                  <p style={styles.newsDate}>{formatDate(item.created_at)}</p>
                  <h3 style={styles.newsTitle}>{item.title}</h3>
                  <p style={styles.newsExcerpt}>{item.excerpt}</p>
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      {staticSections.map(({ title, items }) => (
        <section key={title} style={styles.section}>
          <h2 style={styles.sectionTitle}>{title}</h2>
          <div style={styles.grid}>
            {items.map(item => (
              <div key={item} style={styles.placeholderCard}>
                <span style={styles.placeholderLabel}>{title}</span>
                <p style={styles.placeholderText}>{item}</p>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

export default HomePage

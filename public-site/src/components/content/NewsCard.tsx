import type { News } from '../../types/news'

const styles = {
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

  title: {
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
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function NewsCard({ news }: { news: News }) {
  return (
    <article style={styles.card}>
      {news.image_url && (
        <img
          src={news.image_url}
          alt={news.title}
          loading="lazy"
          decoding="async"
          style={styles.image}
        />
      )}
      <div style={styles.body}>
        <p style={styles.date}>{formatDate(news.created_at)}</p>
        <h3 style={styles.title}>{news.title}</h3>
        <p style={styles.excerpt}>{news.excerpt}</p>
      </div>
    </article>
  )
}

export default NewsCard
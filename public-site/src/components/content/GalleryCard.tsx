import type { Gallery, GalleryCategory } from '../../types/galleries'

const CATEGORY_LABELS: Record<GalleryCategory, string> = {
  primera: 'Primera',
  infanto: 'Infanto Juvenil',
  femenino: 'Femenino',
  veteranos: 'Veteranos',
  familias: 'Familias',
  hinchas: 'Hinchas',
}

const styles = {
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

  title: {
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

function GalleryCard({ gallery }: { gallery: Gallery }) {
  return (
    <article style={styles.card}>
      <img
        src={gallery.cover_image}
        alt={gallery.title}
        loading="lazy"
        decoding="async"
        style={styles.cover}
      />
      <div style={styles.body}>
        <p style={styles.category}>{CATEGORY_LABELS[gallery.category]}</p>
        <h3 style={styles.title}>{gallery.title}</h3>
        <p style={styles.date}>{formatDate(gallery.match_date)}</p>
      </div>
    </article>
  )
}

export default GalleryCard
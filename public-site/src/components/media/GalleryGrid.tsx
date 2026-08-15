import type { Media, MediaType } from '../../types/media'

const TYPE_LABELS: Record<MediaType, string> = {
  image: 'Imagen',
  video: 'Video',
}

interface GalleryGridProps {
  items: Media[]
  onSelect?: (item: Media) => void
}

const styles = {
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
}

function GalleryGrid({ items, onSelect }: GalleryGridProps) {
  return (
    <div style={styles.grid}>
      {items.map(item => (
        <article
          key={item.id}
          style={styles.card}
          role={onSelect ? 'button' : undefined}
          tabIndex={onSelect ? 0 : undefined}
          aria-label={onSelect ? `Ver ${TYPE_LABELS[item.type]} multimedia` : undefined}
          onClick={onSelect ? () => onSelect(item) : undefined}
          onKeyDown={onSelect ? (e: React.KeyboardEvent) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              onSelect(item)
            }
          } : undefined}
        >
          {item.type === 'video' ? (
            <video
              src={item.url}
              poster={item.thumbnail_url || undefined}
              controls
              preload="metadata"
              style={styles.thumb}
            />
          ) : (
            <img
              src={item.thumbnail_url || item.url}
              alt={`${TYPE_LABELS[item.type]} multimedia`}
              loading="lazy"
              decoding="async"
              style={styles.thumb}
            />
          )}
          <span style={styles.badge}>{TYPE_LABELS[item.type]}</span>
        </article>
      ))}
    </div>
  )
}

export default GalleryGrid
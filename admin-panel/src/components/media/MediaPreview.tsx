import type { MediaType } from '../../types/media'

interface MediaPreviewProps {
  url: string
  type?: MediaType
  alt?: string
}

const styles = {
  frame: {
    border: '1px solid #e5e7eb',
    borderRadius: 6,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 6,
  } as React.CSSProperties,

  media: {
    width: '100%',
    maxHeight: 180,
    objectFit: 'cover' as const,
    display: 'block',
    backgroundColor: '#f3f4f6',
  } as React.CSSProperties,

  url: {
    fontSize: 11,
    color: '#6b7280',
    wordBreak: 'break-all' as const,
    padding: '0 8px 8px',
    margin: 0,
  } as React.CSSProperties,
}

function MediaPreview({ url, type = 'image', alt = 'Vista previa' }: MediaPreviewProps) {
  return (
    <div style={styles.frame}>
      {type === 'video' ? (
        <video src={url} controls style={styles.media} />
      ) : (
        <img src={url} alt={alt} style={styles.media} />
      )}
      <p style={styles.url}>{url}</p>
    </div>
  )
}

export default MediaPreview
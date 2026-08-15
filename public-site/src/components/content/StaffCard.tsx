interface StaffCardProps {
  name: string
  role: string
  imageUrl?: string | null
}

const styles = {
  card: {
    backgroundColor: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: 8,
    padding: 20,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 8,
  } as React.CSSProperties,

  image: {
    width: '100%',
    height: 160,
    objectFit: 'cover' as const,
    backgroundColor: '#f3f4f6',
    borderRadius: 6,
  } as React.CSSProperties,

  name: {
    fontSize: 16,
    fontWeight: 600,
    color: '#111111',
    margin: 0,
  } as React.CSSProperties,

  role: {
    fontSize: 13,
    color: '#6b7280',
    margin: 0,
  } as React.CSSProperties,
}

function StaffCard({ name, role, imageUrl }: StaffCardProps) {
  return (
    <article style={styles.card}>
      {imageUrl && (
        <img
          src={imageUrl}
          alt={name}
          loading="lazy"
          decoding="async"
          style={styles.image}
        />
      )}
      <h3 style={styles.name}>{name}</h3>
      <p style={styles.role}>{role}</p>
    </article>
  )
}

export default StaffCard
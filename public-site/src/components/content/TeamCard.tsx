interface TeamCardProps {
  name: string
  description: string
}

const styles = {
  card: {
    backgroundColor: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: 8,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column' as const,
  } as React.CSSProperties,

  placeholder: {
    backgroundColor: '#123A9E',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: 120,
    fontSize: 28,
    fontWeight: 800,
  } as React.CSSProperties,

  body: {
    padding: 20,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 8,
  } as React.CSSProperties,

  title: {
    fontSize: 18,
    fontWeight: 600,
    color: '#111111',
    margin: 0,
    lineHeight: 1.3,
  } as React.CSSProperties,

  description: {
    fontSize: 14,
    color: '#6b7280',
    margin: 0,
    lineHeight: 1.5,
  } as React.CSSProperties,
}

function TeamCard({ name, description }: TeamCardProps) {
  return (
    <article style={styles.card}>
      <div style={styles.placeholder}>{name.charAt(0)}</div>
      <div style={styles.body}>
        <h3 style={styles.title}>{name}</h3>
        <p style={styles.description}>{description}</p>
      </div>
    </article>
  )
}

export default TeamCard
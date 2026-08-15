interface PlayerCardProps {
  name: string
  surname: string
  number: number | null
  position: string
}

const styles = {
  card: {
    backgroundColor: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: 8,
    padding: 20,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 6,
  } as React.CSSProperties,

  name: {
    fontSize: 16,
    fontWeight: 600,
    color: '#111111',
    margin: 0,
  } as React.CSSProperties,

  meta: {
    fontSize: 13,
    color: '#6b7280',
    margin: 0,
  } as React.CSSProperties,
}

function PlayerCard({ name, surname, number, position }: PlayerCardProps) {
  return (
    <article style={styles.card}>
      <h3 style={styles.name}>
        {name} {surname}
      </h3>
      <p style={styles.meta}>{position}</p>
      {number !== null && (
        <p style={styles.meta}>N° {number}</p>
      )}
    </article>
  )
}

export default PlayerCard
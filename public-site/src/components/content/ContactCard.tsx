interface ContactCardProps {
  label: string
  value: string
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

  label: {
    fontSize: 11,
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
    color: '#1EB9E8',
    margin: 0,
  } as React.CSSProperties,

  value: {
    fontSize: 15,
    fontWeight: 500,
    color: '#111111',
    margin: 0,
  } as React.CSSProperties,
}

function ContactCard({ label, value }: ContactCardProps) {
  return (
    <article style={styles.card}>
      <p style={styles.label}>{label}</p>
      <p style={styles.value}>{value}</p>
    </article>
  )
}

export default ContactCard
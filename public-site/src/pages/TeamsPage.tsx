interface TeamCategory {
  name: string
  description: string
}

// Mock genérico y aislado: reemplazar cuando exista fuente de datos en Supabase.
const TEAM_CATEGORIES: TeamCategory[] = [
  {
    name: 'Primera',
    description: 'Plantel y cuerpo técnico de la categoría principal.',
  },
  {
    name: 'Infanto Juvenil',
    description: 'Formación y desarrollo de las divisiones juveniles.',
  },
  {
    name: 'Femenino',
    description: 'Equipo femenino de la institución.',
  },
  {
    name: 'Veteranos',
    description: 'Equipo de jugadores veteranos.',
  },
]

const styles = {
  header: {
    marginBottom: 32,
  } as React.CSSProperties,

  title: {
    fontSize: 32,
    fontWeight: 800,
    color: '#123A9E',
    margin: 0,
    lineHeight: 1.1,
  } as React.CSSProperties,

  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    margin: '8px 0 0',
  } as React.CSSProperties,

  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: 24,
  } as React.CSSProperties,

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

  cardTitle: {
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

function TeamsPage() {
  return (
    <div>
      <div style={styles.header}>
        <h1 style={styles.title}>Equipos</h1>
        <p style={styles.subtitle}>Categorías del Club Atlético Campito</p>
      </div>

      <div style={styles.grid}>
        {TEAM_CATEGORIES.map(({ name, description }) => (
          <article key={name} style={styles.card}>
            <div style={styles.placeholder}>{name.charAt(0)}</div>
            <div style={styles.body}>
              <h2 style={styles.cardTitle}>{name}</h2>
              <p style={styles.description}>{description}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

export default TeamsPage
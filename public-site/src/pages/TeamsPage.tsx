import TeamCard from '../components/content/TeamCard'

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
          <TeamCard key={name} name={name} description={description} />
        ))}
      </div>
    </div>
  )
}

export default TeamsPage
import PlayerCard from '../components/content/PlayerCard'

interface Player {
  name: string
  surname: string
  number: number | null
  position: string
}

// Mock genérico y aislado: reemplazar cuando exista un servicio/tipo real de jugadores.
const MOCK_PLAYERS: Player[] = [
  { name: 'Jugador', surname: 'Uno', number: 1, position: 'Arquero' },
  { name: 'Jugador', surname: 'Dos', number: 4, position: 'Defensor' },
  { name: 'Jugador', surname: 'Tres', number: 10, position: 'Mediocampista' },
  { name: 'Jugador', surname: 'Cuatro', number: 9, position: 'Delantero' },
]

import SectionHeader from '../components/content/SectionHeader'

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

  intro: {
    backgroundColor: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: 8,
    padding: 24,
    marginBottom: 32,
  } as React.CSSProperties,

  introLabel: {
    fontSize: 11,
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
    color: '#123A9E',
    margin: '0 0 8px',
  } as React.CSSProperties,

  introText: {
    fontSize: 14,
    lineHeight: 1.6,
    color: '#374151',
    margin: 0,
  } as React.CSSProperties,

  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: 20,
  } as React.CSSProperties,

  empty: {
    backgroundColor: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: 8,
    padding: 32,
    textAlign: 'center' as const,
    color: '#6b7280',
    fontSize: 14,
  } as React.CSSProperties,
}

function FirstTeamPage() {
  return (
    <div>
      <div style={styles.header}>
        <h1 style={styles.title}>Primera</h1>
        <p style={styles.subtitle}>Plantel de Primera del Club Atlético Campito</p>
      </div>

      <div style={styles.intro}>
        <p style={styles.introLabel}>El equipo</p>
        <p style={styles.introText}>
          Información institucional del plantel de Primera.
        </p>
      </div>

      <SectionHeader title="Plantel" />
      {MOCK_PLAYERS.length === 0 ? (
        <div style={styles.empty}>No hay jugadores cargados todavía.</div>
      ) : (
        <div style={styles.grid}>
          {MOCK_PLAYERS.map(player => (
            <PlayerCard
              key={`${player.surname}-${player.number}`}
              name={player.name}
              surname={player.surname}
              number={player.number}
              position={player.position}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default FirstTeamPage
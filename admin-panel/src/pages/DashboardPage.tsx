import { useEffect, useState } from 'react'
import Container from '../components/ui/Container'
import StatCard from '../components/ui/StatCard'
import { useIsMobile } from '../hooks/useMediaQuery'
import { getNews } from '../services/newsService'
import { getPlayers } from '../services/playersService'
import { getStaff } from '../services/staffService'
import { getMatches } from '../services/matchesService'
import { getGalleries } from '../services/galleriesService'
import { getMedia } from '../services/mediaService'

interface DashboardStats {
  news: number
  players: number
  staff: number
  matches: number
  galleries: number
  media: number
}

function DashboardPage() {
  const isMobile = useIsMobile()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([getNews(), getPlayers(), getStaff(), getMatches(), getGalleries(), getMedia()])
      .then(([news, players, staff, matches, galleries, media]) => {
        setStats({
          news: news.length,
          players: players.length,
          staff: staff.length,
          matches: matches.length,
          galleries: galleries.length,
          media: media.length,
        })
        setError(null)
      })
      .catch(e => setError(e instanceof Error ? e.message : 'Error al cargar el dashboard'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <Container>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1a1a2e', margin: '0 0 24px' }}>Dashboard</h2>

      {error && <p style={{ color: '#ef4444', marginBottom: 16, fontSize: 13 }} role="alert">{error}</p>}

      {loading ? (
        <p style={{ color: '#6b7280', fontSize: 14 }} role="status" aria-live="polite">Cargando...</p>
      ) : stats ? (
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 16 }}>
          <StatCard label="Noticias" value={stats.news} />
          <StatCard label="Jugadores" value={stats.players} />
          <StatCard label="Staff" value={stats.staff} />
          <StatCard label="Partidos" value={stats.matches} />
          <StatCard label="Galerías" value={stats.galleries} />
          <StatCard label="Archivos multimedia" value={stats.media} />
        </div>
      ) : null}
    </Container>
  )
}

export default DashboardPage
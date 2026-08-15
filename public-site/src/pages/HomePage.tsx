import { useEffect, useState } from 'react'
import type { News } from '../types/news'
import type { Match } from '../types/matches'
import type { Club } from '../types/club'
import type { Media } from '../types/media'
import type { Gallery } from '../types/galleries'
import { getLatestNews } from '../services/newsService'
import { getNextMatch } from '../services/matchesService'
import { getClub } from '../services/clubService'
import { getLatestMedia } from '../services/mediaService'
import { getLatestGalleries } from '../services/galleriesService'
import NewsCard from '../components/content/NewsCard'
import MatchCard from '../components/content/MatchCard'
import GalleryCard from '../components/content/GalleryCard'
import GalleryGrid from '../components/media/GalleryGrid'
import Lightbox from '../components/media/Lightbox'
import HeroSection from '../components/content/HeroSection'
import SectionHeader from '../components/content/SectionHeader'

function HomePage() {
  const [news, setNews] = useState<News[]>([])
  const [newsLoading, setNewsLoading] = useState(true)
  const [newsError, setNewsError] = useState<string | null>(null)

  const [nextMatch, setNextMatch] = useState<Match | null>(null)
  const [matchLoading, setMatchLoading] = useState(true)
  const [matchError, setMatchError] = useState<string | null>(null)

  const [club, setClub] = useState<Club | null>(null)
  const [clubLoading, setClubLoading] = useState(true)
  const [clubError, setClubError] = useState<string | null>(null)

  const [media, setMedia] = useState<Media[]>([])
  const [mediaLoading, setMediaLoading] = useState(true)
  const [mediaError, setMediaError] = useState<string | null>(null)

  const [galleries, setGalleries] = useState<Gallery[]>([])
  const [galleriesLoading, setGalleriesLoading] = useState(true)
  const [galleriesError, setGalleriesError] = useState<string | null>(null)

  const [lightbox, setLightbox] = useState<Media | null>(null)

  useEffect(() => {
    let cancelled = false
    getLatestNews(3)
      .then(data => {
        if (!cancelled) {
          setNews(data)
          setNewsError(null)
        }
      })
      .catch(e => {
        if (!cancelled) {
          setNewsError(e instanceof Error ? e.message : 'Error al cargar noticias')
          setNews([])
        }
      })
      .finally(() => {
        if (!cancelled) setNewsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    getNextMatch()
      .then(data => {
        if (!cancelled) {
          setNextMatch(data)
          setMatchError(null)
        }
      })
      .catch(e => {
        if (!cancelled) {
          setMatchError(e instanceof Error ? e.message : 'Error al cargar fixture')
          setNextMatch(null)
        }
      })
      .finally(() => {
        if (!cancelled) setMatchLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    getClub()
      .then(data => {
        if (!cancelled) {
          setClub(data)
          setClubError(null)
        }
      })
      .catch(e => {
        if (!cancelled) {
          setClubError(e instanceof Error ? e.message : 'Error al cargar club')
          setClub(null)
        }
      })
      .finally(() => {
        if (!cancelled) setClubLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    getLatestMedia(4)
      .then(data => {
        if (!cancelled) {
          setMedia(data)
          setMediaError(null)
        }
      })
      .catch(e => {
        if (!cancelled) {
          setMediaError(e instanceof Error ? e.message : 'Error al cargar multimedia')
          setMedia([])
        }
      })
      .finally(() => {
        if (!cancelled) setMediaLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    getLatestGalleries(4)
      .then(data => {
        if (!cancelled) {
          setGalleries(data)
          setGalleriesError(null)
        }
      })
      .catch(e => {
        if (!cancelled) {
          setGalleriesError(e instanceof Error ? e.message : 'Error al cargar momentos campito')
          setGalleries([])
        }
      })
      .finally(() => {
        if (!cancelled) setGalleriesLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const styles = {
    section: {
      marginBottom: 48,
    } as React.CSSProperties,

    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
      gap: 20,
    } as React.CSSProperties,

    placeholderCard: {
      backgroundColor: '#ffffff',
      border: '1px solid #e5e7eb',
      borderRadius: 8,
      padding: 24,
      minHeight: 160,
      display: 'flex',
      flexDirection: 'column' as const,
      gap: 8,
    } as React.CSSProperties,

    placeholderLabel: {
      fontSize: 12,
      fontWeight: 600,
      textTransform: 'uppercase' as const,
      letterSpacing: 1,
      color: '#1EB9E8',
    } as React.CSSProperties,

    placeholderText: {
      fontSize: 14,
      color: '#6b7280',
      margin: 0,
    } as React.CSSProperties,

    status: {
      color: '#6b7280',
      fontSize: 14,
    } as React.CSSProperties,

    clubCard: {
      backgroundColor: '#ffffff',
      border: '1px solid #e5e7eb',
      borderRadius: 8,
      padding: 28,
      display: 'flex',
      flexDirection: 'column' as const,
      gap: 20,
    } as React.CSSProperties,

    clubHead: {
      display: 'flex',
      alignItems: 'center',
      gap: 16,
    } as React.CSSProperties,

    clubLogo: {
      width: 64,
      height: 64,
      objectFit: 'contain' as const,
      borderRadius: 8,
      flexShrink: 0,
    } as React.CSSProperties,

    clubLocation: {
      fontSize: 13,
      color: '#1EB9E8',
      fontWeight: 600,
      textTransform: 'uppercase' as const,
      letterSpacing: 0.5,
      margin: 0,
    } as React.CSSProperties,

    clubBlock: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: 4,
    } as React.CSSProperties,

    clubBlockLabel: {
      fontSize: 11,
      fontWeight: 700,
      textTransform: 'uppercase' as const,
      letterSpacing: 1,
      color: '#123A9E',
      margin: 0,
    } as React.CSSProperties,

clubBlockText: {
      fontSize: 14,
      lineHeight: 1.6,
      color: '#374151',
      margin: 0,
      whiteSpace: 'pre-line' as const,
    } as React.CSSProperties,
  }

  const staticSections = [
    {
      title: 'Equipos',
      items: ['Primera', 'Infanto Juvenil'],
    },
  ]

  return (
<div>
      <HeroSection title="CLUB ATLÉTICO CAMPITO" subtitle="Colón, Entre Ríos · Argentina" />

      <section style={styles.section}>
        <SectionHeader title="Club" />
        <div style={styles.grid}>
          {clubLoading ? (
            <p style={styles.status} role="status" aria-live="polite">Cargando club...</p>
          ) : clubError ? (
            <p style={styles.status} role="alert">{clubError}</p>
          ) : !club ? (
            <div style={styles.placeholderCard}>
              <span style={styles.placeholderLabel}>Club</span>
              <p style={styles.placeholderText}>Identidad</p>
            </div>
          ) : (
            <article style={styles.clubCard}>
              <div style={styles.clubHead}>
                {club.logo_url && (
                  <img
                    src={club.logo_url}
                    alt="Escudo Club Atlético Campito"
                    loading="lazy"
                    decoding="async"
                    style={styles.clubLogo}
                  />
                )}
                <p style={styles.clubLocation}>{club.location}</p>
              </div>
              <div style={styles.clubBlock}>
                <p style={styles.clubBlockLabel}>Historia</p>
                <p style={styles.clubBlockText}>{club.history}</p>
              </div>
              {club.mission && (
                <div style={styles.clubBlock}>
                  <p style={styles.clubBlockLabel}>Misión</p>
                  <p style={styles.clubBlockText}>{club.mission}</p>
                </div>
              )}
              {club.values && (
                <div style={styles.clubBlock}>
                  <p style={styles.clubBlockLabel}>Valores</p>
                  <p style={styles.clubBlockText}>{club.values}</p>
                </div>
              )}
            </article>
          )}
        </div>
      </section>

      <section style={styles.section}>
        <SectionHeader title="Noticias" />
        <div style={styles.grid}>
          {newsLoading ? (
            <p style={styles.status} role="status" aria-live="polite">Cargando noticias...</p>
          ) : newsError ? (
            <p style={styles.status} role="alert">{newsError}</p>
          ) : news.length === 0 ? (
            <div style={styles.placeholderCard}>
              <span style={styles.placeholderLabel}>Noticias</span>
              <p style={styles.placeholderText}>Última novedad</p>
            </div>
          ) : (
            news.map(item => (
              <NewsCard key={item.id} news={item} />
            ))
          )}
        </div>
      </section>

      <section style={styles.section}>
        <SectionHeader title="Próximo Partido" />
        <div style={styles.grid}>
          {matchLoading ? (
            <p style={styles.status} role="status" aria-live="polite">Cargando fixture...</p>
          ) : matchError ? (
            <p style={styles.status} role="alert">{matchError}</p>
          ) : !nextMatch ? (
            <div style={styles.placeholderCard}>
              <span style={styles.placeholderLabel}>Fixture</span>
              <p style={styles.placeholderText}>Próximo partido</p>
            </div>
          ) : (
            <MatchCard match={nextMatch} />
          )}
        </div>
      </section>

      <section style={styles.section}>
        <SectionHeader title="Multimedia" />
        <div style={styles.grid}>
          {mediaLoading ? (
            <p style={styles.status} role="status" aria-live="polite">Cargando multimedia...</p>
          ) : mediaError ? (
            <p style={styles.status} role="alert">{mediaError}</p>
          ) : media.length === 0 ? (
            <div style={styles.placeholderCard}>
              <span style={styles.placeholderLabel}>Multimedia</span>
              <p style={styles.placeholderText}>Último contenido</p>
            </div>
          ) : (
            <GalleryGrid items={media} onSelect={setLightbox} />
          )}
        </div>
      </section>

      <section style={styles.section}>
        <SectionHeader title="Momentos Campito" />
        <div style={styles.grid}>
          {galleriesLoading ? (
            <p style={styles.status} role="status" aria-live="polite">Cargando momentos campito...</p>
          ) : galleriesError ? (
            <p style={styles.status} role="alert">{galleriesError}</p>
          ) : galleries.length === 0 ? (
            <div style={styles.placeholderCard}>
              <span style={styles.placeholderLabel}>Momentos Campito</span>
              <p style={styles.placeholderText}>Destacado reciente</p>
            </div>
          ) : (
            galleries.map(g => (
              <GalleryCard key={g.id} gallery={g} />
            ))
          )}
        </div>
      </section>

      {staticSections.map(({ title, items }) => (
        <section key={title} style={styles.section}>
          <SectionHeader title={title} />
          <div style={styles.grid}>
            {items.map(item => (
              <div key={item} style={styles.placeholderCard}>
                <span style={styles.placeholderLabel}>{title}</span>
                <p style={styles.placeholderText}>{item}</p>
              </div>
            ))}
          </div>
        </section>
      ))}
    {lightbox && <Lightbox item={lightbox} onClose={() => setLightbox(null)} />}
    </div>
  )
}

export default HomePage

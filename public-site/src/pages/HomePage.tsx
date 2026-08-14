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
    hero: {
      backgroundColor: '#123A9E',
      color: '#ffffff',
      padding: '80px 24px',
      borderRadius: 8,
      textAlign: 'center' as const,
      marginBottom: 48,
    } as React.CSSProperties,

    heroTitle: {
      fontSize: 40,
      fontWeight: 800,
      letterSpacing: 0.5,
      margin: 0,
      lineHeight: 1.1,
    } as React.CSSProperties,

    heroSubtitle: {
      fontSize: 18,
      fontWeight: 400,
      margin: '16px 0 0',
      color: '#1EB9E8',
    } as React.CSSProperties,

    section: {
      marginBottom: 48,
    } as React.CSSProperties,

    sectionTitle: {
      fontSize: 24,
      fontWeight: 700,
      color: '#111111',
      margin: '0 0 20px',
      borderLeft: '4px solid #123A9E',
      paddingLeft: 12,
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

    newsCard: {
      backgroundColor: '#ffffff',
      border: '1px solid #e5e7eb',
      borderRadius: 8,
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column' as const,
      minHeight: 160,
    } as React.CSSProperties,

    newsImage: {
      width: '100%',
      height: 160,
      objectFit: 'cover' as const,
      backgroundColor: '#f3f4f6',
    } as React.CSSProperties,

    newsBody: {
      padding: 16,
      display: 'flex',
      flexDirection: 'column' as const,
      gap: 6,
    } as React.CSSProperties,

    newsDate: {
      fontSize: 11,
      fontWeight: 600,
      textTransform: 'uppercase' as const,
      letterSpacing: 0.5,
      color: '#1EB9E8',
      margin: 0,
    } as React.CSSProperties,

    newsTitle: {
      fontSize: 16,
      fontWeight: 600,
      color: '#111111',
      margin: 0,
      lineHeight: 1.3,
    } as React.CSSProperties,

    newsExcerpt: {
      fontSize: 13,
      color: '#6b7280',
      margin: 0,
      lineHeight: 1.5,
    } as React.CSSProperties,

    status: {
      color: '#6b7280',
      fontSize: 14,
    } as React.CSSProperties,

    matchCard: {
      backgroundColor: '#ffffff',
      border: '1px solid #e5e7eb',
      borderLeft: '4px solid #1EB9E8',
      borderRadius: 8,
      padding: 24,
      display: 'flex',
      flexDirection: 'column' as const,
      gap: 10,
    } as React.CSSProperties,

    matchLabel: {
      fontSize: 12,
      fontWeight: 600,
      textTransform: 'uppercase' as const,
      letterSpacing: 1,
      color: '#1EB9E8',
      margin: 0,
    } as React.CSSProperties,

    matchRival: {
      fontSize: 22,
      fontWeight: 700,
      color: '#123A9E',
      margin: 0,
      lineHeight: 1.2,
    } as React.CSSProperties,

    matchRow: {
      display: 'flex',
      flexWrap: 'wrap' as const,
      gap: 16,
      fontSize: 14,
      color: '#111111',
      margin: 0,
    } as React.CSSProperties,

    matchMetaItem: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: 2,
    } as React.CSSProperties,

    matchMetaLabel: {
      fontSize: 11,
      fontWeight: 600,
      textTransform: 'uppercase' as const,
      letterSpacing: 0.5,
      color: '#6b7280',
    } as React.CSSProperties,

    matchMetaValue: {
      fontSize: 14,
      fontWeight: 500,
      color: '#111111',
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

    mediaCard: {
      backgroundColor: '#ffffff',
      border: '1px solid #e5e7eb',
      borderRadius: 8,
      overflow: 'hidden',
      position: 'relative' as const,
      minHeight: 180,
      display: 'flex',
    } as React.CSSProperties,

    mediaThumb: {
      width: '100%',
      height: 180,
      objectFit: 'cover' as const,
      backgroundColor: '#f3f4f6',
    } as React.CSSProperties,

    mediaBadge: {
      position: 'absolute' as const,
      top: 8,
      left: 8,
      padding: '2px 8px',
      borderRadius: 12,
      fontSize: 11,
      fontWeight: 700,
      textTransform: 'uppercase' as const,
      letterSpacing: 0.5,
      backgroundColor: 'rgba(18, 58, 158, 0.9)',
      color: '#ffffff',
    } as React.CSSProperties,

    galleryCard: {
      backgroundColor: '#ffffff',
      border: '1px solid #e5e7eb',
      borderRadius: 8,
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column' as const,
      minHeight: 200,
    } as React.CSSProperties,

    galleryCover: {
      width: '100%',
      height: 140,
      objectFit: 'cover' as const,
      backgroundColor: '#f3f4f6',
    } as React.CSSProperties,

    galleryBody: {
      padding: 14,
      display: 'flex',
      flexDirection: 'column' as const,
      gap: 4,
    } as React.CSSProperties,

    galleryCategory: {
      fontSize: 11,
      fontWeight: 700,
      textTransform: 'uppercase' as const,
      letterSpacing: 1,
      color: '#1EB9E8',
      margin: 0,
    } as React.CSSProperties,

    galleryTitle: {
      fontSize: 15,
      fontWeight: 600,
      color: '#111111',
      margin: 0,
      lineHeight: 1.3,
    } as React.CSSProperties,

    galleryDate: {
      fontSize: 12,
      color: '#6b7280',
      margin: 0,
    } as React.CSSProperties,
  }

  const CATEGORY_LABELS: Record<string, string> = {
    primera: 'Primera',
    infanto: 'Infanto Juvenil',
    femenino: 'Femenino',
    veteranos: 'Veteranos',
    familias: 'Familias',
    hinchas: 'Hinchas',
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('es-AR', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const staticSections = [
    {
      title: 'Equipos',
      items: ['Primera', 'Infanto Juvenil'],
    },
  ]

  return (
    <div>
      <section style={styles.hero}>
        <h1 style={styles.heroTitle}>CLUB ATLÉTICO CAMPITO</h1>
        <p style={styles.heroSubtitle}>
          Colón, Entre Ríos · Argentina
        </p>
      </section>

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Club</h2>
        <div style={styles.grid}>
          {clubLoading ? (
            <p style={styles.status}>Cargando club...</p>
          ) : clubError ? (
            <p style={styles.status}>{clubError}</p>
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
        <h2 style={styles.sectionTitle}>Noticias</h2>
        <div style={styles.grid}>
          {newsLoading ? (
            <p style={styles.status}>Cargando noticias...</p>
          ) : newsError ? (
            <p style={styles.status}>{newsError}</p>
          ) : news.length === 0 ? (
            <div style={styles.placeholderCard}>
              <span style={styles.placeholderLabel}>Noticias</span>
              <p style={styles.placeholderText}>Última novedad</p>
            </div>
          ) : (
            news.map(item => (
              <article key={item.id} style={styles.newsCard}>
                {item.image_url && (
                  <img
                    src={item.image_url}
                    alt={item.title}
                    loading="lazy"
                    decoding="async"
                    style={styles.newsImage}
                  />
                )}
                <div style={styles.newsBody}>
                  <p style={styles.newsDate}>{formatDate(item.created_at)}</p>
                  <h3 style={styles.newsTitle}>{item.title}</h3>
                  <p style={styles.newsExcerpt}>{item.excerpt}</p>
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Próximo Partido</h2>
        <div style={styles.grid}>
          {matchLoading ? (
            <p style={styles.status}>Cargando fixture...</p>
          ) : matchError ? (
            <p style={styles.status}>{matchError}</p>
          ) : !nextMatch ? (
            <div style={styles.placeholderCard}>
              <span style={styles.placeholderLabel}>Fixture</span>
              <p style={styles.placeholderText}>Próximo partido</p>
            </div>
          ) : (
            <article style={styles.matchCard}>
              <p style={styles.matchLabel}>Próximo partido</p>
              <h3 style={styles.matchRival}>{`vs ${nextMatch.rival}`}</h3>
              <div style={styles.matchRow}>
                <div style={styles.matchMetaItem}>
                  <span style={styles.matchMetaLabel}>Fecha</span>
                  <span style={styles.matchMetaValue}>{formatDate(nextMatch.date)}</span>
                </div>
                <div style={styles.matchMetaItem}>
                  <span style={styles.matchMetaLabel}>Hora</span>
                  <span style={styles.matchMetaValue}>{formatTime(nextMatch.date)}</span>
                </div>
                <div style={styles.matchMetaItem}>
                  <span style={styles.matchMetaLabel}>Torneo</span>
                  <span style={styles.matchMetaValue}>{nextMatch.competition}</span>
                </div>
              </div>
            </article>
          )}
        </div>
      </section>

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Multimedia</h2>
        <div style={styles.grid}>
          {mediaLoading ? (
            <p style={styles.status}>Cargando multimedia...</p>
          ) : mediaError ? (
            <p style={styles.status}>{mediaError}</p>
          ) : media.length === 0 ? (
            <div style={styles.placeholderCard}>
              <span style={styles.placeholderLabel}>Multimedia</span>
              <p style={styles.placeholderText}>Último contenido</p>
            </div>
          ) : (
            media.map(item => (
              <article key={item.id} style={styles.mediaCard}>
                <img
                  src={item.thumbnail_url || item.url}
                  alt={`Multimedia ${item.type}`}
                  loading="lazy"
                  decoding="async"
                  style={styles.mediaThumb}
                />
                <span style={styles.mediaBadge}>{item.type}</span>
              </article>
            ))
          )}
        </div>
      </section>

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Momentos Campito</h2>
        <div style={styles.grid}>
          {galleriesLoading ? (
            <p style={styles.status}>Cargando momentos campito...</p>
          ) : galleriesError ? (
            <p style={styles.status}>{galleriesError}</p>
          ) : galleries.length === 0 ? (
            <div style={styles.placeholderCard}>
              <span style={styles.placeholderLabel}>Momentos Campito</span>
              <p style={styles.placeholderText}>Destacado reciente</p>
            </div>
          ) : (
            galleries.map(g => (
              <article key={g.id} style={styles.galleryCard}>
                <img
                  src={g.cover_image}
                  alt={g.title}
                  loading="lazy"
                  decoding="async"
                  style={styles.galleryCover}
                />
                <div style={styles.galleryBody}>
                  <p style={styles.galleryCategory}>
                    {CATEGORY_LABELS[g.category] ?? g.category}
                  </p>
                  <h3 style={styles.galleryTitle}>{g.title}</h3>
                  <p style={styles.galleryDate}>
                    {new Date(g.match_date).toLocaleDateString('es-AR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      {staticSections.map(({ title, items }) => (
        <section key={title} style={styles.section}>
          <h2 style={styles.sectionTitle}>{title}</h2>
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
    </div>
  )
}

export default HomePage

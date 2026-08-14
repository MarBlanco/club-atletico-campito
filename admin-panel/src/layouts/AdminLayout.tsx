import { Suspense, useEffect, useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useIsMobile } from '../hooks/useMediaQuery'

const SIDEBAR_WIDTH = 220

const styles = {
  root: {
    display: 'flex',
    minHeight: '100vh',
    fontFamily: 'system-ui, sans-serif',
  } as React.CSSProperties,

  sidebar: {
    width: SIDEBAR_WIDTH,
    minWidth: SIDEBAR_WIDTH,
    background: '#1a1a2e',
    color: '#fff',
    display: 'flex',
    flexDirection: 'column' as const,
    padding: '24px 0',
    position: 'fixed' as const,
    top: 0,
    left: 0,
    height: '100vh',
    zIndex: 200,
  } as React.CSSProperties,

  backdrop: {
    position: 'fixed' as const,
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    zIndex: 150,
  } as React.CSSProperties,

  menuButton: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 5,
    background: 'none',
    border: 'none',
    padding: 4,
    marginRight: 16,
    cursor: 'pointer',
  } as React.CSSProperties,

  menuBar: {
    width: 22,
    height: 2,
    borderRadius: 1,
    backgroundColor: '#1a1a2e',
  } as React.CSSProperties,

  sidebarTitle: {
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: 2,
    textTransform: 'uppercase' as const,
    color: '#a0a0b0',
    padding: '0 20px 20px',
    borderBottom: '1px solid #2e2e4a',
    marginBottom: 12,
  } as React.CSSProperties,

  nav: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 2,
    padding: '0 8px',
  } as React.CSSProperties,

  navLink: {
    display: 'block',
    padding: '10px 14px',
    borderRadius: 6,
    color: '#c0c0d0',
    textDecoration: 'none',
    fontSize: 14,
    fontWeight: 500,
    transition: 'background 0.15s',
  } as React.CSSProperties,

  navLinkActive: {
    background: '#16213e',
    color: '#ffffff',
  } as React.CSSProperties,

  logout: {
    margin: '12px 8px 0',
    padding: '10px 14px',
    borderRadius: 6,
    color: '#ff6b6b',
    fontSize: 14,
    fontWeight: 500,
    cursor: 'pointer',
    background: 'none',
    border: 'none',
    textAlign: 'left' as const,
    width: 'calc(100% - 16px)',
  } as React.CSSProperties,

  body: {
    marginLeft: SIDEBAR_WIDTH,
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    minHeight: '100vh',
  } as React.CSSProperties,

  topbar: {
    height: 56,
    background: '#ffffff',
    borderBottom: '1px solid #e5e7eb',
    display: 'flex',
    alignItems: 'center',
    padding: '0 28px',
    position: 'sticky' as const,
    top: 0,
    zIndex: 99,
  } as React.CSSProperties,

  topbarTitle: {
    fontSize: 16,
    fontWeight: 600,
    color: '#1a1a2e',
    letterSpacing: 0.3,
  } as React.CSSProperties,

  content: {
    flex: 1,
    padding: 32,
    background: '#f4f6f9',
  } as React.CSSProperties,
}

const navItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/club', label: 'Club' },
  { to: '/noticias', label: 'Noticias' },
  { to: '/jugadores', label: 'Jugadores' },
  { to: '/staff', label: 'Staff' },
  { to: '/fixture', label: 'Fixture' },
  { to: '/galerias', label: 'Galerías' },
  { to: '/multimedia', label: 'Multimedia' },
]

function AdminLayout() {
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/login', { replace: true })
  }

  useEffect(() => {
    if (!isMobile || !sidebarOpen) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setSidebarOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isMobile, sidebarOpen])

  return (
    <div style={styles.root}>
      {isMobile && sidebarOpen && (
        <div style={styles.backdrop} onClick={() => setSidebarOpen(false)} />
      )}
      <aside
        id="admin-sidebar"
        inert={isMobile && !sidebarOpen}
        style={{
          ...styles.sidebar,
          ...(isMobile
            ? {
                transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
                transition: 'transform 0.2s ease',
              }
            : {}),
        }}
      >
        <div style={styles.sidebarTitle}>Campito CMS</div>
        <nav style={styles.nav}>
          {navItems.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              style={({ isActive }) =>
                isActive
                  ? { ...styles.navLink, ...styles.navLinkActive }
                  : styles.navLink
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
        <button style={styles.logout} onClick={handleLogout}>Cerrar sesión</button>
      </aside>

      <div style={{ ...styles.body, marginLeft: isMobile ? 0 : SIDEBAR_WIDTH }}>
        <header style={{ ...styles.topbar, padding: isMobile ? '0 16px' : '0 28px' }}>
          {isMobile && (
            <button
              type="button"
              aria-label={sidebarOpen ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={sidebarOpen}
              aria-controls="admin-sidebar"
              onClick={() => setSidebarOpen(true)}
              style={styles.menuButton}
            >
              <span style={styles.menuBar} />
              <span style={styles.menuBar} />
              <span style={styles.menuBar} />
            </button>
          )}
          <span style={styles.topbarTitle}>Club Campito CMS</span>
        </header>
        <main style={{ ...styles.content, padding: isMobile ? 16 : 32 }}>
          <Suspense fallback={<PageFallback />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  )
}

export default AdminLayout

function PageFallback() {
  return (
    <div style={{ padding: 48, textAlign: 'center' as const, color: '#6b7280', fontSize: 14 }}>
      Cargando...
    </div>
  )
}

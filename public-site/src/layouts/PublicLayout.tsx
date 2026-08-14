import { useState } from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import { useIsMobile } from '../hooks/useMediaQuery'

const styles = {
  root: {
    display: 'flex',
    flexDirection: 'column' as const,
    minHeight: '100vh',
    fontFamily: 'system-ui, sans-serif',
    backgroundColor: '#ffffff',
    color: '#111111',
  } as React.CSSProperties,

  header: {
    borderBottom: '1px solid #e5e7eb',
    backgroundColor: '#ffffff',
    position: 'sticky' as const,
    top: 0,
    zIndex: 100,
  } as React.CSSProperties,

  headerInner: {
    maxWidth: 1200,
    margin: '0 auto',
    padding: '0 24px',
    height: 72,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  } as React.CSSProperties,

  brand: {
    fontSize: 18,
    fontWeight: 700,
    letterSpacing: 1,
    textTransform: 'uppercase' as const,
    color: '#123A9E',
    textDecoration: 'none',
  } as React.CSSProperties,

  nav: {
    display: 'flex',
    gap: 8,
    alignItems: 'center',
  } as React.CSSProperties,

  navLink: {
    padding: '8px 12px',
    borderRadius: 6,
    color: '#111111',
    textDecoration: 'none',
    fontSize: 14,
    fontWeight: 500,
    transition: 'background 0.15s, color 0.15s',
  } as React.CSSProperties,

  navLinkActive: {
    background: '#123A9E',
    color: '#ffffff',
  } as React.CSSProperties,

  menuButton: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 5,
    background: 'none',
    border: 'none',
    padding: 8,
    cursor: 'pointer',
  } as React.CSSProperties,

  menuBar: {
    width: 22,
    height: 2,
    borderRadius: 1,
    backgroundColor: '#123A9E',
  } as React.CSSProperties,

  navMobile: {
    position: 'absolute' as const,
    top: 72,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e5e7eb',
    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.08)',
    display: 'flex',
    flexDirection: 'column' as const,
    padding: '8px 16px 16px',
    gap: 2,
  } as React.CSSProperties,

  navLinkMobile: {
    padding: '12px 12px',
    borderRadius: 6,
    color: '#111111',
    textDecoration: 'none',
    fontSize: 15,
    fontWeight: 500,
    transition: 'background 0.15s, color 0.15s',
  } as React.CSSProperties,

  main: {
    flex: 1,
    maxWidth: 1200,
    width: '100%',
    margin: '0 auto',
    padding: '32px 24px',
    boxSizing: 'border-box' as const,
  } as React.CSSProperties,

  footer: {
    backgroundColor: '#123A9E',
    color: '#ffffff',
    padding: '24px',
    textAlign: 'center' as const,
    fontSize: 13,
  } as React.CSSProperties,

  footerInner: {
    maxWidth: 1200,
    margin: '0 auto',
  } as React.CSSProperties,
}

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/club', label: 'Club' },
  { to: '/equipos', label: 'Equipos' },
  { to: '/noticias', label: 'Noticias' },
  { to: '/fixture', label: 'Fixture' },
  { to: '/multimedia', label: 'Multimedia' },
  { to: '/comunidad', label: 'Comunidad' },
  { to: '/contacto', label: 'Contacto' },
]

function PublicLayout() {
  const year = new Date().getFullYear()
  const isMobile = useIsMobile()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div style={styles.root}>
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <NavLink to="/" style={styles.brand}>
            Club Atlético Campito
          </NavLink>
          {isMobile ? (
            <button
              type="button"
              aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(open => !open)}
              style={styles.menuButton}
            >
              <span style={styles.menuBar} />
              <span style={styles.menuBar} />
              <span style={styles.menuBar} />
            </button>
          ) : (
            <nav style={styles.nav}>
              {navItems.map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
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
          )}
        </div>
        {isMobile && menuOpen && (
          <nav style={styles.navMobile}>
            {navItems.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setMenuOpen(false)}
                style={({ isActive }) =>
                  isActive
                    ? { ...styles.navLinkMobile, ...styles.navLinkActive }
                    : styles.navLinkMobile
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
        )}
      </header>

      <main style={{ ...styles.main, padding: isMobile ? '24px 16px' : '32px 24px' }}>
        <Outlet />
      </main>

      <footer style={styles.footer}>
        <div style={styles.footerInner}>
          © {year} Club Atlético Campito — Colón, Entre Ríos, Argentina
        </div>
      </footer>
    </div>
  )
}

export default PublicLayout

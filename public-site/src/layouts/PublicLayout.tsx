import { Suspense } from 'react'
import { Outlet, NavLink } from 'react-router-dom'

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

  return (
    <div style={styles.root}>
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <NavLink to="/" style={styles.brand}>
            Club Atlético Campito
          </NavLink>
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
        </div>
      </header>

      <main style={styles.main}>
        <Suspense fallback={<PageFallback />}>
          <Outlet />
        </Suspense>
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

function PageFallback() {
  return (
    <div style={{ padding: '64px 24px', textAlign: 'center' as const, color: '#6b7280', fontSize: 14 }}>
      Cargando...
    </div>
  )
}

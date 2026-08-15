import { NavLink } from 'react-router-dom'

export const SIDEBAR_WIDTH = 220

export interface SidebarItem {
  to: string
  label: string
}

interface SidebarProps {
  items: SidebarItem[]
  open: boolean
  onNavigate: () => void
  onLogout: () => void
}

const styles = {
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
}

function Sidebar({ items, open, onNavigate, onLogout }: SidebarProps) {
  return (
    <aside
      id="admin-sidebar"
      inert={!open}
      style={{
        ...styles.sidebar,
        transform: open ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.2s ease',
      }}
    >
      <div style={styles.sidebarTitle}>Campito CMS</div>
      <nav style={styles.nav}>
        {items.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onNavigate}
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
      <button style={styles.logout} onClick={onLogout}>Cerrar sesión</button>
    </aside>
  )
}

export default Sidebar
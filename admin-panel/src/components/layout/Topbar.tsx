interface TopbarProps {
  title: string
  showMenu?: boolean
  menuExpanded?: boolean
  onMenuClick?: () => void
}

const styles = {
  topbar: {
    height: 56,
    background: '#ffffff',
    borderBottom: '1px solid #e5e7eb',
    display: 'flex',
    alignItems: 'center',
    position: 'sticky' as const,
    top: 0,
    zIndex: 99,
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

  title: {
    fontSize: 16,
    fontWeight: 600,
    color: '#1a1a2e',
    letterSpacing: 0.3,
  } as React.CSSProperties,
}

function Topbar({ title, showMenu = false, menuExpanded = false, onMenuClick }: TopbarProps) {
  return (
    <header style={{ ...styles.topbar, padding: showMenu ? '0 16px' : '0 28px' }}>
      {showMenu && (
        <button
          type="button"
          aria-label={menuExpanded ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={menuExpanded}
          aria-controls="admin-sidebar"
          onClick={onMenuClick}
          style={styles.menuButton}
        >
          <span style={styles.menuBar} />
          <span style={styles.menuBar} />
          <span style={styles.menuBar} />
        </button>
      )}
      <span style={styles.title}>{title}</span>
    </header>
  )
}

export default Topbar
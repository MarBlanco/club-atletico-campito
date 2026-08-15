import { Suspense, useEffect, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useIsMobile } from '../hooks/useMediaQuery'
import Sidebar, { SIDEBAR_WIDTH } from '../components/layout/Sidebar'
import Topbar from '../components/layout/Topbar'
import Footer from '../components/layout/Footer'

const styles = {
  root: {
    display: 'flex',
    minHeight: '100vh',
    fontFamily: 'system-ui, sans-serif',
  } as React.CSSProperties,

  backdrop: {
    position: 'fixed' as const,
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    zIndex: 150,
  } as React.CSSProperties,

  body: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    minHeight: '100vh',
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
      <Sidebar
        items={navItems}
        open={!isMobile || sidebarOpen}
        onNavigate={() => setSidebarOpen(false)}
        onLogout={handleLogout}
      />
      <div style={{ ...styles.body, marginLeft: isMobile ? 0 : SIDEBAR_WIDTH }}>
        <Topbar
          title="Club Campito CMS"
          showMenu={isMobile}
          menuExpanded={sidebarOpen}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main style={{ ...styles.content, padding: isMobile ? 16 : 32 }}>
          <Suspense fallback={<PageFallback />}>
            <Outlet />
          </Suspense>
        </main>
        <Footer text="© Club Atlético Campito — CMS" />
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
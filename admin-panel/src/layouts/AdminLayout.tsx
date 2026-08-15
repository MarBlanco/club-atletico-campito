import { Suspense, useEffect, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useIsMobile } from '../hooks/useMediaQuery'
import { useAuth } from '../context/AuthContext'
import Sidebar, { SIDEBAR_WIDTH, type SidebarItem } from '../components/layout/Sidebar'
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

const navItems: (SidebarItem & { adminOnly?: boolean })[] = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/club', label: 'Club', adminOnly: true },
  { to: '/noticias', label: 'Noticias' },
  { to: '/staff', label: 'People' },
  { to: '/jugadores', label: 'Jugadores' },
  { to: '/fixture', label: 'Fixture' },
  { to: '/multimedia', label: 'Multimedia' },
  { to: '/galerias', label: 'Momentos Campito' },
  { to: '/usuarios', label: 'Usuarios', adminOnly: true },
  { to: '/configuracion', label: 'Configuración', adminOnly: true },
]

function AdminLayout() {
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const { role } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const visibleNav: SidebarItem[] = navItems.filter(item => (item.adminOnly ? role === 'admin' : true))

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
        items={visibleNav}
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
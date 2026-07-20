import { createBrowserRouter } from 'react-router-dom'
import AdminLayout from '../layouts/AdminLayout'
import AuthGuard from '../components/common/AuthGuard'
import LoginPage from '../pages/LoginPage'
import DashboardPage from '../pages/DashboardPage'
import NoticiasPage from '../pages/NoticiasPage'
import JugadoresPage from '../pages/JugadoresPage'
import StaffPage from '../pages/StaffPage'
import FixturePage from '../pages/FixturePage'
import MultimediaPage from '../pages/MultimediaPage'
import GalleriesPage from '../pages/GalleriesPage'
import ClubPage from '../pages/ClubPage'

const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    element: <AuthGuard />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { path: '/dashboard', element: <DashboardPage /> },
          { path: '/club', element: <ClubPage /> },
          { path: '/noticias', element: <NoticiasPage /> },
          { path: '/jugadores', element: <JugadoresPage /> },
          { path: '/staff', element: <StaffPage /> },
          { path: '/fixture', element: <FixturePage /> },
          { path: '/multimedia', element: <MultimediaPage /> },
          { path: '/galerias', element: <GalleriesPage /> },
        ],
      },
    ],
  },
])

export default router

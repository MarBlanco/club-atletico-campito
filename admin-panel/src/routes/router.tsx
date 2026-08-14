/* eslint-disable react-refresh/only-export-components */
import { lazy } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import AdminLayout from '../layouts/AdminLayout'
import AuthGuard from '../components/common/AuthGuard'
import RoleGuard from '../components/common/RoleGuard'
import LoginPage from '../pages/LoginPage'

const DashboardPage = lazy(() => import('../pages/DashboardPage'))
const NoticiasPage = lazy(() => import('../pages/NoticiasPage'))
const JugadoresPage = lazy(() => import('../pages/JugadoresPage'))
const StaffPage = lazy(() => import('../pages/StaffPage'))
const FixturePage = lazy(() => import('../pages/FixturePage'))
const MultimediaPage = lazy(() => import('../pages/MultimediaPage'))
const GalleriesPage = lazy(() => import('../pages/GalleriesPage'))
const ClubPage = lazy(() => import('../pages/ClubPage'))
const ConfiguracionPage = lazy(() => import('../pages/ConfiguracionPage'))

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
          {
            path: '/configuracion',
            element: (
              <RoleGuard>
                <ConfiguracionPage />
              </RoleGuard>
            ),
          },
        ],
      },
    ],
  },
])

export default router

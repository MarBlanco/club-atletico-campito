/* eslint-disable react-refresh/only-export-components */
import { lazy } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import PublicLayout from '../layouts/PublicLayout'
import HomePage from '../pages/HomePage'

const ClubPage = lazy(() => import('../pages/ClubPage'))
const TeamsPage = lazy(() => import('../pages/TeamsPage'))
const FirstTeamPage = lazy(() => import('../pages/FirstTeamPage'))
const NewsPage = lazy(() => import('../pages/NewsPage'))
const NewsDetailPage = lazy(() => import('../pages/NewsDetailPage'))
const FixturePage = lazy(() => import('../pages/FixturePage'))
const MultimediaPage = lazy(() => import('../pages/MultimediaPage'))
const CommunityPage = lazy(() => import('../pages/CommunityPage'))
const ContactPage = lazy(() => import('../pages/ContactPage'))

const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/club', element: <ClubPage /> },
      { path: '/equipos', element: <TeamsPage /> },
      { path: '/equipos/primera', element: <FirstTeamPage /> },
      { path: '/noticias', element: <NewsPage /> },
      { path: '/noticias/:id', element: <NewsDetailPage /> },
      { path: '/fixture', element: <FixturePage /> },
      { path: '/multimedia', element: <MultimediaPage /> },
      { path: '/momentos', element: <CommunityPage /> },
      { path: '/contacto', element: <ContactPage /> },
    ],
  },
])

export default router

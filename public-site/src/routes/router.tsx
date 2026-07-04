import { createBrowserRouter } from 'react-router-dom'
import PublicLayout from '../layouts/PublicLayout'
import HomePage from '../pages/HomePage'
import ClubPage from '../pages/ClubPage'
import TeamsPage from '../pages/TeamsPage'
import FirstTeamPage from '../pages/FirstTeamPage'
import NewsPage from '../pages/NewsPage'
import FixturePage from '../pages/FixturePage'
import MultimediaPage from '../pages/MultimediaPage'
import CommunityPage from '../pages/CommunityPage'
import ContactPage from '../pages/ContactPage'

const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/club', element: <ClubPage /> },
      { path: '/equipos', element: <TeamsPage /> },
      { path: '/equipos/primera', element: <FirstTeamPage /> },
      { path: '/noticias', element: <NewsPage /> },
      { path: '/fixture', element: <FixturePage /> },
      { path: '/multimedia', element: <MultimediaPage /> },
      { path: '/comunidad', element: <CommunityPage /> },
      { path: '/contacto', element: <ContactPage /> },
    ],
  },
])

export default router

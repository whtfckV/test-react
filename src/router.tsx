import { createHashRouter, Navigate } from 'react-router'
import { RequireAuth } from './components/RequireAuth'
import { LoginPage } from './pages/LoginPage'
import { ChatsPage } from './pages/ChatsPage'
import { ChatWindow, EmptyChat } from './components/ChatWindow'

// HashRouter: GitHub Pages не умеет SPA-fallback, поэтому маршруты живут после #
export const router = createHashRouter([
  { path: '/login', element: <LoginPage /> },
  {
    element: <RequireAuth />,
    children: [
      {
        path: '/',
        element: <ChatsPage />,
        children: [
          { index: true, element: <EmptyChat /> },
          { path: 'chat/:chatId', element: <ChatWindow /> },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
])

import { createHashRouter, Navigate } from 'react-router-dom';
import Layout from '../components/Layout';
import AuthGuard from '../components/AuthGuard';
import ChatPage from '../pages/ChatPage';
import NewChatPage from '../pages/NewChatPage';
import SettingsPage from '../pages/SettingsPage';
import LoginPage from '../pages/LoginPage';

export const router = createHashRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: <AuthGuard />,
    children: [
      {
        path: '/',
        element: <Layout />,
        children: [
          { index: true, element: <Navigate to="/chat/new" replace /> },
          { path: 'chat/new', element: <NewChatPage /> },
          { path: 'chat/:sessionId', element: <ChatPage /> },
          { path: 'settings', element: <SettingsPage /> },
        ],
      },
    ],
  },
]);
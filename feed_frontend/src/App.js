import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { SessionProvider, useSession } from './context/SessionContext';
import FeedPage from './pages/FeedPage';
import ProfilePage from './pages/ProfilePage';
import ModerationPage from './pages/ModerationPage';
import AuthPage from './pages/AuthPage';
import Layout from './components/Layout';

// PUBLIC_INTERFACE
export default function App() {
  /** Root app with session provider and routing */
  return (
    <SessionProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </SessionProvider>
  );
}

function AppRoutes() {
  const { session, loading } = useSession();

  if (loading) {
    return <div style={{ display: 'grid', placeItems: 'center', height: '100vh' }}>Loading…</div>;
  }

  return (
    <Routes>
      {!session ? (
        <>
          <Route path="/auth" element={<AuthPage />} />
          <Route path="*" element={<Navigate to="/auth" replace />} />
        </>
      ) : (
        <>
          <Route element={<Layout />}>
            <Route index element={<FeedPage />} />
            <Route path="/profile/:id" element={<ProfilePage />} />
            <Route path="/moderation" element={<ModerationPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </>
      )}
    </Routes>
  );
}

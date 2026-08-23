import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuthBootstrap } from '@/features/auth/hooks/useAuthBootstrap';
import { useThemeEffect } from '@/hooks/useThemeEffect';
import { ProtectedRoute } from '@/routes/ProtectedRoute';
import { PublicOnlyRoute } from '@/routes/PublicOnlyRoute';
import { AppShell } from '@/components/layout/AppShell';
import { FullScreenLoader } from '@/components/layout/FullScreenLoader';
import { ToastViewport } from '@/components/feedback/ToastViewport';

// Route-level code splitting per assignment requirement (React.lazy + Suspense).
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const BoardPage = lazy(() => import('@/pages/BoardPage'));
const AnalyticsPage = lazy(() => import('@/pages/AnalyticsPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

export function App() {
  const { isBootstrapping } = useAuthBootstrap();
  useThemeEffect();

  if (isBootstrapping) {
    return <FullScreenLoader label="Validating your session…" />;
  }

  return (
    <>
      <Suspense fallback={<FullScreenLoader label="Loading page…" />}>
        <Routes>
          <Route
            path="/login"
            element={
              <PublicOnlyRoute>
                <LoginPage />
              </PublicOnlyRoute>
            }
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <AppShell>
                  <DashboardPage />
                </AppShell>
              </ProtectedRoute>
            }
          />

          <Route
            path="/board"
            element={
              <ProtectedRoute>
                <AppShell>
                  <BoardPage />
                </AppShell>
              </ProtectedRoute>
            }
          />

          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <AppShell>
                  <AnalyticsPage />
                </AppShell>
              </ProtectedRoute>
            }
          />

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
      <ToastViewport />
    </>
  );
}

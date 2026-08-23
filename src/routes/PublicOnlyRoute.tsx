import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/authStore';

export function PublicOnlyRoute({ children }: { children: ReactNode }) {
  const status = useAuthStore((s) => s.status);

  if (status === 'authenticated') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

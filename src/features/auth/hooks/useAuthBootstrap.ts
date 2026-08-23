import { useEffect } from 'react';
import { authApi } from '@/features/auth/api/authApi';
import { useAuthStore } from '@/features/auth/store/authStore';

/**
 * Runs once on app mount. If a refresh token survived from a previous
 * session, it silently exchanges it for a new access token so the user
 * doesn't have to log in again after a page refresh. Otherwise the user
 * is marked unauthenticated and routed to /login by ProtectedRoute.
 */
export function useAuthBootstrap() {
  const refreshToken = useAuthStore((s) => s.refreshToken);
  const status = useAuthStore((s) => s.status);
  const setTokens = useAuthStore((s) => s.setTokens);
  const setUser = useAuthStore((s) => s.setUser);
  const setStatus = useAuthStore((s) => s.setStatus);
  const logout = useAuthStore((s) => s.logout);

  useEffect(() => {
    let cancelled = false;

    async function restore() {
      if (!refreshToken) {
        setStatus('unauthenticated');
        return;
      }

      setStatus('authenticating');
      try {
        const tokens = await authApi.refresh(refreshToken);
        if (cancelled) return;
        setTokens(tokens);
        const user = await authApi.getCurrentUser();
        if (cancelled) return;
        setUser(user);
      } catch {
        if (!cancelled) logout();
      }
    }

    void restore();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount
  }, []);

  return { isBootstrapping: status === 'idle' || status === 'authenticating' };
}

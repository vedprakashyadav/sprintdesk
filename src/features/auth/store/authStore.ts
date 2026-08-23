import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthUser } from '@/types';

interface Tokens {
  accessToken: string;
  refreshToken: string;
}

interface AuthState {
  // Access token intentionally lives only in memory (not persisted) so a
  // stolen localStorage dump can't be replayed as a valid session by itself.
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  status: 'idle' | 'authenticating' | 'authenticated' | 'unauthenticated';
  setTokens: (tokens: Tokens) => void;
  setUser: (user: AuthUser) => void;
  setStatus: (status: AuthState['status']) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      status: 'idle',
      setTokens: ({ accessToken, refreshToken }) =>
        set({ accessToken, refreshToken, status: 'authenticated' }),
      setUser: (user) => set({ user }),
      setStatus: (status) => set({ status }),
      logout: () =>
        set({ accessToken: null, refreshToken: null, user: null, status: 'unauthenticated' }),
    }),
    {
      name: 'sprintdesk-auth',
      // Only the refresh token + user profile survive a refresh; the access
      // token is re-derived via silent refresh on app boot (see useAuthBootstrap).
      partialize: (state) => ({ refreshToken: state.refreshToken, user: state.user }),
    },
  ),
);

import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/features/auth/store/authStore';

const BASE_URL = import.meta.env.VITE_DUMMYJSON_BASE_URL ?? 'https://dummyjson.com';

export const httpClient = axios.create({ baseURL: BASE_URL });

// Attach the in-memory access token to every outgoing request.
httpClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

// Track a single in-flight refresh so concurrent 401s don't trigger
// multiple refresh calls.
let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = useAuthStore.getState().refreshToken;
  if (!refreshToken) return null;

  try {
    const { data } = await axios.post(`${BASE_URL}/auth/refresh`, {
      refreshToken,
      expiresInMins: 30,
    });
    useAuthStore.getState().setTokens({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    });
    return data.accessToken as string;
  } catch {
    useAuthStore.getState().logout();
    return null;
  }
}

interface RetriableConfig extends InternalAxiosRequestConfig {
  _retried?: boolean;
}

// Silent refresh + single retry on 401.
httpClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetriableConfig | undefined;

    if (error.response?.status === 401 && originalRequest && !originalRequest._retried) {
      originalRequest._retried = true;

      refreshPromise ??= refreshAccessToken().finally(() => {
        refreshPromise = null;
      });

      const newToken = await refreshPromise;
      if (newToken) {
        originalRequest.headers.set('Authorization', `Bearer ${newToken}`);
        return httpClient(originalRequest);
      }
    }

    return Promise.reject(error);
  },
);

import { httpClient } from '@/lib/httpClient';
import type { LoginCredentials, LoginResponse, RefreshResponse } from '@/types';

export const authApi = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const { data } = await httpClient.post<LoginResponse>('/auth/login', {
      ...credentials,
      expiresInMins: credentials.expiresInMins ?? 30,
    });
    return data;
  },

  async refresh(refreshToken: string): Promise<RefreshResponse> {
    const { data } = await httpClient.post<RefreshResponse>('/auth/refresh', {
      refreshToken,
      expiresInMins: 30,
    });
    return data;
  },

  async getCurrentUser(): Promise<LoginResponse> {
    const { data } = await httpClient.get<LoginResponse>('/auth/me');
    return data;
  },
};

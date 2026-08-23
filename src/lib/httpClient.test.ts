import { beforeEach, describe, expect, it, vi } from 'vitest';
import axios from 'axios';
import type { httpClient as HttpClientType } from './httpClient';
import type { useAuthStore as AuthStoreType } from '@/features/auth/store/authStore';

// Auto-mock axios; we configure axios.create()'s return value per-test and
// re-import httpClient (via vi.resetModules) so it registers interceptors
// against a fresh mock instance every time. Because resetModules reloads
// every module in the graph -- including the Zustand auth store that
// httpClient depends on -- we must also re-import the store fresh in each
// test and interact with *that* instance, not a statically-imported one.
vi.mock('axios', () => ({
  default: {
    create: vi.fn(),
    post: vi.fn(),
  },
}));

describe('httpClient auth interceptor', () => {
  let mockInstance: ReturnType<typeof vi.fn> & {
    interceptors: {
      request: { use: ReturnType<typeof vi.fn> };
      response: { use: ReturnType<typeof vi.fn> };
    };
  };
  let requestHandlers: { onFulfilled?: (config: any) => any };
  let responseHandlers: { onFulfilled?: (res: unknown) => unknown; onRejected?: (err: unknown) => unknown };
  let httpClient: typeof HttpClientType;
  let useAuthStore: typeof AuthStoreType;

  beforeEach(async () => {
    vi.resetModules();
    requestHandlers = {};
    responseHandlers = {};

    mockInstance = vi.fn((config: any) => Promise.resolve({ config, data: 'retried-ok' })) as any;
    mockInstance.interceptors = {
      request: {
        use: vi.fn((fn: any) => {
          requestHandlers.onFulfilled = fn;
        }),
      },
      response: {
        use: vi.fn((onFulfilled: any, onRejected: any) => {
          responseHandlers.onFulfilled = onFulfilled;
          responseHandlers.onRejected = onRejected;
        }),
      },
    };

    vi.mocked(axios.create).mockReturnValue(mockInstance as any);
    vi.mocked(axios.post).mockReset();

    // Re-import both modules together so httpClient's interceptors close
    // over the SAME store instance we assert against below.
    const authMod = await import('@/features/auth/store/authStore');
    useAuthStore = authMod.useAuthStore;
    const httpMod = await import('./httpClient');
    httpClient = httpMod.httpClient;

    useAuthStore.setState({
      accessToken: 'old-access-token',
      refreshToken: 'valid-refresh-token',
      user: null,
      status: 'authenticated',
    });
  });

  it('exports a configured axios instance', () => {
    expect(httpClient).toBeDefined();
  });

  it('attaches the bearer token to outgoing requests', () => {
    const setHeader = vi.fn();
    const config = { headers: { set: setHeader } };

    requestHandlers.onFulfilled?.(config);

    expect(setHeader).toHaveBeenCalledWith('Authorization', 'Bearer old-access-token');
  });

  it('refreshes the token and retries the original request on a 401', async () => {
    vi.mocked(axios.post).mockResolvedValueOnce({
      data: { accessToken: 'new-access-token', refreshToken: 'new-refresh-token' },
    } as any);

    const setHeader = vi.fn();
    const originalRequest = { headers: { set: setHeader }, url: '/protected' };
    const error = { response: { status: 401 }, config: originalRequest };

    await responseHandlers.onRejected?.(error);

    expect(axios.post).toHaveBeenCalledWith(
      expect.stringContaining('/auth/refresh'),
      expect.objectContaining({ refreshToken: 'valid-refresh-token' }),
    );
    expect(useAuthStore.getState().accessToken).toBe('new-access-token');
    expect(setHeader).toHaveBeenCalledWith('Authorization', 'Bearer new-access-token');
    expect(mockInstance).toHaveBeenCalledWith(originalRequest);
  });

  it('logs the user out if the refresh call itself fails', async () => {
    vi.mocked(axios.post).mockRejectedValueOnce(new Error('refresh expired'));

    const originalRequest = { headers: { set: vi.fn() }, url: '/protected' };
    const error = { response: { status: 401 }, config: originalRequest };

    await expect(responseHandlers.onRejected?.(error)).rejects.toBeDefined();
    expect(useAuthStore.getState().status).toBe('unauthenticated');
    expect(useAuthStore.getState().accessToken).toBeNull();
  });

  it('does not retry a request that has already been retried once', async () => {
    const originalRequest = { headers: { set: vi.fn() }, url: '/protected', _retried: true };
    const error = { response: { status: 401 }, config: originalRequest };

    await expect(responseHandlers.onRejected?.(error)).rejects.toBe(error);
    expect(axios.post).not.toHaveBeenCalled();
  });
});

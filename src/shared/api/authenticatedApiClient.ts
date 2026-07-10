import { refreshSession } from '@/src/features/auth/services/authService';
import { authStore } from '@/src/store/useAuthStore';
import { router } from 'expo-router';
import { ApiClient, ApiError, ApiRequestOptions, FetchApiClient } from './apiClient';

let refreshPromise: Promise<void> | null = null;

async function ensureRefreshed(): Promise<void> {
  if (!refreshPromise) {
    refreshPromise = refreshSession().finally(() => {
      refreshPromise = null;
    });
  }
  await refreshPromise;
}

function getAccessToken(): string | undefined {
  return authStore.getState().session?.accessToken;
}

export class AuthenticatedApiClient implements ApiClient {
  private readonly inner: FetchApiClient;

  constructor(baseUrl: string) {
    this.inner = new FetchApiClient(baseUrl);
  }

  async request<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
    const tokenAtSend = getAccessToken();

    try {
      return await this.inner.request<T>(path, withAuth(options, tokenAtSend));
    } catch (error) {
      if (!(error instanceof ApiError && error.code === 401)) throw error;

      // Başka bir paralel istek bizim isteğimiz havadayken token'ı yenilemiş
      // olabilir. Bu durumda ikinci bir refresh'i tetiklemeden yeni token'la
      // retry yeterli — refresh-token rotation'da gereksiz yarış engellenir.
      const tokenNow = getAccessToken();
      if (tokenNow && tokenNow !== tokenAtSend) {
        return await this.inner.request<T>(path, withAuth(options, tokenNow));
      }

      try {
        await ensureRefreshed();
      } catch {
        authStore.clear();
        router.replace('/login');
        throw error;
      }

      return await this.inner.request<T>(path, withAuth(options, getAccessToken()));
    }
  }
}

function withAuth(options: ApiRequestOptions, token: string | undefined): ApiRequestOptions {
  if (!token) return options;
  return {
    ...options,
    headers: { Authorization: `Bearer ${token}`, ...options.headers },
  };
}

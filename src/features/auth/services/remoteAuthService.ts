import { appConfig, getKeycloakBaseUrl, getKeycloakRealm } from '@/src/config/appConfig';
import {
  LoginResponseDto,
  RegisterResponseDto,
  SetPasswordResponseDto,
} from '@/src/features/auth/api/contracts';
import { AuthSession } from '@/src/features/auth/types';
import { ApiError, FetchApiClient } from '@/src/shared/api/apiClient';
import { authStore } from '@/src/store/useAuthStore';
import { registerForPushNotifications } from './notificationService';
import {
  mapLoginPayloadToDto,
  mapPasswordResetPayloadToDto,
  mapRegisterPayloadToDto,
  mapSetPasswordPayloadToDto,
} from './payloadMappers';
import { mapLoginResponseToSession } from './tokenMapper';
import { AuthService } from './types';
import { ensureEmail, ensurePassword, ensureUsername } from './validators';
import { runVersionCheck } from './versionService';

const keycloakApiClient = new FetchApiClient(getKeycloakBaseUrl());
const mosApiClient = new FetchApiClient(appConfig.api.baseUrl);

export async function refreshSession(): Promise<void> {
  const { session } = authStore.getState();
  if (!session?.refreshToken) throw new Error('Oturum yenilenemedi.');

  const formBody = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: session.refreshToken,
    client_id: 'mobile-api',
  }).toString();

  const tokenResponse = await keycloakApiClient.request<LoginResponseDto>(
    `/auth/realms/${getKeycloakRealm()}/protocol/openid-connect/token`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formBody,
    },
  );

  const newSession = mapLoginResponseToSession(tokenResponse);
  authStore.updateSession(newSession);
}

export const remoteAuthService: AuthService = {
  async login(payload): Promise<AuthSession> {
    const dto = mapLoginPayloadToDto(payload);
    ensureUsername(dto.username);
    ensurePassword(dto.password);

    await runVersionCheck();

    const formBody = new URLSearchParams({
      grant_type: 'password',
      username: dto.username,
      password: dto.password,
      client_id: 'mobile-api',
    }).toString();

    let tokenResponse: LoginResponseDto;

    try {
      tokenResponse = await keycloakApiClient.request<LoginResponseDto>(
        `/auth/realms/${getKeycloakRealm()}/protocol/openid-connect/token`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: formBody,
        },
      );
    } catch (error) {
      if (error instanceof ApiError && error.code === 'invalid_grant') {
        throw new Error('Kullanici adi veya sifre hatali.');
      }
      throw error;
    }

    const session = mapLoginResponseToSession(tokenResponse);
    registerForPushNotifications(session.accessToken).catch((err) => {
      if (__DEV__) {
        console.warn('[Push] Kayit basarisiz:', err?.message ?? err);
      }
    });
    return session;
  },

  async register(payload): Promise<string | null> {
    const dto = mapRegisterPayloadToDto(payload);

    if (!dto.firstName || !dto.lastName) {
      throw new Error('Ad ve soyad alanlari zorunludur.');
    }

    ensureEmail(dto.email);

    const registerResponse = await mosApiClient.request<RegisterResponseDto>(
      '/mos/api/v3/register',
      {
        method: 'POST',
        body: dto,
      },
    );

    if (registerResponse.code !== 200) {
      throw new Error(registerResponse.message || 'Kayit islemi tamamlanamadi.');
    }

    return registerResponse.message;
  },

  async setPassword(payload): Promise<string | null> {
    const dto = mapSetPasswordPayloadToDto(payload);
    ensureEmail(dto.email);
    ensurePassword(dto.newPassword);

    const setPasswordResponse = await mosApiClient.request<SetPasswordResponseDto>(
      '/mos/api/v3/set-password',
      {
        method: 'POST',
        body: dto,
      },
    );

    if (setPasswordResponse.code !== 200) {
      throw new Error(setPasswordResponse.message || 'Sifre guncelleme islemi tamamlanamadi.');
    }

    return setPasswordResponse.message;
  },

  async requestPasswordReset(payload): Promise<void> {
    await mosApiClient.request('/mos/api/v3/forgot-password', {
      method: 'POST',
      body: mapPasswordResetPayloadToDto(payload),
    });
  },
};

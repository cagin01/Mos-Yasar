import type { AuthUserDto, LoginResponseDto } from '@/src/features/auth/api/contracts';
import type { AuthSession } from '@/src/features/auth/types';

interface JwtPayload {
  sub?: string;
  name?: string;
  given_name?: string;
  email?: string;
  preferred_username?: string;
  organizationName?: string;
  realm_access?: {
    roles?: string[];
  };
}

function decodeBase64Url(value: string) {
  const normalizedValue = value.replace(/-/g, '+').replace(/_/g, '/');
  const padding = normalizedValue.length % 4;
  const paddedValue =
    padding === 0 ? normalizedValue : normalizedValue + '='.repeat(4 - padding);

  if (typeof atob === 'function') {
    const decoded = atob(paddedValue);
    return decodeURIComponent(
      Array.from(decoded)
        .map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, '0')}`)
        .join(''),
    );
  }

  throw new Error('Token cozumlenemedi.');
}

function parseJwtPayload(token: string): JwtPayload {
  const parts = token.split('.');

  if (parts.length < 2) {
    throw new Error('Gecersiz token alindi.');
  }

  return JSON.parse(decodeBase64Url(parts[1])) as JwtPayload;
}

function mapJwtPayloadToUser(payload: JwtPayload): AuthUserDto {
  return {
    id: payload.sub ?? 'unknown-user',
    fullName: payload.given_name ?? payload.name ?? payload.preferred_username ?? 'Kullanici',
    email: payload.email ?? '',
    company: payload.organizationName ?? '',
    roles: payload.realm_access?.roles ?? [],
    username: payload.preferred_username ?? '',
  };
}

export function mapLoginResponseToSession(response: LoginResponseDto): AuthSession {
  if (!response.access_token) {
    throw new Error('Giris islemi tamamlanamadi.');
  }

  const tokenPayload = parseJwtPayload(response.access_token);
  const user = mapJwtPayloadToUser(tokenPayload);

  return {
    accessToken: response.access_token,
    refreshToken: response.refresh_token,
    user,
    mode: 'remote',
  };
}

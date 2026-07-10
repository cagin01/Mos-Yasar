import { AuthUserDto } from '@/src/features/auth/api/contracts';
import { AuthSession } from '@/src/features/auth/types';
import {
  mapLoginPayloadToDto,
  mapPasswordResetPayloadToDto,
  mapRegisterPayloadToDto,
  mapSetPasswordPayloadToDto,
} from './payloadMappers';
import { AuthService } from './types';
import { ensureEmail, ensurePassword, ensureUsername } from './validators';

const MOCK_USER: AuthUserDto = {
  id: 'user-1',
  fullName: 'Burak Koctas',
  email: 'burak.koctas@yasarbilgi.com.tr',
  company: 'Yasar Bilgi',
  roles: ['bulk_approve'],
  username: 'burakkoctas',
};

export const mockAuthService: AuthService = {
  async login(payload): Promise<AuthSession> {
    const dto = mapLoginPayloadToDto(payload);
    ensureUsername(dto.username);
    ensurePassword(dto.password);

    return {
      accessToken: 'mock-session-token',
      refreshToken: 'mock-refresh-token',
      user: {
        ...MOCK_USER,
        username: dto.username,
      },
      mode: 'mock',
    };
  },

  async register(payload): Promise<string | null> {
    const dto = mapRegisterPayloadToDto(payload);

    if (!dto.firstName || !dto.lastName) {
      throw new Error('Ad ve soyad alanlari zorunludur.');
    }

    ensureEmail(dto.email);
    return 'Gecici sifre e-posta ile gonderildi.';
  },

  async setPassword(payload): Promise<string | null> {
    const dto = mapSetPasswordPayloadToDto(payload);
    ensureEmail(dto.email);
    ensurePassword(dto.newPassword);
    return 'Sifre guncellendi.';
  },

  async requestPasswordReset(payload): Promise<void> {
    const dto = mapPasswordResetPayloadToDto(payload);
    ensureEmail(dto.email);
  },
};

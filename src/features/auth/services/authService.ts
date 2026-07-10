import { isRemoteAuthEnabled } from '@/src/config/appConfig';
import { mockAuthService } from './mockAuthService';
import { refreshSession, remoteAuthService } from './remoteAuthService';
import { AuthService } from './types';

export { refreshSession };
export { sanitizeUsernameInput } from './validators';
export type { AuthService } from './types';

export const authService: AuthService = {
  async login(payload) {
    return isRemoteAuthEnabled()
      ? remoteAuthService.login(payload)
      : mockAuthService.login(payload);
  },
  async register(payload) {
    return isRemoteAuthEnabled()
      ? remoteAuthService.register(payload)
      : mockAuthService.register(payload);
  },
  async setPassword(payload) {
    return isRemoteAuthEnabled()
      ? remoteAuthService.setPassword(payload)
      : mockAuthService.setPassword(payload);
  },
  async requestPasswordReset(payload) {
    return isRemoteAuthEnabled()
      ? remoteAuthService.requestPasswordReset(payload)
      : mockAuthService.requestPasswordReset(payload);
  },
};

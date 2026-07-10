import {
  AuthSession,
  LoginPayload,
  PasswordResetPayload,
  RegisterPayload,
  SetPasswordPayload,
} from '@/src/features/auth/types';

export interface AuthService {
  login(payload: LoginPayload): Promise<AuthSession>;
  register(payload: RegisterPayload): Promise<string | null>;
  setPassword(payload: SetPasswordPayload): Promise<string | null>;
  requestPasswordReset(payload: PasswordResetPayload): Promise<void>;
}

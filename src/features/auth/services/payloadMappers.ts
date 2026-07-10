import type {
  LoginRequestDto,
  PasswordResetRequestDto,
  RegisterRequestDto,
  SetPasswordRequestDto,
} from '@/src/features/auth/api/contracts';
import type {
  LoginPayload,
  PasswordResetPayload,
  RegisterPayload,
  SetPasswordPayload,
} from '@/src/features/auth/types';
import { trimEdgeSpaces } from './validators';

export function mapLoginPayloadToDto(payload: LoginPayload): LoginRequestDto {
  return {
    username: trimEdgeSpaces(payload.username),
    password: payload.password,
    rememberMe: payload.rememberMe,
  };
}

export function mapRegisterPayloadToDto(payload: RegisterPayload): RegisterRequestDto {
  return {
    firstName: payload.firstName.trim(),
    lastName: payload.lastName.trim(),
    email: payload.email.trim().toLowerCase(),
  };
}

export function mapPasswordResetPayloadToDto(payload: PasswordResetPayload): PasswordResetRequestDto {
  return {
    email: payload.email.trim().toLowerCase(),
  };
}

export function mapSetPasswordPayloadToDto(payload: SetPasswordPayload): SetPasswordRequestDto {
  return {
    email: payload.email.trim(),
    newPassword: payload.newPassword,
  };
}

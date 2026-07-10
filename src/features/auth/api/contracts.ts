export interface LoginRequestDto {
  username: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequestDto {
  firstName: string;
  lastName: string;
  email: string;
}

export interface PasswordResetRequestDto {
  email: string;
}

export interface SetPasswordRequestDto {
  email: string;
  newPassword: string;
}

export interface AuthUserDto {
  id: string;
  fullName: string;
  email: string;
  company: string;
  roles: string[];
  username: string;
}

export interface LoginResponseDto {
  access_token: string;
  expires_in: number;
  refresh_expires_in: number;
  refresh_token: string;
  token_type: string;
  'not-before-policy': number;
  session_state: string;
  scope: string;
}

export interface LoginErrorResponseDto {
  error?: string;
  error_description?: string;
}

export interface VersionCheckResponseDto {
  code: number;
  message: string;
  data: unknown;
  dataList: unknown;
  title: string | null;
}

export interface PasswordResetResponseDto {
  message: string;
}

export interface RegisterResponseDto {
  code: number;
  message: string | null;
  data: unknown;
  dataList: unknown;
  title: string | null;
}

export interface SetPasswordResponseDto {
  code: number;
  message: string | null;
  data: unknown;
  dataList: unknown;
  title: string | null;
}

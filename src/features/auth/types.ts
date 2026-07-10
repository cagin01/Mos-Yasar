export interface LoginPayload {
  username: string;
  password: string;
  rememberMe: boolean;
}

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
}

export interface PasswordResetPayload {
  email: string;
}

export interface SetPasswordPayload {
  email: string;
  newPassword: string;
}

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  company: string;
  roles: string[];
  username: string;
}

export interface AuthSession {
  user: AuthUser;
  accessToken: string;
  refreshToken?: string;
  mode: 'mock' | 'remote';
}

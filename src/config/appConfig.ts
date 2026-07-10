import Constants from 'expo-constants';

export const API_BASE_URL = 'https://mos-tst.yasar.com.tr';
export const KEYCLOAK_BASE_URL = 'https://oauthtest.yasar.com.tr';
export const KEYCLOAK_REALM = 'Mobil.Onay';
export const APP_VERSION_BY_PLATFORM = {
  ios: '2.4.4',
  android: '2.4.1',
} as const;

export type ApiMode = 'mock' | 'remote';

export interface RuntimeApiConfig {
  mode: ApiMode;
  baseUrl: string;
  timeoutMs: number;
}

export interface AppConfig {
  api: RuntimeApiConfig;
  auth: Pick<RuntimeApiConfig, 'mode' | 'timeoutMs'>;
}

interface ExpoExtraConfig {
  api?: Partial<RuntimeApiConfig>;
  auth?: Partial<Pick<RuntimeApiConfig, 'mode' | 'timeoutMs'>> & {
    baseUrl?: string;
    realm?: string;
  };
}

const extra = (Constants.expoConfig?.extra ?? {}) as ExpoExtraConfig;

const fallbackConfig: AppConfig = {
  api: {
    mode: 'remote',
    baseUrl: API_BASE_URL,
    timeoutMs: 10000,
  },
  auth: {
    mode: 'remote',
    timeoutMs: 10000,
  },
};

export const appConfig: AppConfig = {
  api: {
    mode: extra.api?.mode ?? fallbackConfig.api.mode,
    baseUrl: extra.api?.baseUrl ?? fallbackConfig.api.baseUrl,
    timeoutMs: extra.api?.timeoutMs ?? fallbackConfig.api.timeoutMs,
  },
  auth: {
    mode: extra.auth?.mode ?? fallbackConfig.auth.mode,
    timeoutMs: extra.auth?.timeoutMs ?? fallbackConfig.auth.timeoutMs,
  },
};

export function getKeycloakBaseUrl() {
  return extra.auth?.baseUrl ?? KEYCLOAK_BASE_URL;
}

export function getKeycloakRealm() {
  return extra.auth?.realm ?? KEYCLOAK_REALM;
}

export function isRemoteApiEnabled() {
  return appConfig.api.mode === 'remote' && Boolean(appConfig.api.baseUrl);
}

export function isRemoteAuthEnabled() {
  return appConfig.auth.mode === 'remote';
}

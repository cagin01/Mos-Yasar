import { appConfig, isRemoteApiEnabled } from '@/src/config/appConfig';
import { createExternalStore } from './createExternalStore';

export interface AppEnvironment {
  apiMode: 'mock' | 'remote';
  apiBaseUrl: string;
  apiTimeoutMs: number;
  servicesReady: boolean;
}

interface AppState {
  environment: AppEnvironment;
}

const store = createExternalStore<AppState>({
  environment: {
    apiMode: appConfig.api.mode,
    apiBaseUrl: appConfig.api.baseUrl,
    apiTimeoutMs: appConfig.api.timeoutMs,
    servicesReady: appConfig.api.mode === 'mock' || isRemoteApiEnabled(),
  },
});

export const appStore = {
  getState: store.getState,
  setEnvironment(environment: Partial<AppEnvironment>) {
    store.setState((currentState) => ({
      environment: {
        ...currentState.environment,
        ...environment,
      },
    }));
  },
};

export function useAppStore() {
  const state = store.useStore();

  return {
    ...state,
    setEnvironment: appStore.setEnvironment,
  };
}

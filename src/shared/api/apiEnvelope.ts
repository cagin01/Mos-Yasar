import { router } from 'expo-router';

import { authStore } from '@/src/store/useAuthStore';
import { getApiEnvelopeErrorMessage, isUnauthorizedEnvelope } from './apiEnvelopeUtils';

export interface ApiEnvelope<T = unknown> {
  code: number;
  message: string | null;
  title: string | null;
  data?: T;
}

export function assertApiSuccess(response: ApiEnvelope): void {
  if (response.code === 200) return;

  if (isUnauthorizedEnvelope(response)) {
    authStore.clear();
    router.replace('/login');
    return;
  }

  throw new Error(getApiEnvelopeErrorMessage(response));
}

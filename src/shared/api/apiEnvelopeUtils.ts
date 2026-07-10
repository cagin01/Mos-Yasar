import type { ApiEnvelope } from './apiEnvelope';

export function getApiEnvelopeErrorMessage(response: ApiEnvelope) {
  return response.title || response.message || 'Islem gerceklestirilemedi.';
}

export function isUnauthorizedEnvelope(response: ApiEnvelope) {
  return response.code === 401;
}

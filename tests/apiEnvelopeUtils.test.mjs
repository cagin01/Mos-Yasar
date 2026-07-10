import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  getApiEnvelopeErrorMessage,
  isUnauthorizedEnvelope,
} from '../src/shared/api/apiEnvelopeUtils.ts';

describe('apiEnvelopeUtils', () => {
  it('detects unauthorized envelopes', () => {
    assert.equal(isUnauthorizedEnvelope({ code: 401, message: null, title: null }), true);
    assert.equal(isUnauthorizedEnvelope({ code: 403, message: null, title: null }), false);
  });

  it('selects title, message, then fallback error text', () => {
    assert.equal(
      getApiEnvelopeErrorMessage({ code: 500, title: 'Baslik', message: 'Mesaj' }),
      'Baslik',
    );
    assert.equal(
      getApiEnvelopeErrorMessage({ code: 500, title: null, message: 'Mesaj' }),
      'Mesaj',
    );
    assert.equal(
      getApiEnvelopeErrorMessage({ code: 500, title: null, message: null }),
      'Islem gerceklestirilemedi.',
    );
  });
});

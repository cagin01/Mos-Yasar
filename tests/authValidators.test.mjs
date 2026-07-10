import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  ensureEmail,
  ensurePassword,
  ensureUsername,
  sanitizeUsernameInput,
  trimEdgeSpaces,
} from '../src/features/auth/services/validators.ts';

describe('auth validators', () => {
  it('trims only edge whitespace', () => {
    assert.equal(trimEdgeSpaces('  user name  '), 'user name');
    assert.equal(sanitizeUsernameInput('  user.name  '), 'user.name');
  });

  it('accepts non-empty username, password and email', () => {
    assert.doesNotThrow(() => ensureUsername('user'));
    assert.doesNotThrow(() => ensurePassword('secret'));
    assert.doesNotThrow(() => ensureEmail('user@yasar.com.tr'));
  });

  it('rejects blank username, password and email', () => {
    assert.throws(() => ensureUsername('   '), /Kullanici adi/);
    assert.throws(() => ensurePassword('   '), /Sifre/);
    assert.throws(() => ensureEmail('   '), /E-posta/);
  });
});

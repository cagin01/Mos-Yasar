import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { mapLoginResponseToSession } from '../src/features/auth/services/tokenMapper.ts';

function base64UrlEncode(value) {
  return Buffer.from(JSON.stringify(value))
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function createToken(payload) {
  return [
    base64UrlEncode({ alg: 'none', typ: 'JWT' }),
    base64UrlEncode(payload),
    'signature',
  ].join('.');
}

describe('tokenMapper', () => {
  it('maps login response tokens to an auth session', () => {
    const accessToken = createToken({
      sub: 'user-1',
      given_name: 'Test User',
      email: 'test@yasar.com.tr',
      preferred_username: 'testuser',
      organizationName: 'Yasar Bilgi',
      realm_access: { roles: ['bulk_approve'] },
    });

    const session = mapLoginResponseToSession({
      access_token: accessToken,
      refresh_token: 'refresh-token',
      expires_in: 300,
      refresh_expires_in: 600,
      token_type: 'Bearer',
      scope: 'openid',
    });

    assert.equal(session.mode, 'remote');
    assert.equal(session.accessToken, accessToken);
    assert.equal(session.refreshToken, 'refresh-token');
    assert.deepEqual(session.user, {
      id: 'user-1',
      fullName: 'Test User',
      email: 'test@yasar.com.tr',
      company: 'Yasar Bilgi',
      roles: ['bulk_approve'],
      username: 'testuser',
    });
  });

  it('throws when access token is missing', () => {
    assert.throws(
      () => mapLoginResponseToSession({ refresh_token: 'refresh-token' }),
      /Giris islemi tamamlanamadi/,
    );
  });
});

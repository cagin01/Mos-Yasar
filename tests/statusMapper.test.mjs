import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  deriveApprovalStatus,
  mapResolvedStatusCodeToColors,
  mapResolvedStatusCodeToLabel,
  resolveStatusColorsFromOperations,
} from '../src/features/request/services/statusMapper.ts';

describe('statusMapper', () => {
  it('maps known and unknown status labels', () => {
    assert.equal(mapResolvedStatusCodeToLabel(0), 'ONAY BEKLIYOR');
    assert.equal(mapResolvedStatusCodeToLabel(1), 'ONAYLANDI');
    assert.equal(mapResolvedStatusCodeToLabel(undefined), '-');
    assert.equal(mapResolvedStatusCodeToLabel(99), 'DURUM 99');
  });

  it('maps status colors and falls back when operation colors are missing', () => {
    assert.deepEqual(mapResolvedStatusCodeToColors(1), {
      backgroundColor: '#D6F2D1',
      textColor: '#51D23C',
    });
    assert.deepEqual(mapResolvedStatusCodeToColors(99), {
      backgroundColor: undefined,
      textColor: undefined,
    });
    assert.deepEqual(
      resolveStatusColorsFromOperations(
        [{ statusCode: 7, backgroundColor: '#111111', textColor: '#222222' }],
        7,
      ),
      { backgroundColor: '#111111', textColor: '#222222' },
    );
  });

  it('derives approval status from bulk and description flags', () => {
    assert.equal(
      deriveApprovalStatus({ multipleApprove: true, approvalRequiresDescription: false }),
      'Toplu Onaylanabilir',
    );
    assert.equal(
      deriveApprovalStatus({ multipleApprove: false, approvalRequiresDescription: true }),
      'AÃ§Ä±klama Gerekli',
    );
    assert.equal(
      deriveApprovalStatus({ multipleApprove: false, approvalRequiresDescription: false }),
      'Beklemede',
    );
  });
});

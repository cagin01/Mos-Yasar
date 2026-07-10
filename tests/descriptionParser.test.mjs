import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  getDescriptionLines,
  normalizeSearchText,
  parseDescriptionValue,
} from '../src/features/request/services/descriptionParser.ts';

describe('descriptionParser', () => {
  it('normalizes Turkish search text', () => {
    assert.equal(normalizeSearchText('Şirket İÇİN'), 'sirket icin');
  });

  it('extracts values by label and preserves colons in the value', () => {
    const lines = ['Şirket: Yaşar Bilgi', 'Açıklama: Saat: 10:00'];

    assert.equal(parseDescriptionValue(lines, ['Sirket']), 'Yaşar Bilgi');
    assert.equal(parseDescriptionValue(lines, ['Açıklama']), 'Saat: 10:00');
    assert.equal(parseDescriptionValue(lines, ['Yok']), undefined);
  });

  it('splits multiline descriptions into non-empty trimmed lines', () => {
    assert.deepEqual(getDescriptionLines(' A: 1 \n\n B: 2 '), ['A: 1', 'B: 2']);
    assert.deepEqual(getDescriptionLines(undefined), []);
  });
});

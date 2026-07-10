import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  formatDateForHistoryApi,
  isInRange,
  parseDateRangeText,
  parseRequestDate,
  parseTurkishDate,
} from '../src/features/request/services/dateUtils.ts';

describe('request date utilities', () => {
  it('parses Turkish dates and invalid values safely', () => {
    assert.equal(parseTurkishDate('03.05.2026')?.toISOString(), new Date(2026, 4, 3).toISOString());
    assert.equal(parseTurkishDate('-'), null);
    assert.equal(parseTurkishDate(undefined), null);
  });

  it('checks optional date ranges', () => {
    const range = {
      start: new Date(2026, 4, 1),
      end: new Date(2026, 4, 3),
    };

    assert.equal(isInRange(new Date(2026, 4, 2), range), true);
    assert.equal(isInRange(new Date(2026, 4, 4), range), false);
    assert.equal(isInRange(null, range), false);
    assert.equal(isInRange(null, null), true);
  });

  it('formats history API dates with start and end of day', () => {
    const date = new Date(2026, 4, 3);

    assert.equal(formatDateForHistoryApi(date), '2026-05-03T00:00:00');
    assert.equal(formatDateForHistoryApi(date, true), '2026-05-03T23:59:59');
  });

  it('parses range text and request date values', () => {
    const range = parseDateRangeText('01.05.2026 - 03.05.2026');

    assert.equal(range?.start.toISOString(), new Date(2026, 4, 1).toISOString());
    assert.equal(range?.end.toISOString(), new Date(2026, 4, 3).toISOString());
    assert.equal(parseDateRangeText('bad input'), null);
    assert.equal(parseRequestDate('3-5-2026, 12:00:00'), '03.05.2026');
  });
});

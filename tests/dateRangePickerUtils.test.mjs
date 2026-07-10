import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  createYearRange,
  formatCalendarDate,
  formatDateInput,
  formatRangeText,
  parseInputToCalendarDate,
  toCalendarDate,
} from '../src/features/request/components/dateRangePickerUtils.ts';

describe('dateRangePickerUtils', () => {
  it('formats compact numeric input as dd.mm.yyyy', () => {
    assert.equal(formatDateInput('01022026'), '01.02.2026');
    assert.equal(formatDateInput('01.02.2026'), '01.02.2026');
    assert.equal(formatDateInput('0102'), '01.02');
  });

  it('parses valid date input and rejects invalid calendar dates', () => {
    assert.equal(parseInputToCalendarDate('29.02.2024'), '2024-02-29');
    assert.equal(parseInputToCalendarDate('31.02.2024'), null);
    assert.equal(parseInputToCalendarDate('01.01.1899'), null);
  });

  it('formats calendar dates and ranges consistently', () => {
    assert.equal(toCalendarDate(new Date(2026, 4, 3)), '2026-05-03');
    assert.equal(formatCalendarDate('2026-05-03'), '03.05.2026');
    assert.equal(formatRangeText('2026-05-01', '2026-05-03'), '01.05.2026 - 03.05.2026');
  });

  it('creates a centered nine year range', () => {
    assert.deepEqual(createYearRange(2026), [2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030]);
  });
});

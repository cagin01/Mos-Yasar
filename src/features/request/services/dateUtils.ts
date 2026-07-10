import type { RequestDateRange } from '@/src/features/request/types';

export function parseTurkishDate(value?: string) {
  if (!value || value === '-') return null;
  const [day, month, year] = value.split('.').map(Number);
  if (!day || !month || !year) return null;
  return new Date(year, month - 1, day);
}

export function isInRange(date: Date | null, range?: RequestDateRange | null) {
  if (!range) return true;
  if (!date) return false;
  return date >= range.start && date <= range.end;
}

export function formatDateForHistoryApi(date: Date, endOfDay = false) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = endOfDay ? '23' : '00';
  const minutes = endOfDay ? '59' : '00';
  const seconds = endOfDay ? '59' : '00';
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}

export function parseDateRangeText(rangeText: string): RequestDateRange | null {
  const [rawStart, rawEnd] = rangeText.split(' - ');
  if (!rawStart || !rawEnd) return null;
  const start = parseTurkishDate(rawStart);
  const end = parseTurkishDate(rawEnd);
  if (!start || !end) return null;
  return { start, end };
}

export function parseRequestDate(value?: string) {
  if (!value) return '-';
  const [datePart] = value.split(',');
  if (!datePart) return value;
  const [day, month, year] = datePart.split('-').map(Number);
  if (!day || !month || !year) return datePart;
  return `${String(day).padStart(2, '0')}.${String(month).padStart(2, '0')}.${year}`;
}

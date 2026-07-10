export type CalendarMode = 'calendar' | 'month' | 'year';

export type MarkedDateType = {
  startingDay?: boolean;
  endingDay?: boolean;
  color: string;
  textColor: string;
};

export function formatDateInput(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 8);

  if (digits.length <= 2) {
    return digits;
  }

  if (digits.length <= 4) {
    return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  }

  return `${digits.slice(0, 2)}.${digits.slice(2, 4)}.${digits.slice(4)}`;
}

export function toCalendarDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseInputToCalendarDate(value: string) {
  const parts = value.split('.');

  if (parts.length !== 3) {
    return null;
  }

  const [day, month, year] = parts.map(Number);

  if (!day || !month || !year || year < 1900) {
    return null;
  }

  const parsedDate = new Date(year, month - 1, day);

  if (
    parsedDate.getFullYear() !== year ||
    parsedDate.getMonth() !== month - 1 ||
    parsedDate.getDate() !== day
  ) {
    return null;
  }

  return toCalendarDate(parsedDate);
}

export function formatCalendarDate(dateString: string) {
  const [year, month, day] = dateString.split('-');
  return `${day}.${month}.${year}`;
}

export function formatRangeText(startDate: string, endDate: string) {
  return `${formatCalendarDate(startDate)} - ${formatCalendarDate(endDate)}`;
}

export function createYearRange(baseYear: number) {
  const rangeStart = baseYear - 4;
  return Array.from({ length: 9 }, (_, index) => rangeStart + index);
}

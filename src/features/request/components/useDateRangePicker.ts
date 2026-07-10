import { useEffect, useMemo, useState } from 'react';

import {
  CalendarMode,
  MarkedDateType,
  createYearRange,
  formatCalendarDate,
  formatDateInput,
  formatRangeText,
  parseInputToCalendarDate,
  toCalendarDate,
} from './dateRangePickerUtils';

type UseDateRangePickerParams = {
  visible: boolean;
  onSave: (rangeText: string) => void;
  primaryColor: string;
  rangeColor: string;
};

export function useDateRangePicker({
  visible,
  onSave,
  primaryColor,
  rangeColor,
}: UseDateRangePickerParams) {
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [startInput, setStartInput] = useState('');
  const [endInput, setEndInput] = useState('');
  const [currentMonth, setCurrentMonth] = useState(
    toCalendarDate(new Date(new Date().getFullYear(), new Date().getMonth(), 1)),
  );
  const [mode, setMode] = useState<CalendarMode>('calendar');
  const [yearPageCenter, setYearPageCenter] = useState(new Date().getFullYear());

  useEffect(() => {
    if (!visible) {
      return;
    }

    const today = new Date();
    const initialMonth = toCalendarDate(new Date(today.getFullYear(), today.getMonth(), 1));

    setCurrentMonth(initialMonth);
    setMode('calendar');
    setYearPageCenter(today.getFullYear());
  }, [visible]);

  useEffect(() => {
    setStartInput(startDate ? formatCalendarDate(startDate) : '');
  }, [startDate]);

  useEffect(() => {
    setEndInput(endDate ? formatCalendarDate(endDate) : '');
  }, [endDate]);

  const currentDate = useMemo(() => new Date(currentMonth), [currentMonth]);
  const displayedYear = currentDate.getFullYear();
  const yearOptions = useMemo(() => createYearRange(yearPageCenter), [yearPageCenter]);
  const canSave = Boolean(startDate && endDate);

  const syncCalendarFromDate = (dateString: string) => {
    setCurrentMonth(`${dateString.slice(0, 7)}-01`);
    setYearPageCenter(Number(dateString.slice(0, 4)));
  };

  const onDayPress = (day: { dateString: string }) => {
    const dateString = day.dateString;

    if (!startDate || endDate) {
      setStartDate(dateString);
      setEndDate(null);
      syncCalendarFromDate(dateString);
      return;
    }

    if (dateString >= startDate) {
      setEndDate(dateString);
      syncCalendarFromDate(dateString);
      return;
    }

    setStartDate(dateString);
    setEndDate(null);
    syncCalendarFromDate(dateString);
  };

  const markedDates = useMemo(() => {
    const marked: Record<string, MarkedDateType> = {};

    if (startDate) {
      marked[startDate] = { startingDay: true, color: primaryColor, textColor: '#FFFFFF' };
    }

    if (startDate && endDate) {
      marked[endDate] = { endingDay: true, color: primaryColor, textColor: '#FFFFFF' };

      const current = new Date(startDate);
      const end = new Date(endDate);
      current.setDate(current.getDate() + 1);

      while (current < end) {
        const dateStr = toCalendarDate(current);
        marked[dateStr] = { color: rangeColor, textColor: primaryColor };
        current.setDate(current.getDate() + 1);
      }
    }

    return marked;
  }, [endDate, primaryColor, rangeColor, startDate]);

  const handleInputChange = (type: 'start' | 'end', value: string) => {
    const formattedValue = formatDateInput(value);
    const parsedValue = parseInputToCalendarDate(formattedValue);

    if (type === 'start') {
      setStartInput(formattedValue);
      if (!parsedValue) return;
      if (endDate && parsedValue > endDate) {
        setStartDate(parsedValue);
        setEndDate(null);
      } else {
        setStartDate(parsedValue);
      }
      syncCalendarFromDate(parsedValue);
      return;
    }

    setEndInput(formattedValue);
    if (!parsedValue) return;
    if (startDate && parsedValue < startDate) {
      setStartDate(parsedValue);
      setEndDate(null);
    } else {
      setEndDate(parsedValue);
    }
    syncCalendarFromDate(parsedValue);
  };

  const handleSave = () => {
    if (startDate && endDate) {
      onSave(formatRangeText(startDate, endDate));
    }
  };

  const applyQuickRange = (dayCount: number) => {
    const end = new Date();
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    start.setDate(end.getDate() - (dayCount - 1));

    const nextStart = toCalendarDate(start);
    const nextEnd = toCalendarDate(end);

    setStartDate(nextStart);
    setEndDate(nextEnd);
    syncCalendarFromDate(nextEnd);
    setMode('calendar');
  };

  const changeMonth = (direction: 'prev' | 'next') => {
    const nextDate = new Date(currentDate);
    nextDate.setMonth(nextDate.getMonth() + (direction === 'next' ? 1 : -1));
    const nextMonth = toCalendarDate(new Date(nextDate.getFullYear(), nextDate.getMonth(), 1));

    setCurrentMonth(nextMonth);
    setYearPageCenter(nextDate.getFullYear());
  };

  const handleMonthSelect = (monthIndex: number) => {
    const nextMonth = toCalendarDate(new Date(displayedYear, monthIndex, 1));
    setCurrentMonth(nextMonth);
    setMode('calendar');
  };

  const handleYearSelect = (year: number) => {
    const nextMonth = toCalendarDate(new Date(year, currentDate.getMonth(), 1));
    setCurrentMonth(nextMonth);
    setYearPageCenter(year);
    setMode('month');
  };

  const handlePrevious = () => {
    if (mode === 'year') {
      setYearPageCenter((prev) => prev - 9);
      return;
    }

    changeMonth('prev');
  };

  const handleNext = () => {
    if (mode === 'year') {
      setYearPageCenter((prev) => prev + 9);
      return;
    }

    changeMonth('next');
  };

  return {
    applyQuickRange,
    canSave,
    currentDate,
    currentMonth,
    displayedYear,
    endInput,
    handleInputChange,
    handleMonthSelect,
    handleNext,
    handlePrevious,
    handleSave,
    handleYearSelect,
    markedDates,
    mode,
    onDayPress,
    setMode,
    startInput,
    yearOptions,
  };
}

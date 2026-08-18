import {
  addDays,
  compareDatePoint,
  inferAnchorYear,
  isPointInsideRange,
  normalizeMonthDayText,
  parseMonthDayWithYear,
} from './date';
import type { DatePoint, DateRange } from './types';

export interface FestivalDateRangeInput {
  start: string;
  end: string;
  recurrence?: {
    intervalYears: number;
    lastYear: number;
  };
  now: DatePoint;
  prepareDays?: number;
}

export interface FestivalDateRangeResult {
  startText: string;
  endText: string;
  range: DateRange;
  reminderRange: DateRange;
  state: 'before' | 'active' | 'outside';
}

export interface FestivalOccurrenceRangeInput {
  start: string;
  end: string;
  startYear: number;
  recurrence?: FestivalDateRangeInput['recurrence'];
}

export interface FestivalOccurrenceRangeResult {
  startText: string;
  endText: string;
  range: DateRange;
}

function isFestivalOccurrenceYear(year: number, recurrence?: FestivalDateRangeInput['recurrence']): boolean {
  const intervalYears = Math.floor(Number(recurrence?.intervalYears));
  const lastYear = Math.floor(Number(recurrence?.lastYear));
  if (!Number.isFinite(intervalYears) || intervalYears <= 1 || !Number.isFinite(lastYear)) {
    return true;
  }
  return (year - lastYear) % intervalYears === 0;
}

function getNearestOccurrenceYear(year: number, recurrence?: FestivalDateRangeInput['recurrence']): number {
  const intervalYears = Math.floor(Number(recurrence?.intervalYears));
  const lastYear = Math.floor(Number(recurrence?.lastYear));
  if (!Number.isFinite(intervalYears) || intervalYears <= 1 || !Number.isFinite(lastYear)) {
    return year;
  }

  const remainder = (((year - lastYear) % intervalYears) + intervalYears) % intervalYears;
  const previous = year - remainder;
  const next = previous + intervalYears;
  return Math.abs(year - previous) <= Math.abs(next - year) ? previous : next;
}

function normalizePrepareDays(value: number | undefined): number {
  const days = Number(value);
  return Number.isFinite(days) ? Math.floor(Math.max(0, days)) : 0;
}

export function resolveFestivalOccurrenceRange(
  input: FestivalOccurrenceRangeInput,
): FestivalOccurrenceRangeResult | null {
  const startText = normalizeMonthDayText(input.start);
  const endText = normalizeMonthDayText(input.end || input.start);
  if (!startText || !endText || !isFestivalOccurrenceYear(input.startYear, input.recurrence)) {
    return null;
  }

  const start = parseMonthDayWithYear(startText, input.startYear);
  let end = parseMonthDayWithYear(endText, input.startYear);
  if (!start || !end) {
    return null;
  }
  if (compareDatePoint(end, start) < 0) {
    end = parseMonthDayWithYear(endText, input.startYear + 1);
    if (!end) {
      return null;
    }
  }

  return { startText, endText, range: { start, end } };
}

export function resolveFestivalDateRange(input: FestivalDateRangeInput): FestivalDateRangeResult | null {
  const startText = normalizeMonthDayText(input.start);
  if (!startText) {
    return null;
  }

  const startWithoutYear = parseMonthDayWithYear(startText, input.now.year);
  if (!startWithoutYear) {
    return null;
  }
  const occurrenceYear = getNearestOccurrenceYear(inferAnchorYear(input.now, startWithoutYear.month), input.recurrence);
  const occurrence = resolveFestivalOccurrenceRange({
    start: input.start,
    end: input.end,
    startYear: occurrenceYear,
    recurrence: input.recurrence,
  });
  if (!occurrence) {
    return null;
  }

  const { endText, range } = occurrence;
  const reminderRange = {
    start: addDays(range.start, -normalizePrepareDays(input.prepareDays)),
    end: range.end,
  };
  const state = isPointInsideRange(input.now, range)
    ? 'active'
    : isPointInsideRange(input.now, reminderRange) && compareDatePoint(input.now, range.start) < 0
      ? 'before'
      : 'outside';

  return { startText: occurrence.startText, endText, range, reminderRange, state };
}

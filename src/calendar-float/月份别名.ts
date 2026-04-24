import { getOfficialIndexData } from './official-data-loader';
import type { CalendarMonthAliasDefinition } from './types';

function findMonthAlias(month: number): CalendarMonthAliasDefinition | null {
  const normalizedMonth = Number(month);
  if (!Number.isFinite(normalizedMonth)) {
    return null;
  }
  return getOfficialIndexData().month_aliases?.find(item => Number(item.month) === normalizedMonth) ?? null;
}

export function getCalendarMonthAliasLabel(month: number): string {
  return String(findMonthAlias(month)?.label || '').trim();
}

export function formatCalendarMonthTitle(year: number, month: number): string {
  const alias = getCalendarMonthAliasLabel(month);
  return alias ? `${year}-${month}月(${alias})` : `${year}-${month}月`;
}

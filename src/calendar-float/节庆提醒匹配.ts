import { compareDatePoint, getRelativeDayDistance, isPointInsideRange, parseMonthDayWithYear } from './date';
import { getOfficialIndexData } from './official-data-loader';
import { readCurrentWorldTime } from './storage';
import type { DatePoint, OfficialFestivalIndexItem, OfficialFestivalReminderConfig } from './types';
import { getOfficialFestivalReminderTextByFestivalId } from './节庆提醒文本';

export interface MatchedFestivalReminder {
  festivalId: string;
  title: string;
  groupId: string;
  sectionId: string;
  content: string;
  startText: string;
  endText: string;
  reminderDays: number;
  injectRole: 'system';
  injectDepth: number;
  injectOrder: number;
  distanceToStart: number;
  isActive: boolean;
}

function normalizeMonthDay(input: string): string {
  return String(input || '').trim();
}

function inferFestivalYear(now: DatePoint, month: number): number {
  if (month + 6 < now.month) {
    return now.year + 1;
  }
  if (month - 6 > now.month) {
    return now.year - 1;
  }
  return now.year;
}

function buildFestivalRange(
  festival: OfficialFestivalIndexItem,
  now: DatePoint,
): { start: DatePoint; end: DatePoint } | null {
  const startText = normalizeMonthDay(festival.start);
  const endText = normalizeMonthDay(festival.end || festival.start);
  if (!startText || !endText) {
    return null;
  }

  const startMonth = Number(startText.split('-')[0]);
  const endMonth = Number(endText.split('-')[0]);
  const start = parseMonthDayWithYear(startText, inferFestivalYear(now, startMonth));
  const end = parseMonthDayWithYear(endText, inferFestivalYear(now, endMonth));
  if (!start || !end) {
    return null;
  }

  return compareDatePoint(start, end) <= 0 ? { start, end } : { start: end, end: start };
}

function resolveReminderDays(festival: OfficialFestivalIndexItem): number {
  const reminderDays = Number(festival.reminder?.reminder_days ?? festival.controller?.reminder_days ?? 0);
  return Number.isFinite(reminderDays) && reminderDays > 0 ? reminderDays : 0;
}

function resolveInjectConfig(reminder: OfficialFestivalReminderConfig | undefined): {
  role: 'system';
  depth: number;
  order: number;
} {
  return {
    role: 'system',
    depth: Number(reminder?.inject?.depth ?? 0),
    order: Number(reminder?.inject?.order ?? 1200),
  };
}

export function matchFestivalRemindersForCurrentDate(): MatchedFestivalReminder[] {
  const worldTime = readCurrentWorldTime();
  const now = worldTime.point;
  if (!now) {
    return [];
  }

  return getOfficialIndexData()
    .festivals.map(festival => {
      const reminder = festival.reminder;
      const groupId = String(reminder?.group || '').trim();
      const sectionId = String(reminder?.section_id || '').trim();
      if (!reminder || reminder.enabled === false || !groupId || !sectionId) {
        return null;
      }

      const range = buildFestivalRange(festival, now);
      if (!range) {
        return null;
      }

      const reminderText = getOfficialFestivalReminderTextByFestivalId(festival.id);
      const content = String(reminderText?.content || '').trim();
      if (!content) {
        return null;
      }

      const reminderDays = resolveReminderDays(festival);
      const distanceToStart = getRelativeDayDistance(now, range.start);
      const isActive = isPointInsideRange(now, range);
      const isUpcoming = reminderDays > 0 && distanceToStart > 0 && distanceToStart <= reminderDays;
      if (!isActive && !isUpcoming) {
        return null;
      }

      const inject = resolveInjectConfig(reminder);
      return {
        festivalId: festival.id,
        title: festival.title,
        groupId,
        sectionId,
        content,
        startText: festival.start,
        endText: festival.end || festival.start,
        reminderDays,
        injectRole: inject.role,
        injectDepth: inject.depth,
        injectOrder: inject.order,
        distanceToStart,
        isActive,
      } satisfies MatchedFestivalReminder;
    })
    .filter((item): item is MatchedFestivalReminder => Boolean(item))
    .sort((left, right) => {
      if (left.isActive !== right.isActive) {
        return left.isActive ? -1 : 1;
      }
      if (left.distanceToStart !== right.distanceToStart) {
        return left.distanceToStart - right.distanceToStart;
      }
      return left.title.localeCompare(right.title, 'zh-CN');
    });
}

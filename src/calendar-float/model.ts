/**
 * 负责：月历视图需要的纯计算逻辑，例如格子构建、agenda 构建、提醒状态计算。
 * 不负责：worldbook 索引读取、正文解析、silent trigger scan。
 * 下游：[`./widget.ts`](src/calendar-float/widget.ts) 通过 [`./calendar-view-model.ts`](src/calendar-float/calendar-view-model.ts) 使用这里的能力。
 */
import {
  addDays,
  compareDatePoint,
  formatDateKey,
  formatDateLabel,
  getMonthGridEndWithAnchor,
  getMonthGridStartWithAnchor,
  getRelativeDayDistance,
  getWeekdayFromAnchor,
  isPointInsideRange,
  isSameDatePoint,
  normalizeMonthDayText,
  parseMonthDayWithYear,
} from './date';
import type {
  AgendaItemKind,
  CalendarDataset,
  CalendarEventRecord,
  DailyAgendaGroup,
  DailyAgendaItem,
  DatePoint,
  DateRange,
  FestivalRecord,
  MonthDayCell,
  ReminderLevel,
  ReminderState,
} from './types';

function nextDay(point: DatePoint): DatePoint {
  return addDays(point, 1);
}

function normalizeFestivalEvent(festival: FestivalRecord): CalendarEventRecord {
  return {
    source: 'festival',
    sourceKind: festival.sourceKind,
    id: festival.id,
    type: '节庆',
    title: festival.title,
    content: festival.content || festival.summary,
    startText: festival.startText,
    endText: festival.endText,
    repeatRule: '每年',
    tags: ['节庆'],
    allDay: true,
    range: festival.range,
    relatedBookIds: festival.relatedBookIds,
    metadata: {
      ...festival.metadata,
      stages: festival.stages,
      entryName: festival.entryName,
    },
  };
}

function rangesOverlap(left: DateRange, right: DateRange): boolean {
  return compareDatePoint(left.start, right.end) <= 0 && compareDatePoint(left.end, right.start) >= 0;
}

function resolveFestivalOccurrenceRange(festival: FestivalRecord, startYear: number): DateRange | null {
  const startText = normalizeMonthDayText(festival.startText);
  const endText = normalizeMonthDayText(festival.endText || festival.startText);
  if (!startText || !endText) {
    return festival.range ?? null;
  }

  const start = parseMonthDayWithYear(startText, startYear);
  if (!start) {
    return null;
  }

  let end = parseMonthDayWithYear(endText, startYear);
  if (!end) {
    return null;
  }

  if (compareDatePoint(end, start) < 0) {
    end = parseMonthDayWithYear(endText, startYear + 1);
    if (!end) {
      return null;
    }
  }

  return { start, end };
}

function buildFestivalEventsForRange(festivals: FestivalRecord[], targetRange: DateRange): CalendarEventRecord[] {
  return festivals.flatMap(festival => {
    const baseEvent = normalizeFestivalEvent(festival);
    const candidateStartYears = new Set<number>([
      targetRange.start.year - 1,
      targetRange.start.year,
      targetRange.end.year,
      targetRange.end.year + 1,
    ]);
    const ranges = [...candidateStartYears]
      .map(year => resolveFestivalOccurrenceRange(festival, year))
      .filter((range): range is DateRange => Boolean(range))
      .filter(range => rangesOverlap(range, targetRange))
      .sort((left, right) => compareDatePoint(left.start, right.start));

    if (ranges.length === 0 && festival.range && rangesOverlap(festival.range, targetRange)) {
      return [baseEvent];
    }

    return ranges.map(range => ({
      ...baseEvent,
      range,
      metadata: {
        ...baseEvent.metadata,
        occurrenceStartYear: range.start.year,
      },
    }));
  });
}

export function buildMonthCells(args: {
  month: DatePoint;
  selectedDateKey: string;
  dataset: CalendarDataset;
}): MonthDayCell[] {
  const monthStart = getMonthGridStartWithAnchor(args.month, args.dataset.calendarAnchor);
  const monthEnd = getMonthGridEndWithAnchor(args.month, args.dataset.calendarAnchor);
  const today = args.dataset.nowDate;
  const allEvents = [
    ...args.dataset.activeEvents,
    ...args.dataset.archivedEvents,
    ...buildFestivalEventsForRange(args.dataset.festivals, { start: monthStart, end: monthEnd }),
  ];
  const cells: MonthDayCell[] = [];

  let cursor = monthStart;
  while (compareDatePoint(cursor, monthEnd) <= 0) {
    const key = formatDateKey(cursor);
    const dayEvents = allEvents
      .filter(event => event.range && isPointInsideRange(cursor, event.range))
      .sort((left, right) => {
        const leftPriority = left.source === 'festival' ? 0 : left.source === 'active' ? 1 : 2;
        const rightPriority = right.source === 'festival' ? 0 : right.source === 'active' ? 1 : 2;
        return leftPriority - rightPriority || left.title.localeCompare(right.title, 'zh-CN');
      });

    cells.push({
      key,
      year: cursor.year,
      month: cursor.month,
      day: cursor.day,
      weekday: getWeekdayFromAnchor(cursor, args.dataset.calendarAnchor),
      inCurrentMonth: cursor.month === args.month.month,
      isToday: today ? isSameDatePoint(cursor, today) : false,
      isSelected: key === args.selectedDateKey,
      reminderLevel: resolveDateReminderLevel(cursor, args.dataset),
      chips: dayEvents.slice(0, 3).map((event, index) => ({
        id: event.id,
        title: event.title,
        row: index,
        startOffset: 0,
        endOffset: 0,
        isStart: !!event.range && isSameDatePoint(cursor, event.range.start),
        isEnd: !!event.range && isSameDatePoint(cursor, event.range.end),
        source: event.source,
        colorToken: event.source === 'festival' ? 'festival' : event.source === 'archive' ? 'archived' : 'user',
      })),
      overflowCount: Math.max(0, dayEvents.length - 3),
    });
    cursor = nextDay(cursor);
  }

  return cells;
}

export function buildDailyAgenda(dataset: CalendarDataset, startDateKey?: string, dayCount = 7): DailyAgendaGroup[] {
  const base = dataset.nowDate ?? {
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    day: new Date().getDate(),
  };
  const start = startDateKey ? (parseDateKey(startDateKey) ?? base) : base;
  const end = addDays(start, Math.max(0, dayCount - 1));
  const events = [
    ...dataset.activeEvents,
    ...dataset.archivedEvents,
    ...buildFestivalEventsForRange(dataset.festivals, { start, end }),
  ];

  return Array.from({ length: dayCount }, (_, index) => {
    const point = addDays(start, index);
    const dateKey = formatDateKey(point);
    const items: DailyAgendaItem[] = events
      .filter(event => event.range && isPointInsideRange(point, event.range))
      .map(event => {
        const kind: AgendaItemKind = event.source === 'festival' ? 'festival' : 'user';
        const matchedFestival =
          event.source === 'festival' ? dataset.festivals.find(festival => festival.id === event.id) : undefined;
        return {
          id: event.id,
          dateKey,
          title: event.title,
          summary: matchedFestival?.summary || event.content,
          kind,
          source: event.source,
          sourceKind: event.sourceKind,
          type: event.type,
          startText: event.startText,
          endText: event.endText,
          stageTitle: resolveStageTitle(point, matchedFestival),
          tags: event.tags,
          relatedBookIds: event.relatedBookIds,
          reminderLevel: resolveEventReminderLevel(point, event),
          metadata: event.metadata,
        };
      })
      .sort((left, right) => left.title.localeCompare(right.title, 'zh-CN'));

    return {
      dateKey,
      label: formatDateLabel(point, dataset.calendarAnchor),
      items,
    };
  });
}

export function buildReminderState(dataset: CalendarDataset): ReminderState {
  const now = dataset.nowDate;
  if (!now) {
    return { hasUpcoming: false, maxLevel: 'none', reasons: [] };
  }

  const reasons: string[] = [];
  let maxLevel: ReminderLevel = 'none';
  const events = [
    ...dataset.activeEvents,
    ...buildFestivalEventsForRange(dataset.festivals, { start: addDays(now, -31), end: addDays(now, 3) }),
  ];
  events.forEach(event => {
    if (!event.range) {
      return;
    }
    const distance = getRelativeDayDistance(now, event.range.start);
    if (distance === 0) {
      reasons.push(`今天：${event.title}`);
      maxLevel = 'today';
      return;
    }
    if (distance > 0 && distance <= 3 && maxLevel !== 'today') {
      reasons.push(`${distance}天后：${event.title}`);
      maxLevel = 'soon';
    }
  });

  return {
    hasUpcoming: reasons.length > 0,
    maxLevel,
    reasons,
  };
}

function resolveDateReminderLevel(point: DatePoint, dataset: CalendarDataset): ReminderLevel {
  const now = dataset.nowDate;
  if (!now) {
    return 'none';
  }
  const distance = getRelativeDayDistance(now, point);
  if (distance === 0) {
    return 'today';
  }
  if (distance > 0 && distance <= 3) {
    return 'soon';
  }
  return 'none';
}

function resolveEventReminderLevel(point: DatePoint, event: CalendarEventRecord): ReminderLevel {
  if (!event.range) {
    return 'none';
  }
  if (isSameDatePoint(point, event.range.start)) {
    return 'today';
  }
  return 'none';
}

function resolveStageTitle(point: DatePoint, festival?: FestivalRecord): string | undefined {
  if (!festival) {
    return undefined;
  }
  const stage = festival.stages.find(candidate => candidate.range && isPointInsideRange(point, candidate.range));
  return stage?.title;
}

function parseDateKey(input: string): DatePoint | null {
  const match = String(input || '').match(/^(\d+)-(\d{2})-(\d{2})$/);
  if (!match) {
    return null;
  }
  return {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
  };
}

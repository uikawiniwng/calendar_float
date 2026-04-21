import { FIXED_FESTIVALS } from './constants';
import {
  addDays,
  compareDatePoint,
  ensureRangeOrder,
  formatDateKey,
  formatDateLabel,
  formatMonthDay,
  getMonthGridEndWithAnchor,
  getMonthGridStartWithAnchor,
  getRelativeDayDistance,
  getWeekdayFromAnchor,
  inferAnchorYear,
  isPointInsideRange,
  isSameDatePoint,
  normalizeMonthDayText,
  parseMonthDayWithYear,
} from './date';
import { getOfficialIndexData, getOfficialTextContent } from './official-data-loader';
import {
  buildSuggestionSet,
  collectEventTags,
  readActiveBuckets,
  readArchiveStore,
  readCurrentWorldTime,
} from './storage';
import type {
  AgendaItemKind,
  ArchivedCalendarEvent,
  CalendarBookRecord,
  CalendarDataset,
  CalendarEventRecord,
  DailyAgendaGroup,
  DailyAgendaItem,
  DatePoint,
  FestivalRecord,
  MonthDayCell,
  RawCalendarEvent,
  ReminderLevel,
  ReminderState,
  WorldbookStageRecord,
} from './types';

// 可移除兼容层保留在 worldbook.ts 中，当前主运行链路不再依赖该模块。
// import { readFestivalWorldbook } from './worldbook';

function nextDay(point: DatePoint): DatePoint {
  return addDays(point, 1);
}

function buildOfficialStageRecord(
  node: {
    id: string;
    day_index: number;
    title: string;
    summary: string;
    start: string;
    end: string;
  },
  now: DatePoint,
): WorldbookStageRecord | null {
  const startText = normalizeMonthDayText(String(node.start || ''));
  const endText = normalizeMonthDayText(String(node.end || node.start || ''));
  if (!startText || !endText) {
    return null;
  }

  const startMonth = Number(startText.split('-')[0]);
  const endMonth = Number(endText.split('-')[0]);
  const start = parseMonthDayWithYear(startText, inferAnchorYear(now, startMonth));
  const end = parseMonthDayWithYear(endText, inferAnchorYear(now, endMonth));
  if (!start || !end) {
    return null;
  }

  return {
    phaseId: node.id,
    dayIndex: Number(node.day_index) || 0,
    title: String(node.title || '').trim() || node.id,
    summary: String(node.summary || '').trim(),
    startText,
    endText,
    range: ensureRangeOrder({ start, end }),
  };
}

function buildOfficialFestivalRecords(now: DatePoint): FestivalRecord[] {
  const output: FestivalRecord[] = [];

  getOfficialIndexData().festivals.forEach(node => {
    const startText = normalizeMonthDayText(String(node.start || ''));
    const endText = normalizeMonthDayText(String(node.end || node.start || ''));
    if (!startText || !endText) {
      return;
    }

    const startMonth = Number(startText.split('-')[0]);
    const endMonth = Number(endText.split('-')[0]);
    const start = parseMonthDayWithYear(startText, inferAnchorYear(now, startMonth));
    const end = parseMonthDayWithYear(endText, inferAnchorYear(now, endMonth));
    if (!start || !end) {
      return;
    }

    output.push({
      id: node.id,
      title: node.title,
      summary: node.summary,
      content: getOfficialTextContent(node.content_file) || node.summary,
      entryName: node.content_file,
      startText,
      endText,
      sourceKind: 'worldbook',
      relatedBookIds: [...node.related_books],
      stages: (node.stages || [])
        .map(stage => buildOfficialStageRecord(stage, now))
        .filter((value): value is WorldbookStageRecord => Boolean(value)),
      range: ensureRangeOrder({ start, end }),
      metadata: {
        source: 'official_repo',
        index: 'calendar/data/official/index.json',
        content_file: node.content_file,
        monthDayRange: `${formatMonthDay(start)}~${formatMonthDay(end)}`,
        official: true,
      },
    });
  });

  return output;
}

function buildOfficialBookRecords(): Record<string, CalendarBookRecord> {
  return Object.fromEntries(
    getOfficialIndexData().books.map(node => [
      node.id,
      {
        id: node.id,
        title: node.title,
        summary: node.summary,
        content: getOfficialTextContent(node.content_file),
        worldbookEntryName: node.content_file,
      },
    ]),
  );
}

function loadStaticCalendarContent(now: DatePoint): {
  festivals: FestivalRecord[];
  books: Record<string, CalendarBookRecord>;
} {
  return {
    festivals: [...FIXED_FESTIVALS, ...buildOfficialFestivalRecords(now)],
    books: buildOfficialBookRecords(),
  };
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
    repeatRule: '无',
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

function mapActiveEvent(type: '临时' | '重复', id: string, raw: RawCalendarEvent, now: DatePoint): CalendarEventRecord {
  const start = parseEventTextToPoint(raw.时间 || '', now);
  const end = parseEventTextToPoint(raw.结束时间 || raw.时间 || '', now);
  return {
    source: 'active',
    id,
    type,
    title: String(raw.标题 || '').trim() || id,
    content: String(raw.内容 || '').trim(),
    startText: String(raw.时间 || '').trim(),
    endText: String(raw.结束时间 || '').trim(),
    repeatRule: raw.重复规则 || '无',
    tags: collectEventTags(id, { 标题: String(raw.标题 || ''), 内容: String(raw.内容 || '') }),
    allDay: true,
    raw,
    range: start && end ? { start, end: compareDatePoint(start, end) <= 0 ? end : start } : undefined,
    relatedBookIds: [],
    metadata: {},
  };
}

function mapArchivedEvent(id: string, raw: ArchivedCalendarEvent, now: DatePoint): CalendarEventRecord {
  const start = parseEventTextToPoint(raw.时间 || '', now);
  const end = parseEventTextToPoint(raw.结束时间 || raw.时间 || '', now);
  return {
    source: 'archive',
    id,
    type: raw.type || '临时',
    title: String(raw.标题 || '').trim() || id,
    content: String(raw.内容 || '').trim(),
    startText: String(raw.时间 || '').trim(),
    endText: String(raw.结束时间 || '').trim(),
    repeatRule: raw.重复规则 || '无',
    tags: raw.tags,
    allDay: true,
    raw,
    range: start && end ? { start, end: compareDatePoint(start, end) <= 0 ? end : start } : undefined,
    relatedBookIds: [],
    metadata: {
      archived_at: raw.archived_at,
      completed_at: raw.completed_at,
    },
  };
}

function parseEventTextToPoint(text: string, now: DatePoint): DatePoint | null {
  const normalized = String(text || '').trim();
  if (!normalized) {
    return null;
  }

  const fantasy = normalized.match(/(?:复兴纪元)?\s*(\d+)\s*年[-/ ]?(\d{1,2})\s*月[-/ ]?(\d{1,2})\s*日/);
  if (fantasy) {
    return {
      year: Number(fantasy[1]),
      month: Number(fantasy[2]),
      day: Number(fantasy[3]),
    };
  }

  const full = normalized.match(/(\d{4})[/-](\d{1,2})[/-](\d{1,2})/);
  if (full) {
    return {
      year: Number(full[1]),
      month: Number(full[2]),
      day: Number(full[3]),
    };
  }

  const monthDay = normalized.match(/(\d{1,2})[-/月](\d{1,2})日?/);
  if (!monthDay) {
    return null;
  }
  return parseMonthDayWithYear(`${monthDay[1]}-${monthDay[2]}`, now.year);
}

export async function loadCalendarDataset(): Promise<CalendarDataset> {
  const activeBuckets = await readActiveBuckets();
  const archive = readArchiveStore();
  const worldTime = readCurrentWorldTime();
  const now = worldTime.point ?? {
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    day: new Date().getDate(),
  };
  const staticContent = loadStaticCalendarContent(now);

  const activeEvents = [
    ...Object.entries(activeBuckets.临时).map(([id, raw]) => mapActiveEvent('临时', id, raw, now)),
    ...Object.entries(activeBuckets.重复).map(([id, raw]) => mapActiveEvent('重复', id, raw, now)),
  ];

  const archivedEvents = Object.entries(archive.completed).map(([id, raw]) => mapArchivedEvent(id, raw, now));

  return {
    nowText: worldTime.text,
    nowDate: worldTime.point ?? undefined,
    calendarAnchor: worldTime.anchor ?? undefined,
    activeEvents,
    archivedEvents,
    festivals: staticContent.festivals,
    books: staticContent.books,
    suggestions: buildSuggestionSet({ activeBuckets, archive }),
    sourceConfig: archive.sources,
    worldbookSources: [],
    sourceWarnings: [],
  };
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
    ...args.dataset.festivals.map(normalizeFestivalEvent),
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
  const events = [...dataset.activeEvents, ...dataset.archivedEvents, ...dataset.festivals.map(normalizeFestivalEvent)];

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
  const events = [...dataset.activeEvents, ...dataset.festivals.map(normalizeFestivalEvent)];
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

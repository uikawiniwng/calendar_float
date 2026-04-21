import { getOfficialIndexData, getOfficialTextContent } from './official-data-loader';
import type {
  OfficialBookControllerConfig,
  OfficialBookIndexItem,
  OfficialFestivalControllerConfig,
  OfficialFestivalIndexItem,
} from './types';

const MANAGED_REFERENCE_PLACEHOLDER = 'not yet write lmao';
const DEFAULT_REMINDER_DAYS = 7;
const CONTROLLER_LOCATION_VARIABLE = 'stat_data.世界.地点';
const CONTROLLER_TIME_VARIABLE = 'stat_data.世界.时间';

type ReminderDescriptorKind = 'upcoming' | 'active';

export interface CalendarManagedStaticEntryDescriptor {
  id: string;
  entryLabel: string;
  title: string;
  kind: 'event' | 'book' | 'reminder';
  content: string;
}

export interface CalendarManagedFestivalControllerTarget {
  id: string;
  entryName: string;
  title: string;
  start: string;
  end: string;
  controller?: OfficialFestivalControllerConfig;
}

export interface CalendarManagedBookControllerTarget {
  id: string;
  entryName: string;
  title: string;
  controller?: OfficialBookControllerConfig;
}

export interface CalendarManagedReminderControllerTarget {
  id: string;
  upcomingEntryName: string;
  activeEntryName: string;
  title: string;
  start: string;
  end: string;
  controller?: OfficialFestivalControllerConfig;
}

function normalizeEntryLabel(label: string): string {
  return String(label || '').trim();
}

function normalizeKeywordList(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map(item => String(item || '').trim())
    .filter(Boolean)
    .filter((item, index, list) => list.indexOf(item) === index);
}

function normalizeBookEntryLabel(title: string): string {
  const normalized = normalizeEntryLabel(title);
  const shortTitle = normalized.split(/[：:]/)[0]?.trim();
  return shortTitle || normalized;
}

function normalizeFestivalEntryLabel(
  item: OfficialFestivalIndexItem,
  duplicatedTitleCounts: Map<string, number>,
): string {
  const normalizedTitle = normalizeEntryLabel(item.title);
  if ((duplicatedTitleCounts.get(normalizedTitle) ?? 0) <= 1) {
    return normalizedTitle;
  }

  if (/_summer$/i.test(item.id)) {
    return `${normalizedTitle}（夏季场）`;
  }

  if (/_winter$/i.test(item.id)) {
    return `${normalizedTitle}（冬季场）`;
  }

  if (item.start === item.end && item.start) {
    return `${normalizedTitle}（${item.start}）`;
  }

  return `${normalizedTitle}（${item.start}~${item.end}）`;
}

function getFestivalDuplicatedTitleCounts(): Map<string, number> {
  return getOfficialIndexData().festivals.reduce((result, item) => {
    const normalizedTitle = normalizeEntryLabel(item.title);
    result.set(normalizedTitle, (result.get(normalizedTitle) ?? 0) + 1);
    return result;
  }, new Map<string, number>());
}

function parseMonthDayText(text: string): { month: number; day: number } | null {
  const match = normalizeEntryLabel(text).match(/^(\d{1,2})-(\d{1,2})$/);
  if (!match) {
    return null;
  }

  const month = Number(match[1]);
  const day = Number(match[2]);
  if (!Number.isInteger(month) || !Number.isInteger(day) || month < 1 || month > 12 || day < 1 || day > 31) {
    return null;
  }

  return { month, day };
}

function toUtcDate(point: { month: number; day: number }, year = 2024): Date {
  return new Date(Date.UTC(year, point.month - 1, point.day));
}

function enumerateMonthDayPoints(startText: string, endText: string): Array<{ month: number; day: number }> {
  const startPoint = parseMonthDayText(startText);
  const endPoint = parseMonthDayText(endText || startText);
  if (!startPoint || !endPoint) {
    return [];
  }

  const startDate = toUtcDate(startPoint, 2024);
  const endDate = toUtcDate(endPoint, endPoint.month < startPoint.month ? 2025 : 2024);
  const points: Array<{ month: number; day: number }> = [];
  const cursor = new Date(startDate.getTime());

  while (cursor.getTime() <= endDate.getTime() && points.length <= 370) {
    points.push({
      month: cursor.getUTCMonth() + 1,
      day: cursor.getUTCDate(),
    });
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return points;
}

function enumerateReminderPreheatPoints(
  startText: string,
  reminderDays: number,
): Array<{ month: number; day: number }> {
  const startPoint = parseMonthDayText(startText);
  if (!startPoint || reminderDays <= 0) {
    return [];
  }

  const startDate = toUtcDate(startPoint, 2024);
  const points: Array<{ month: number; day: number }> = [];
  for (let offset = reminderDays; offset >= 1; offset -= 1) {
    const cursor = new Date(startDate.getTime());
    cursor.setUTCDate(cursor.getUTCDate() - offset);
    points.push({
      month: cursor.getUTCMonth() + 1,
      day: cursor.getUTCDate(),
    });
  }
  return points;
}

export function buildMonthDayRegexSource(month: number, day: number): string {
  return String.raw`(?:^|[^0-9])0?${month}(?:月)?(?:[-/])?0?${day}(?:日)?(?=[^0-9]|$)`;
}

export function buildMonthDayRegexSources(month: number, days: number[]): string[] {
  return days.map(day => buildMonthDayRegexSource(month, day));
}

function buildRegexSourcesFromPoints(points: Array<{ month: number; day: number }>): string[] {
  return points
    .map(point => buildMonthDayRegexSource(point.month, point.day))
    .filter((source, index, list) => list.indexOf(source) === index);
}

function buildRangeRegexSources(startText: string, endText: string): string[] {
  return buildRegexSourcesFromPoints(enumerateMonthDayPoints(startText, endText));
}

function buildPreheatRegexSources(startText: string, reminderDays: number): string[] {
  return buildRegexSourcesFromPoints(enumerateReminderPreheatPoints(startText, reminderDays));
}

function buildStaticEntryContent(args: { kind: 'event' | 'book'; title: string; contentFile: string }): string {
  const content = getOfficialTextContent(args.contentFile).trim();
  if (!content) {
    return MANAGED_REFERENCE_PLACEHOLDER;
  }

  return content;
}

function buildFestivalDescriptor(
  item: OfficialFestivalIndexItem,
  duplicatedTitleCounts: Map<string, number>,
): CalendarManagedStaticEntryDescriptor {
  return {
    id: item.id,
    entryLabel: normalizeFestivalEntryLabel(item, duplicatedTitleCounts),
    title: normalizeEntryLabel(item.title),
    kind: 'event',
    content: buildStaticEntryContent({
      kind: 'event',
      title: item.title,
      contentFile: item.content_file,
    }),
  };
}

function buildBookDescriptor(item: OfficialBookIndexItem): CalendarManagedStaticEntryDescriptor {
  return {
    id: item.id,
    entryLabel: normalizeBookEntryLabel(item.title),
    title: normalizeEntryLabel(item.title),
    kind: 'book',
    content: buildStaticEntryContent({
      kind: 'book',
      title: item.title,
      contentFile: item.content_file,
    }),
  };
}

function buildReminderEntryLabel(baseLabel: string, mode: ReminderDescriptorKind): string {
  return `${baseLabel}·${mode === 'upcoming' ? '活动提醒' : '当前活动强调'}`;
}

export function buildReminderDescriptorId(festivalId: string, mode: ReminderDescriptorKind): string {
  return `${String(festivalId || '').trim()}_${mode}_reminder`;
}

function normalizeFestivalControllerConfig(
  item: OfficialFestivalIndexItem,
  duplicatedTitleCounts: Map<string, number>,
): {
  enabled: boolean;
  locationKeywords: string[];
  mentionKeywords: string[];
  reminderDays: number;
} {
  const controller = item.controller ?? {};
  const locationKeywords = normalizeKeywordList(controller.location_keywords);
  const mentionKeywords = normalizeKeywordList(controller.mention_keywords);
  const fallbackMentionKeywords =
    (duplicatedTitleCounts.get(normalizeEntryLabel(item.title)) ?? 0) > 1 ? [] : [item.title];
  const normalizedReminderDays = Number.isInteger(controller.reminder_days)
    ? Math.max(0, Number(controller.reminder_days))
    : DEFAULT_REMINDER_DAYS;

  return {
    enabled: controller.enabled !== false,
    locationKeywords,
    mentionKeywords: mentionKeywords.length > 0 ? mentionKeywords : fallbackMentionKeywords,
    reminderDays: normalizedReminderDays,
  };
}

function normalizeBookControllerConfig(item: OfficialBookIndexItem): {
  enabled: boolean;
  mentionKeywords: string[];
  themeKeywords: string[];
} {
  const controller = item.controller ?? {};
  const normalizedTitle = normalizeEntryLabel(item.title);
  const shortTitle = normalizedTitle.split(/[：:]/)[0]?.trim();
  const fallbackMentionKeywords = [normalizedTitle, shortTitle]
    .filter(Boolean)
    .filter((keyword, index, list) => list.indexOf(keyword) === index);

  return {
    enabled: controller.enabled !== false,
    mentionKeywords: normalizeKeywordList(controller.mention_keywords).length
      ? normalizeKeywordList(controller.mention_keywords)
      : fallbackMentionKeywords,
    themeKeywords: normalizeKeywordList(controller.theme_keywords),
  };
}

function buildFestivalReminderEntryContent(item: OfficialFestivalIndexItem, mode: ReminderDescriptorKind): string {
  return mode === 'upcoming'
    ? [
        `近期提醒：${item.title} 即将开始。`,
        '若当前场景地点与该节庆举办地一致，且时间临近，可优先参考对应节庆与关联读物。',
      ].join('\n\n')
    : [
        `当前提醒：${item.title} 正在进行中。`,
        '若当前场景地点与该节庆举办地一致，或对话已直接提及该节庆，应优先结合相关节庆正文与关联读物信息。',
      ].join('\n\n');
}

function buildFestivalReminderDescriptor(
  item: OfficialFestivalIndexItem,
  duplicatedTitleCounts: Map<string, number>,
  mode: ReminderDescriptorKind,
): CalendarManagedStaticEntryDescriptor {
  const baseLabel = normalizeFestivalEntryLabel(item, duplicatedTitleCounts);
  return {
    id: buildReminderDescriptorId(item.id, mode),
    entryLabel: buildReminderEntryLabel(baseLabel, mode),
    title: normalizeEntryLabel(item.title),
    kind: 'reminder',
    content: buildFestivalReminderEntryContent(item, mode),
  };
}

export function getCalendarManagedReminderEntryDescriptors(): CalendarManagedStaticEntryDescriptor[] {
  const festivals = getOfficialIndexData().festivals;
  const duplicatedTitleCounts = getFestivalDuplicatedTitleCounts();

  return festivals.flatMap(item => {
    const controller = normalizeFestivalControllerConfig(item, duplicatedTitleCounts);
    if (!controller.enabled) {
      return [];
    }

    return [
      buildFestivalReminderDescriptor(item, duplicatedTitleCounts, 'upcoming'),
      buildFestivalReminderDescriptor(item, duplicatedTitleCounts, 'active'),
    ];
  });
}

/**
 * 这组 builder 只负责 worldbook backend 的内容层：
 * - event / book / reminder / variable / update rule 的正文
 * - controller entry 的 EJS 内容
 *
 * script 侧不再负责 prompt 注入，不再负责 trigger。
 */
export function buildCalendarVariableListEntryContent(): string {
  return [
    '---',
    '<status_current_variable>',
    '{{format_message_variable::stat_data}}',
    '</status_current_variable>',
  ].join('\n');
}

export function buildCalendarUpdateRulesEntryContent(): string {
  return [
    '---',
    'calendar_variables_update_rules:',
    '    事件.日历.${临时|重复}:  // 临时优先级高于重复',
    '        type: |-',
    '        {',
    '            [ID: string]: // 必须匹配regex: `/^[a-zA-Z0-9_]+$/`',
    '            {',
    '                标题: string;',
    '                内容: string; // 客观视角，详细描述、备忘信息',
    '                时间: string; // 可填完整格式（参照`世界-时间`）、局部匹配项（如1月-1日）或模糊语义，但禁止写相对时间',
    '                结束时间: optional[string]; // 格式要求同开始时间',
    "                重复规则: '无' | '每天' | '每周' | '每月' | '每年' | '仅工作日' | '仅节假日';",
    "                类型: optional['日程' | '事件' | '回忆'];",
    "                完成后: optional['不处理' | '自动清理' | '归档' | '转回忆'];",
    "                重要度: optional['普通' | '重要' | '纪念'];",
    "                可见性: optional['玩家与LLM' | '仅玩家' | '仅系统']; // 仅‘玩家与LLM’会展示给 LLM，其余值会被脚本保留但不注入展示层",
    '                标签: optional[string[]];',
    '            }',
    '        }',
    '        check:',
    '        - 随剧情进展或对话中提到的时间节点实时更新，内容可为计划、未来事件、固定时间安排如课程等',
    '        - **ID 唯一性**：新事件需生成唯一 ID；更新现有事件必须沿用原 ID',
    '        - 标题、内容和时间的描述须匹配重复规则',
    '        - 描述中禁止出现相对时间',
    '        - 如果未指定“类型 / 完成后 / 重要度 / 可见性 / 标签”，脚本会回落到默认值',
    '        - 可见性为“仅玩家”或“仅系统”的条目可以写入变量，但不会展示给 LLM',
    '        - 需要保持适当原子化',
  ].join('\n');
}

function buildGetwiBlock(entryNameExpression: string): string {
  return `<%= await getwi(${entryNameExpression}) %>`;
}

function assertValidGeneratedEjsScript(content: string, context: string): string {
  const forbiddenTypeAnnotatedArrowParamPattern = /\(\s*[A-Za-z_$][\w$]*\s*:\s*[^)=]+\)\s*=>/;
  const matchedFragment = content.match(forbiddenTypeAnnotatedArrowParamPattern)?.[0];
  if (matchedFragment) {
    throw new Error(
      `[calendar-float] Generated EJS for ${context} contains TypeScript-only syntax: ${matchedFragment}`,
    );
  }

  return content;
}

export function buildCalendarEventControllerEntryContent(args: {
  festivals: CalendarManagedFestivalControllerTarget[];
}): string {
  const duplicatedTitleCounts = getFestivalDuplicatedTitleCounts();
  const rules = args.festivals
    .map(item => {
      const sourceItem = getOfficialIndexData().festivals.find(festival => festival.id === item.id);
      if (!sourceItem) {
        return null;
      }

      const controller = normalizeFestivalControllerConfig(sourceItem, duplicatedTitleCounts);
      if (!controller.enabled) {
        return null;
      }

      return {
        entry_name: item.entryName,
        title: item.title,
        location_keywords: controller.locationKeywords,
        mention_keywords: controller.mentionKeywords,
        date_regex_sources: buildRangeRegexSources(item.start, item.end),
      };
    })
    .filter((rule): rule is NonNullable<typeof rule> => Boolean(rule));

  const content = [
    '<%_',
    `const calendarFestivalCurrentLocation = String(getvar('${CONTROLLER_LOCATION_VARIABLE}', { defaults: '' }) || '');`,
    `const calendarFestivalCurrentTime = String(getvar('${CONTROLLER_TIME_VARIABLE}', { defaults: '' }) || '');`,
    `const calendarFestivalRules = ${JSON.stringify(rules)};`,
    'const calendarFestivalMatchedEntryNames = [];',
    'const calendarFestivalSeen = new Set();',
    'for (const rule of calendarFestivalRules) {',
    '  const calendarFestivalLocationMatched =',
    '    rule.location_keywords.length > 0 && rule.location_keywords.some(keyword => calendarFestivalCurrentLocation.includes(keyword));',
    '  const calendarFestivalTimeMatched = rule.date_regex_sources.some(source => new RegExp(source).test(calendarFestivalCurrentTime));',
    '  const calendarFestivalMentionMatched =',
    "    typeof matchChatMessages === 'function' && rule.mention_keywords.length > 0",
    '      ? matchChatMessages(rule.mention_keywords)',
    '      : false;',
    '  if (((calendarFestivalLocationMatched && calendarFestivalTimeMatched) || calendarFestivalMentionMatched) && !calendarFestivalSeen.has(rule.entry_name)) {',
    '    calendarFestivalSeen.add(rule.entry_name);',
    '    calendarFestivalMatchedEntryNames.push(rule.entry_name);',
    '  }',
    '}',
    '_%>',
    '<%_ for (const entryName of calendarFestivalMatchedEntryNames) { _%>',
    buildGetwiBlock('entryName'),
    '<%_ } _%>',
  ].join('\n');

  return assertValidGeneratedEjsScript(content, 'calendar event controller');
}

export function buildCalendarBookControllerEntryContent(args: {
  books: CalendarManagedBookControllerTarget[];
}): string {
  const rules = args.books
    .map(item => {
      const sourceItem = getOfficialIndexData().books.find(book => book.id === item.id);
      if (!sourceItem) {
        return null;
      }

      const controller = normalizeBookControllerConfig(sourceItem);
      if (!controller.enabled) {
        return null;
      }

      return {
        entry_name: item.entryName,
        mention_keywords: controller.mentionKeywords,
        theme_keywords: controller.themeKeywords,
      };
    })
    .filter((rule): rule is NonNullable<typeof rule> => Boolean(rule));

  const content = [
    '<%_',
    `const calendarBookRules = ${JSON.stringify(rules)};`,
    'const calendarBookMatchedEntryNames = [];',
    'const calendarBookSeen = new Set();',
    'for (const rule of calendarBookRules) {',
    '  const calendarBookDirectMentionMatched =',
    "    typeof matchChatMessages === 'function' && rule.mention_keywords.length > 0",
    '      ? matchChatMessages(rule.mention_keywords)',
    '      : false;',
    '  const calendarBookThemeMentionMatched =',
    "    typeof matchChatMessages === 'function' && rule.theme_keywords.length > 0",
    '      ? matchChatMessages(rule.theme_keywords)',
    '      : false;',
    '  if ((calendarBookDirectMentionMatched || calendarBookThemeMentionMatched) && !calendarBookSeen.has(rule.entry_name)) {',
    '    calendarBookSeen.add(rule.entry_name);',
    '    calendarBookMatchedEntryNames.push(rule.entry_name);',
    '  }',
    '}',
    '_%>',
    '<%_ for (const entryName of calendarBookMatchedEntryNames) { _%>',
    buildGetwiBlock('entryName'),
    '<%_ } _%>',
  ].join('\n');

  return assertValidGeneratedEjsScript(content, 'calendar book controller');
}

export function buildCalendarReminderControllerEntryContent(args: {
  festivals: CalendarManagedReminderControllerTarget[];
}): string {
  const duplicatedTitleCounts = getFestivalDuplicatedTitleCounts();
  const rules = args.festivals
    .map(item => {
      const sourceItem = getOfficialIndexData().festivals.find(festival => festival.id === item.id);
      if (!sourceItem) {
        return null;
      }

      const controller = normalizeFestivalControllerConfig(sourceItem, duplicatedTitleCounts);
      if (!controller.enabled) {
        return null;
      }

      return {
        upcoming_entry_name: item.upcomingEntryName,
        active_entry_name: item.activeEntryName,
        location_keywords: controller.locationKeywords,
        mention_keywords: controller.mentionKeywords,
        preheat_regex_sources: buildPreheatRegexSources(item.start, controller.reminderDays),
        active_regex_sources: buildRangeRegexSources(item.start, item.end),
      };
    })
    .filter((rule): rule is NonNullable<typeof rule> => Boolean(rule));

  const content = [
    '<%_',
    `const calendarReminderCurrentLocation = String(getvar('${CONTROLLER_LOCATION_VARIABLE}', { defaults: '' }) || '');`,
    `const calendarReminderCurrentTime = String(getvar('${CONTROLLER_TIME_VARIABLE}', { defaults: '' }) || '');`,
    `const calendarReminderRules = ${JSON.stringify(rules)};`,
    'const calendarReminderMatchedEntryNames = [];',
    'const calendarReminderSeen = new Set();',
    'for (const rule of calendarReminderRules) {',
    '  const calendarReminderLocationMatched =',
    '    rule.location_keywords.length > 0 && rule.location_keywords.some(keyword => calendarReminderCurrentLocation.includes(keyword));',
    '  const calendarReminderPreheatMatched = rule.preheat_regex_sources.some(source => new RegExp(source).test(calendarReminderCurrentTime));',
    '  const calendarReminderActiveMatched = rule.active_regex_sources.some(source => new RegExp(source).test(calendarReminderCurrentTime));',
    '  const calendarReminderMentionMatched =',
    "    typeof matchChatMessages === 'function' && rule.mention_keywords.length > 0",
    '      ? matchChatMessages(rule.mention_keywords)',
    '      : false;',
    '  const calendarReminderTargetEntryName =',
    '    calendarReminderLocationMatched && calendarReminderPreheatMatched && !calendarReminderActiveMatched',
    '      ? rule.upcoming_entry_name',
    '      : (calendarReminderLocationMatched && calendarReminderActiveMatched) || calendarReminderMentionMatched',
    '        ? rule.active_entry_name',
    '        : null;',
    '  if (calendarReminderTargetEntryName && !calendarReminderSeen.has(calendarReminderTargetEntryName)) {',
    '    calendarReminderSeen.add(calendarReminderTargetEntryName);',
    '    calendarReminderMatchedEntryNames.push(calendarReminderTargetEntryName);',
    '  }',
    '}',
    '_%>',
    '<%_ for (const entryName of calendarReminderMatchedEntryNames) { _%>',
    buildGetwiBlock('entryName'),
    '<%_ } _%>',
  ].join('\n');

  return assertValidGeneratedEjsScript(content, 'calendar reminder controller');
}

export function getCalendarManagedFestivalEntryDescriptors(): CalendarManagedStaticEntryDescriptor[] {
  const festivals = getOfficialIndexData().festivals;
  const duplicatedTitleCounts = getFestivalDuplicatedTitleCounts();
  return festivals.map(item => buildFestivalDescriptor(item, duplicatedTitleCounts));
}

export function getCalendarManagedBookEntryDescriptors(): CalendarManagedStaticEntryDescriptor[] {
  return getOfficialIndexData().books.map(buildBookDescriptor);
}

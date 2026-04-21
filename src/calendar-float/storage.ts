import _ from 'lodash';
import {
  CHAT_ARCHIVE_KEY,
  MVU_MESSAGE_TARGET,
  MVU_REPEAT_PATH,
  MVU_ROOT_PATH,
  MVU_TEMP_PATH,
  PRESET_TAG_OPTIONS,
  SCRIPT_NAME,
  WORLD_TIME_PATH,
  WORLDBOOK_NAME,
} from './constants';
import { formatDateKey, parseWorldDateAnchor } from './date';
import { sanitizeBucketRecords, sanitizeRawEvent, sanitizeTagList } from './event-normalizer';
import type {
  ActiveCalendarBuckets,
  ArchivedCalendarEvent,
  CalendarArchiveStore,
  CalendarBucketType,
  CalendarSourceConfig,
  CalendarSuggestionSet,
  CalendarTagOption,
  DatePoint,
  RawCalendarEvent,
} from './types';

function createEmptyBuckets(): ActiveCalendarBuckets {
  return { 临时: {}, 重复: {} };
}

function createEmptySourceConfig(): CalendarSourceConfig {
  return {
    useChatBoundWorldbook: true,
    extraWorldbooks: [],
    devWorldbooks: [WORLDBOOK_NAME],
  };
}

function createEmptyArchivePolicy(): CalendarArchiveStore['policy'] {
  return {
    archiveOnActiveRemoval: true,
    skipArchiveTags: [],
  };
}

function createEmptyArchiveStore(): CalendarArchiveStore {
  return {
    completed: {},
    dismissedFestivalReminderKeys: [],
    dismissedUserReminderKeys: [],
    sources: createEmptySourceConfig(),
    policy: createEmptyArchivePolicy(),
    lastActiveSnapshot: createEmptyBuckets(),
  };
}

const MVU_READY_TIMEOUT_MS = 1200;
let hasWarnedMvuFallback = false;

function hasMvuReadApi(): boolean {
  return typeof Mvu !== 'undefined' && typeof Mvu.getMvuData === 'function';
}

function hasMvuWriteApi(): boolean {
  return hasMvuReadApi() && typeof Mvu.replaceMvuData === 'function';
}

function warnMvuFallback(reason: string, error?: unknown): void {
  if (hasWarnedMvuFallback) {
    return;
  }
  hasWarnedMvuFallback = true;
  if (typeof error === 'undefined') {
    console.warn(`[${SCRIPT_NAME}] ${reason}`);
    return;
  }
  console.warn(`[${SCRIPT_NAME}] ${reason}`, error);
}

function readMessageVariableData(): Record<string, any> {
  if (hasMvuReadApi()) {
    return Mvu.getMvuData(MVU_MESSAGE_TARGET) || {};
  }
  return getVariables({ type: 'message' });
}

function ensureActiveBucketShape(data: Record<string, any>): void {
  if (!_.isPlainObject(_.get(data, MVU_ROOT_PATH))) {
    _.set(data, MVU_ROOT_PATH, createEmptyBuckets());
  }
  if (!_.isPlainObject(_.get(data, MVU_TEMP_PATH))) {
    _.set(data, MVU_TEMP_PATH, {});
  }
  if (!_.isPlainObject(_.get(data, MVU_REPEAT_PATH))) {
    _.set(data, MVU_REPEAT_PATH, {});
  }
}

function sanitizeWorldbookNameList(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .map(item => String(item ?? '').trim())
    .filter(Boolean)
    .filter((item, index, array) => array.indexOf(item) === index)
    .sort((left, right) => left.localeCompare(right, 'zh-CN'));
}

function sanitizeSourceConfig(value: unknown): CalendarSourceConfig {
  const defaults = createEmptySourceConfig();
  const source = _.isPlainObject(value) ? (value as Record<string, unknown>) : {};
  const extraWorldbooks = sanitizeWorldbookNameList(source.extraWorldbooks);
  const devWorldbooks = sanitizeWorldbookNameList(source.devWorldbooks);
  return {
    useChatBoundWorldbook: source.useChatBoundWorldbook !== false,
    extraWorldbooks,
    devWorldbooks: devWorldbooks.length ? devWorldbooks : defaults.devWorldbooks,
  };
}

function sanitizeArchivePolicy(value: unknown): CalendarArchiveStore['policy'] {
  const defaults = createEmptyArchivePolicy();
  const source = _.isPlainObject(value) ? (value as Record<string, unknown>) : {};
  return {
    archiveOnActiveRemoval: source.archiveOnActiveRemoval !== false,
    skipArchiveTags: sanitizeTagList(source.skipArchiveTags).length
      ? sanitizeTagList(source.skipArchiveTags)
      : defaults.skipArchiveTags,
  };
}

function cloneBucketsSnapshot(buckets: ActiveCalendarBuckets): ActiveCalendarBuckets {
  return {
    临时: sanitizeBucketRecords(buckets.临时),
    重复: sanitizeBucketRecords(buckets.重复),
  };
}

function sanitizeArchiveStore(value: unknown): CalendarArchiveStore {
  const source = _.isPlainObject(value) ? (value as Record<string, unknown>) : {};
  const completedSource = _.isPlainObject(source.completed) ? (source.completed as Record<string, unknown>) : {};
  const completed = Object.fromEntries(
    Object.entries(completedSource).map(([id, event]) => {
      const raw = _.isPlainObject(event) ? (event as Record<string, unknown>) : {};
      const type: CalendarBucketType = raw.type === '重复' ? '重复' : '临时';
      const archived: ArchivedCalendarEvent = {
        id,
        type,
        archived_at: String(raw.archived_at ?? ''),
        completed_at: String(raw.completed_at ?? ''),
        tags: Array.isArray(raw.tags) ? raw.tags.map(tag => String(tag)).filter(Boolean) : [],
        preserved_for_player: true,
        archive_reason: ['completed', 'auto_cleanup', 'manual_delete', 'memory'].includes(
          String(raw.archive_reason ?? ''),
        )
          ? (String(raw.archive_reason) as ArchivedCalendarEvent['archive_reason'])
          : 'completed',
        ...sanitizeRawEvent(raw),
      };
      return [id, archived];
    }),
  ) as Record<string, ArchivedCalendarEvent>;
  const snapshotSource = _.isPlainObject(source.lastActiveSnapshot)
    ? (source.lastActiveSnapshot as Record<string, unknown>)
    : {};

  return {
    completed,
    dismissedFestivalReminderKeys: Array.isArray(source.dismissedFestivalReminderKeys)
      ? source.dismissedFestivalReminderKeys.map(value => String(value)).filter(Boolean)
      : [],
    dismissedUserReminderKeys: Array.isArray(source.dismissedUserReminderKeys)
      ? source.dismissedUserReminderKeys.map(value => String(value)).filter(Boolean)
      : [],
    sources: sanitizeSourceConfig(source.sources),
    policy: sanitizeArchivePolicy(source.policy),
    lastActiveSnapshot: {
      临时: sanitizeBucketRecords(snapshotSource.临时),
      重复: sanitizeBucketRecords(snapshotSource.重复),
    },
  };
}

export async function ensureMvuReady(timeoutMs = MVU_READY_TIMEOUT_MS): Promise<boolean> {
  if (hasMvuWriteApi()) {
    return true;
  }
  if (typeof waitGlobalInitialized !== 'function') {
    if (!hasMvuReadApi()) {
      warnMvuFallback('waitGlobalInitialized 不可用，改为直接读取 message 变量');
    }
    return hasMvuReadApi();
  }

  try {
    const ready = await Promise.race([
      waitGlobalInitialized('Mvu').then(() => true),
      new Promise<boolean>(resolve => {
        setTimeout(() => resolve(false), timeoutMs);
      }),
    ]);
    if (!ready && !hasMvuReadApi()) {
      warnMvuFallback(`Mvu 未在 ${timeoutMs}ms 内完成初始化，改为直接读取 message 变量`);
      return false;
    }
  } catch (error) {
    warnMvuFallback('等待 Mvu 初始化失败，改为直接读取 message 变量', error);
    return false;
  }

  return hasMvuReadApi();
}

export async function readActiveBuckets(): Promise<ActiveCalendarBuckets> {
  await ensureMvuReady();
  const data = readMessageVariableData();
  ensureActiveBucketShape(data);

  const temp = sanitizeBucketRecords(_.get(data, MVU_TEMP_PATH, {}));
  const repeat = sanitizeBucketRecords(_.get(data, MVU_REPEAT_PATH, {}));
  return {
    临时: temp,
    重复: repeat,
  };
}

export async function replaceActiveBuckets(nextBuckets: ActiveCalendarBuckets): Promise<void> {
  const isMvuReady = await ensureMvuReady();
  const data = readMessageVariableData();
  ensureActiveBucketShape(data);
  _.set(data, MVU_TEMP_PATH, nextBuckets.临时);
  _.set(data, MVU_REPEAT_PATH, nextBuckets.重复);

  if (isMvuReady && hasMvuWriteApi()) {
    await Mvu.replaceMvuData(data as Mvu.MvuData, MVU_MESSAGE_TARGET);
    return;
  }

  replaceVariables(data, { type: 'message' });
}

export function readArchiveStore(): CalendarArchiveStore {
  const variables = getVariables({ type: 'chat' });
  return sanitizeArchiveStore(variables[CHAT_ARCHIVE_KEY]);
}

export function replaceArchiveStore(nextStore: CalendarArchiveStore): void {
  const variables = getVariables({ type: 'chat' });
  variables[CHAT_ARCHIVE_KEY] = sanitizeArchiveStore(nextStore);
  replaceVariables(variables, { type: 'chat' });
}

export function readCalendarSourceConfig(): CalendarSourceConfig {
  return readArchiveStore().sources;
}

export function replaceCalendarSourceConfig(nextConfig: CalendarSourceConfig): CalendarSourceConfig {
  const archive = readArchiveStore();
  archive.sources = sanitizeSourceConfig(nextConfig);
  replaceArchiveStore(archive);
  return archive.sources;
}

export function readCalendarArchivePolicy(): CalendarArchiveStore['policy'] {
  return readArchiveStore().policy;
}

export function replaceCalendarArchivePolicy(
  nextPolicy: Partial<CalendarArchiveStore['policy']>,
): CalendarArchiveStore['policy'] {
  const archive = readArchiveStore();
  archive.policy = sanitizeArchivePolicy({
    ...archive.policy,
    ...nextPolicy,
  });
  replaceArchiveStore(archive);
  return archive.policy;
}

export function getChatBoundCalendarWorldbookName(): string {
  return String(getChatWorldbookName('current') || '').trim();
}

export function getAvailableCalendarWorldbooks(): string[] {
  return getWorldbookNames()
    .map(name => String(name || '').trim())
    .filter(Boolean)
    .filter((name, index, array) => array.indexOf(name) === index)
    .sort((left, right) => left.localeCompare(right, 'zh-CN'));
}

function resolveArchiveReason(raw: RawCalendarEvent): ArchivedCalendarEvent['archive_reason'] {
  return raw.完成后 === '自动清理'
    ? 'auto_cleanup'
    : raw.完成后 === '转回忆' || raw.类型 === '回忆' || raw.重要度 === '纪念'
      ? 'memory'
      : 'completed';
}

function shouldSkipArchiveByPolicy(args: {
  id: string;
  raw: RawCalendarEvent;
  policy: CalendarArchiveStore['policy'];
}): boolean {
  if (!args.policy.skipArchiveTags.length) {
    return false;
  }
  const eventTags = collectEventTags(args.id, args.raw);
  return eventTags.some(tag => args.policy.skipArchiveTags.includes(tag));
}

function writeArchivedEvent(args: {
  archive: CalendarArchiveStore;
  id: string;
  type: '临时' | '重复';
  raw: RawCalendarEvent;
  completedAt?: string;
}): boolean {
  const normalizedRaw = sanitizeRawEvent(args.raw);
  if (shouldSkipArchiveByPolicy({ id: args.id, raw: normalizedRaw, policy: args.archive.policy })) {
    return false;
  }

  args.archive.completed[args.id] = {
    id: args.id,
    type: args.type,
    archived_at: new Date().toISOString(),
    completed_at: args.completedAt ?? '',
    tags: collectEventTags(args.id, normalizedRaw),
    preserved_for_player: true,
    archive_reason: resolveArchiveReason(normalizedRaw),
    ...normalizedRaw,
  };
  return true;
}

export async function archiveCompletedEvent(params: {
  id: string;
  type: '临时' | '重复';
  completedAt?: string;
}): Promise<void> {
  const buckets = await readActiveBuckets();
  const sourceBucket = params.type === '重复' ? buckets.重复 : buckets.临时;
  const raw = sourceBucket[params.id];
  if (!raw) {
    return;
  }

  const archive = readArchiveStore();
  writeArchivedEvent({
    archive,
    id: params.id,
    type: params.type,
    raw,
    completedAt: params.completedAt,
  });

  delete sourceBucket[params.id];
  archive.lastActiveSnapshot = cloneBucketsSnapshot(buckets);
  replaceArchiveStore(archive);
  await replaceActiveBuckets(buckets);
}

export async function syncArchiveOnActiveRemoval(completedAt?: string): Promise<{
  archived: number;
  skipped: number;
}> {
  const buckets = await readActiveBuckets();
  const archive = readArchiveStore();
  const previous = archive.lastActiveSnapshot;
  let archived = 0;
  let skipped = 0;

  if (archive.policy.archiveOnActiveRemoval) {
    (['临时', '重复'] as const).forEach(bucketType => {
      const previousBucket = previous[bucketType] || {};
      const currentBucket = buckets[bucketType] || {};
      Object.entries(previousBucket).forEach(([id, raw]) => {
        if (currentBucket[id]) {
          return;
        }
        if (archive.completed[id]) {
          return;
        }
        if (
          writeArchivedEvent({
            archive,
            id,
            type: bucketType,
            raw,
            completedAt,
          })
        ) {
          archived += 1;
          return;
        }
        skipped += 1;
      });
    });
  }

  archive.lastActiveSnapshot = cloneBucketsSnapshot(buckets);
  replaceArchiveStore(archive);
  return { archived, skipped };
}

export async function restoreArchivedEvent(id: string): Promise<void> {
  const archive = readArchiveStore();
  const archived = archive.completed[id];
  if (!archived) {
    return;
  }

  const buckets = await readActiveBuckets();
  const targetBucket = archived.type === '重复' ? buckets.重复 : buckets.临时;
  targetBucket[id] = sanitizeRawEvent(archived);
  delete archive.completed[id];

  archive.lastActiveSnapshot = cloneBucketsSnapshot(buckets);
  replaceArchiveStore(archive);
  await replaceActiveBuckets(buckets);
}

export function readCurrentWorldTime(): {
  text: string;
  point: DatePoint | null;
  anchor: { dateKey: string; weekday: number } | null;
} {
  const messageData = readMessageVariableData();
  const text = String(_.get(messageData, WORLD_TIME_PATH, '') || '');
  const parsed = parseWorldDateAnchor(text);
  return {
    text,
    point: parsed?.point ?? null,
    anchor:
      parsed && typeof parsed.weekday === 'number'
        ? {
            dateKey: formatDateKey(parsed.point),
            weekday: parsed.weekday,
          }
        : null,
  };
}

export function buildSuggestionSet(args: {
  activeBuckets: ActiveCalendarBuckets;
  archive: CalendarArchiveStore;
}): CalendarSuggestionSet {
  const titlePool = new Set<string>();
  const tagMap = new Map<string, CalendarTagOption>();
  const idPool = new Set<string>();

  PRESET_TAG_OPTIONS.forEach(option => tagMap.set(option.value, option));

  const collect = (id: string, event: RawCalendarEvent | ArchivedCalendarEvent): void => {
    if (id) {
      idPool.add(id);
    }
    if (event.标题) {
      titlePool.add(event.标题);
    }
    collectEventTags(id, event).forEach(tag => {
      if (!tagMap.has(tag)) {
        tagMap.set(tag, { value: tag, label: tag, source: 'history' });
      }
    });
  };

  Object.entries(args.activeBuckets.临时).forEach(([id, event]) => collect(id, event));
  Object.entries(args.activeBuckets.重复).forEach(([id, event]) => collect(id, event));
  Object.entries(args.archive.completed).forEach(([id, event]) => collect(id, event));

  return {
    idCandidates: Array.from(idPool).sort((left, right) => left.localeCompare(right, 'zh-CN')),
    titleCandidates: Array.from(titlePool).sort((left, right) => left.localeCompare(right, 'zh-CN')),
    tagCandidates: Array.from(tagMap.values()).sort((left, right) => left.label.localeCompare(right.label, 'zh-CN')),
  };
}

export function collectEventTags(id: string, event: Pick<RawCalendarEvent, '标题' | '内容' | '标签'>): string[] {
  const values = new Set<string>();
  const normalizedId = String(id || '').toLowerCase();
  const text = `${event.标题 || ''} ${event.内容 || ''}`;

  (event.标签 || []).forEach(tag => {
    const normalized = String(tag || '').trim();
    if (normalized) {
      values.add(normalized);
    }
  });

  if (/祭|节|庆典/.test(text)) {
    values.add('节庆');
  }
  if (/比赛|大赛|竞赛/.test(text) || /contest|tournament/i.test(text)) {
    values.add('比赛');
  }
  if (/旅行|旅程|观光|巡游/.test(text)) {
    values.add('旅行');
  }
  if (/课程|上课|讲座/.test(text)) {
    values.add('课程');
  }
  if (/约会|邂逅/.test(text)) {
    values.add('约会');
  }
  if (/主线/.test(text) || normalizedId.includes('main')) {
    values.add('主线');
  }
  if (/支线/.test(text) || normalizedId.includes('side')) {
    values.add('支线');
  }
  if (values.size === 0) {
    values.add('限时');
  }

  return Array.from(values);
}

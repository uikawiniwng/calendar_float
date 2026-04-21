import { SCRIPT_NAME } from './constants';
import {
  buildCalendarBookControllerEntryContent,
  buildCalendarEventControllerEntryContent,
  buildCalendarReminderControllerEntryContent,
  buildCalendarUpdateRulesEntryContent,
  buildCalendarVariableListEntryContent,
  getCalendarManagedBookEntryDescriptors,
  getCalendarManagedFestivalEntryDescriptors,
  getCalendarManagedReminderEntryDescriptors,
  type CalendarManagedStaticEntryDescriptor,
} from './managed-worldbook-content';
import { getOfficialIndexData } from './official-data-loader';

const MANAGED_WORLDBOOK_MARKER = 'calendar_float_character_worldbook';
const MANAGED_ENTRY_PREFIX = '[DLC][扩展][月历球]';
const META_ENTRY_NAME = `${MANAGED_ENTRY_PREFIX}[meta]manifest`;
const UPDATE_RULES_ENTRY_NAME = `[mvu_update]${MANAGED_ENTRY_PREFIX}[月历变量更新规则]`;
const VARIABLE_LIST_ENTRY_NAME = `${MANAGED_ENTRY_PREFIX}[变量列表]`;
const EVENT_CONTROLLER_ENTRY_NAME = `${MANAGED_ENTRY_PREFIX}[controller][event]`;
const BOOK_CONTROLLER_ENTRY_NAME = `${MANAGED_ENTRY_PREFIX}[controller][book]`;
const REMINDER_CONTROLLER_ENTRY_NAME = `${MANAGED_ENTRY_PREFIX}[controller][reminder]`;
const FESTIVAL_WRAPPER_START_ENTRY_NAME = '<节日>';
const FESTIVAL_WRAPPER_END_ENTRY_NAME = '</节日>';
const FESTIVAL_REMINDER_WRAPPER_START_ENTRY_NAME = '<festival_reminder>';
const FESTIVAL_REMINDER_WRAPPER_END_ENTRY_NAME = '</festival_reminder>';
const MANAGED_WORLDBOOK_STORAGE_KEY = `${SCRIPT_NAME}:managed-worldbook-enabled`;
const CALENDAR_MANAGED_WORLDBOOK_VERSION = 'v3.1.0';
const DEFAULT_WORLDINFO_ORDER_BASE = 8800000;
const FESTIVAL_WRAPPER_ORDER_START = 900;
const FESTIVAL_EVENT_CONTROLLER_ORDER = 910;
const FESTIVAL_BOOK_CONTROLLER_ORDER = 920;
const FESTIVAL_WRAPPER_ORDER_END = 999;
const FESTIVAL_REMINDER_WRAPPER_ORDER_START = 900;
const FESTIVAL_REMINDER_CONTROLLER_ORDER = 910;
const FESTIVAL_REMINDER_WRAPPER_ORDER_END = 999;
const STORE_ONLY_KEY_PREFIX = '__calendar_float_store_only__';

export const CALENDAR_MANAGED_ENTRY_PREFIX = MANAGED_ENTRY_PREFIX;

const FESTIVAL_ENTRY_DESCRIPTORS = getCalendarManagedFestivalEntryDescriptors();
const BOOK_ENTRY_DESCRIPTORS = getCalendarManagedBookEntryDescriptors();
const REMINDER_ENTRY_DESCRIPTORS = getCalendarManagedReminderEntryDescriptors();

function normalizeEntryName(name: unknown): string {
  return String(name || '').trim();
}

function buildManagedStaticEntryName(kind: CalendarManagedStaticEntryDescriptor['kind'], entryLabel: string): string {
  return `${MANAGED_ENTRY_PREFIX}[${kind}]${normalizeEntryName(entryLabel)}`;
}

function buildStoreOnlyKey(kind: CalendarManagedStaticEntryDescriptor['kind'], id: string): string {
  return `${STORE_ONLY_KEY_PREFIX}${kind}_${String(id || '').trim()}__`;
}

const EXPECTED_FESTIVAL_ENTRY_NAMES = new Set(
  FESTIVAL_ENTRY_DESCRIPTORS.map(descriptor => buildManagedStaticEntryName(descriptor.kind, descriptor.entryLabel)),
);
const EXPECTED_BOOK_ENTRY_NAMES = new Set(
  BOOK_ENTRY_DESCRIPTORS.map(descriptor => buildManagedStaticEntryName(descriptor.kind, descriptor.entryLabel)),
);
const EXPECTED_REMINDER_ENTRY_NAMES = new Set(
  REMINDER_ENTRY_DESCRIPTORS.map(descriptor => buildManagedStaticEntryName(descriptor.kind, descriptor.entryLabel)),
);
const EXPECTED_CONTROLLER_ENTRY_NAMES = new Set([
  EVENT_CONTROLLER_ENTRY_NAME,
  BOOK_CONTROLLER_ENTRY_NAME,
  REMINDER_CONTROLLER_ENTRY_NAME,
]);
const EXPECTED_WRAPPER_ENTRY_NAMES = new Set([
  FESTIVAL_WRAPPER_START_ENTRY_NAME,
  FESTIVAL_WRAPPER_END_ENTRY_NAME,
  FESTIVAL_REMINDER_WRAPPER_START_ENTRY_NAME,
  FESTIVAL_REMINDER_WRAPPER_END_ENTRY_NAME,
]);
const EXPECTED_MANAGED_ENTRY_NAMES = new Set([
  META_ENTRY_NAME,
  UPDATE_RULES_ENTRY_NAME,
  VARIABLE_LIST_ENTRY_NAME,
  ...EXPECTED_CONTROLLER_ENTRY_NAMES,
  ...EXPECTED_WRAPPER_ENTRY_NAMES,
  ...EXPECTED_FESTIVAL_ENTRY_NAMES,
  ...EXPECTED_BOOK_ENTRY_NAMES,
  ...EXPECTED_REMINDER_ENTRY_NAMES,
]);
const EXPECTED_MANAGED_ENTRY_COUNT = EXPECTED_MANAGED_ENTRY_NAMES.size;

export type CalendarManagedWorldbookConnectivityState =
  | 'unknown'
  | 'checking'
  | 'ready'
  | 'missing'
  | 'recreated'
  | 'error';

export interface EnsureCalendarManagedWorldbookEntriesResult {
  name: string;
  created: boolean;
  updated: boolean;
}

export interface CalendarManagedWorldbookDiagnostics {
  worldbookName: string;
  version: string;
  connectivity: CalendarManagedWorldbookConnectivityState;
  existsInRegistry: boolean;
  foundByScript: boolean;
  createdDuringEnsure: boolean;
  updatedDuringEnsure: boolean;
  lastEnsureSucceeded: boolean;
  lastImportTriggered: boolean;
  entryCount: number;
  hasMetaEntry: boolean;
  hasUpdateRulesEntry: boolean;
  hasVariableListEntry: boolean;
  hasFestivalEntry: boolean;
  hasBookEntry: boolean;
  hasReminderEntry: boolean;
  hasEventControllerEntry: boolean;
  hasBookControllerEntry: boolean;
  hasReminderControllerEntry: boolean;
  festivalEntryCount: number;
  expectedFestivalEntryCount: number;
  bookEntryCount: number;
  expectedBookEntryCount: number;
  reminderEntryCount: number;
  expectedReminderEntryCount: number;
  controllerEntryCount: number;
  expectedControllerEntryCount: number;
  managedEntryCount: number;
  expectedManagedEntryCount: number;
  allManagedEntriesPresent: boolean;
  managementEnabled: boolean;
  lastError: string;
  lastEnsureAt: string;
  lastImportAt: string;
}

type ManagedWorldbookEntrySeed = Partial<WorldbookEntry>;
type PositionSlot = 'after_character_definition' | 'd0' | 'd1';

const diagnostics: CalendarManagedWorldbookDiagnostics = {
  worldbookName: '',
  version: CALENDAR_MANAGED_WORLDBOOK_VERSION,
  connectivity: 'unknown',
  existsInRegistry: false,
  foundByScript: false,
  createdDuringEnsure: false,
  updatedDuringEnsure: false,
  lastEnsureSucceeded: false,
  lastImportTriggered: false,
  entryCount: 0,
  hasMetaEntry: false,
  hasUpdateRulesEntry: false,
  hasVariableListEntry: false,
  hasFestivalEntry: false,
  hasBookEntry: false,
  hasReminderEntry: false,
  hasEventControllerEntry: false,
  hasBookControllerEntry: false,
  hasReminderControllerEntry: false,
  festivalEntryCount: 0,
  expectedFestivalEntryCount: FESTIVAL_ENTRY_DESCRIPTORS.length,
  bookEntryCount: 0,
  expectedBookEntryCount: BOOK_ENTRY_DESCRIPTORS.length,
  reminderEntryCount: 0,
  expectedReminderEntryCount: REMINDER_ENTRY_DESCRIPTORS.length,
  controllerEntryCount: 0,
  expectedControllerEntryCount: EXPECTED_CONTROLLER_ENTRY_NAMES.size,
  managedEntryCount: 0,
  expectedManagedEntryCount: EXPECTED_MANAGED_ENTRY_COUNT,
  allManagedEntriesPresent: false,
  managementEnabled: true,
  lastError: '',
  lastEnsureAt: '',
  lastImportAt: '',
};

function nowIso(): string {
  return new Date().toISOString();
}

function resetDiagnosticsError(): void {
  diagnostics.lastError = '';
}

function setDiagnosticsError(error: unknown): void {
  diagnostics.lastError = error instanceof Error ? error.message : String(error ?? '');
}

function emitManagedWorldbookDebugLog(message: string, extra?: Record<string, unknown>): void {
  if (extra) {
    console.info(`[${SCRIPT_NAME}] ${message}`, extra);
    return;
  }
  console.info(`[${SCRIPT_NAME}] ${message}`);
}

function emitManagedWorldbookWarnLog(message: string, extra?: Record<string, unknown>): void {
  if (extra) {
    console.warn(`[${SCRIPT_NAME}] ${message}`, extra);
    return;
  }
  console.warn(`[${SCRIPT_NAME}] ${message}`);
}

function normalizeWorldbookNameList(names: string[]): string[] {
  return names.map(name => String(name || '').trim()).filter(Boolean);
}

function readCurrentCharacterWorldbookBinding(): CharWorldbooks {
  const binding = getCharWorldbookNames('current');
  return {
    primary: binding.primary ? String(binding.primary).trim() : null,
    additional: binding.additional
      .map(name => String(name || '').trim())
      .filter(Boolean)
      .filter((name, index, list) => list.indexOf(name) === index),
  };
}

function readCurrentCharacterPrimaryWorldbookName(): string {
  return String(readCurrentCharacterWorldbookBinding().primary || '').trim();
}

function isManagedWorldbookEntry(entry: Pick<WorldbookEntry, 'name' | 'extra'>): boolean {
  return (
    String(entry.extra?.managedBy ?? '') === MANAGED_WORLDBOOK_MARKER ||
    normalizeEntryName(entry.name).startsWith(MANAGED_ENTRY_PREFIX) ||
    normalizeEntryName(entry.name).startsWith(`[mvu_update]${MANAGED_ENTRY_PREFIX}`)
  );
}

function readManagedEntry(entries: WorldbookEntry[], entryName: string): WorldbookEntry | undefined {
  return entries.find(entry => entry.name === entryName && isManagedWorldbookEntry(entry));
}

function resolvePosition(slot: PositionSlot, order: number): WorldbookEntry['position'] {
  if (slot === 'after_character_definition') {
    return {
      type: 'after_character_definition',
      role: 'system',
      depth: 0,
      order,
    };
  }

  return {
    type: 'at_depth',
    role: 'system',
    depth: slot === 'd0' ? 0 : 1,
    order,
  };
}

function buildManagedEntryBase(args: {
  name: string;
  content: string;
  order: number;
  slot: PositionSlot;
  enabled?: boolean;
  strategy: WorldbookEntry['strategy'];
  entryKind: string;
  extra?: Record<string, unknown>;
}): ManagedWorldbookEntrySeed {
  return {
    name: args.name,
    enabled: args.enabled !== false,
    strategy: args.strategy,
    position: resolvePosition(args.slot, args.order),
    probability: 100,
    recursion: {
      prevent_incoming: true,
      prevent_outgoing: true,
      delay_until: null,
    },
    effect: {
      sticky: null,
      cooldown: null,
      delay: null,
    },
    content: String(args.content || '').trim(),
    extra: {
      managedBy: MANAGED_WORLDBOOK_MARKER,
      version: CALENDAR_MANAGED_WORLDBOOK_VERSION,
      entryPrefix: MANAGED_ENTRY_PREFIX,
      entryKind: args.entryKind,
      slot: args.slot,
      ...(args.extra ?? {}),
    },
  };
}

function buildManagedConstantEntry(args: {
  name: string;
  content: string;
  order: number;
  slot: PositionSlot;
  enabled?: boolean;
  entryKind: string;
  extra?: Record<string, unknown>;
}): ManagedWorldbookEntrySeed {
  return buildManagedEntryBase({
    ...args,
    strategy: {
      type: 'constant',
      keys: [],
      keys_secondary: {
        logic: 'and_any',
        keys: [],
      },
      scan_depth: 'same_as_global',
    },
  });
}

function buildManagedStoreOnlyEntry(args: {
  descriptor: CalendarManagedStaticEntryDescriptor;
  order: number;
  slot: PositionSlot;
}): ManagedWorldbookEntrySeed {
  return buildManagedEntryBase({
    name: buildManagedStaticEntryName(args.descriptor.kind, args.descriptor.entryLabel),
    content: args.descriptor.content,
    order: args.order,
    slot: args.slot,
    entryKind: `${args.descriptor.kind}_store`,
    extra: {
      entryId: args.descriptor.id,
      entryTitle: args.descriptor.title,
    },
    strategy: {
      type: 'selective',
      keys: [buildStoreOnlyKey(args.descriptor.kind, args.descriptor.id)],
      keys_secondary: {
        logic: 'and_any',
        keys: [],
      },
      scan_depth: 'same_as_global',
    },
  });
}

function allocateSequentialOrders(start: number, end: number, count: number, context: string): number[] {
  const available = end - start + 1;
  if (count > available) {
    throw new Error(`[${SCRIPT_NAME}] ${context} 需要 ${count} 个顺序位，但 ${start}-${end} 仅提供 ${available} 个`);
  }

  return Array.from({ length: count }, (_, index) => start + index);
}

function buildManagedWorldbookEntries(): ManagedWorldbookEntrySeed[] {
  const officialIndex = getOfficialIndexData();
  const festivalDescriptorMap = new Map(FESTIVAL_ENTRY_DESCRIPTORS.map(descriptor => [descriptor.id, descriptor]));
  const bookDescriptorMap = new Map(BOOK_ENTRY_DESCRIPTORS.map(descriptor => [descriptor.id, descriptor]));
  const reminderDescriptorMap = new Map(REMINDER_ENTRY_DESCRIPTORS.map(descriptor => [descriptor.id, descriptor]));

  const eventControllerFestivals = officialIndex.festivals
    .map(item => {
      const descriptor = festivalDescriptorMap.get(item.id);
      if (!descriptor) {
        return null;
      }
      return {
        id: item.id,
        entryName: buildManagedStaticEntryName('event', descriptor.entryLabel),
        title: item.title,
        start: item.start,
        end: item.end,
        controller: item.controller,
      };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  const bookControllerBooks = officialIndex.books
    .map(item => {
      const descriptor = bookDescriptorMap.get(item.id);
      if (!descriptor) {
        return null;
      }
      return {
        id: item.id,
        entryName: buildManagedStaticEntryName('book', descriptor.entryLabel),
        title: item.title,
        controller: item.controller,
      };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  const reminderControllerFestivals = officialIndex.festivals
    .map(item => {
      const upcomingDescriptor = reminderDescriptorMap.get(`${item.id}_upcoming_reminder`);
      const activeDescriptor = reminderDescriptorMap.get(`${item.id}_active_reminder`);
      if (!upcomingDescriptor || !activeDescriptor) {
        return null;
      }
      return {
        id: item.id,
        upcomingEntryName: buildManagedStaticEntryName('reminder', upcomingDescriptor.entryLabel),
        activeEntryName: buildManagedStaticEntryName('reminder', activeDescriptor.entryLabel),
        title: item.title,
        start: item.start,
        end: item.end,
        controller: item.controller,
      };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  const festivalContentDescriptors = [...FESTIVAL_ENTRY_DESCRIPTORS, ...BOOK_ENTRY_DESCRIPTORS];
  const festivalContentOrders = allocateSequentialOrders(
    FESTIVAL_BOOK_CONTROLLER_ORDER + 1,
    FESTIVAL_WRAPPER_ORDER_END - 1,
    festivalContentDescriptors.length,
    '节日 event/book 条目',
  );
  const reminderContentOrders = allocateSequentialOrders(
    FESTIVAL_REMINDER_CONTROLLER_ORDER + 1,
    FESTIVAL_REMINDER_WRAPPER_ORDER_END - 1,
    REMINDER_ENTRY_DESCRIPTORS.length,
    '节日提醒条目',
  );

  const entries: ManagedWorldbookEntrySeed[] = [
    buildManagedConstantEntry({
      name: META_ENTRY_NAME,
      content: '本条目由脚本自动维护，用于标记月历球 worldbook backend 条目已安装到角色主 worldbook。',
      order: DEFAULT_WORLDINFO_ORDER_BASE,
      slot: 'after_character_definition',
      enabled: false,
      entryKind: 'meta_manifest',
    }),
    buildManagedConstantEntry({
      name: UPDATE_RULES_ENTRY_NAME,
      content: buildCalendarUpdateRulesEntryContent(),
      order: DEFAULT_WORLDINFO_ORDER_BASE + 10,
      slot: 'd1',
      entryKind: 'mvu_update_rule',
    }),
    buildManagedConstantEntry({
      name: VARIABLE_LIST_ENTRY_NAME,
      content: buildCalendarVariableListEntryContent(),
      order: DEFAULT_WORLDINFO_ORDER_BASE + 20,
      slot: 'd1',
      entryKind: 'variable_list',
    }),
    buildManagedConstantEntry({
      name: FESTIVAL_REMINDER_WRAPPER_START_ENTRY_NAME,
      content: '<festival_reminder>',
      order: FESTIVAL_REMINDER_WRAPPER_ORDER_START,
      slot: 'd0',
      entryKind: 'wrapper_reminder_start',
    }),
    buildManagedConstantEntry({
      name: REMINDER_CONTROLLER_ENTRY_NAME,
      content: buildCalendarReminderControllerEntryContent({
        festivals: reminderControllerFestivals,
      }),
      order: FESTIVAL_REMINDER_CONTROLLER_ORDER,
      slot: 'd0',
      entryKind: 'controller_reminder',
    }),
    buildManagedConstantEntry({
      name: FESTIVAL_REMINDER_WRAPPER_END_ENTRY_NAME,
      content: '</festival_reminder>',
      order: FESTIVAL_REMINDER_WRAPPER_ORDER_END,
      slot: 'd0',
      entryKind: 'wrapper_reminder_end',
    }),
    buildManagedConstantEntry({
      name: FESTIVAL_WRAPPER_START_ENTRY_NAME,
      content: '<节日>',
      order: FESTIVAL_WRAPPER_ORDER_START,
      slot: 'after_character_definition',
      entryKind: 'wrapper_festival_start',
    }),
    buildManagedConstantEntry({
      name: EVENT_CONTROLLER_ENTRY_NAME,
      content: buildCalendarEventControllerEntryContent({
        festivals: eventControllerFestivals,
      }),
      order: FESTIVAL_EVENT_CONTROLLER_ORDER,
      slot: 'after_character_definition',
      entryKind: 'controller_event',
    }),
    buildManagedConstantEntry({
      name: BOOK_CONTROLLER_ENTRY_NAME,
      content: buildCalendarBookControllerEntryContent({
        books: bookControllerBooks,
      }),
      order: FESTIVAL_BOOK_CONTROLLER_ORDER,
      slot: 'after_character_definition',
      entryKind: 'controller_book',
    }),
    buildManagedConstantEntry({
      name: FESTIVAL_WRAPPER_END_ENTRY_NAME,
      content: '</节日>',
      order: FESTIVAL_WRAPPER_ORDER_END,
      slot: 'after_character_definition',
      entryKind: 'wrapper_festival_end',
    }),
  ];

  REMINDER_ENTRY_DESCRIPTORS.forEach((descriptor, index) => {
    entries.push(
      buildManagedStoreOnlyEntry({
        descriptor,
        order: reminderContentOrders[index],
        slot: 'd0',
      }),
    );
  });

  festivalContentDescriptors.forEach((descriptor, index) => {
    entries.push(
      buildManagedStoreOnlyEntry({
        descriptor,
        order: festivalContentOrders[index],
        slot: 'after_character_definition',
      }),
    );
  });

  return entries;
}

function mergeManagedEntry(
  existing: WorldbookEntry | undefined,
  seed: ManagedWorldbookEntrySeed,
): ManagedWorldbookEntrySeed {
  if (!existing) {
    return seed;
  }

  return {
    ...existing,
    ...seed,
    strategy: {
      ...existing.strategy,
      ...(seed.strategy ?? {}),
      keys_secondary: {
        ...existing.strategy.keys_secondary,
        ...((seed.strategy as WorldbookEntry['strategy'] | undefined)?.keys_secondary ?? {}),
      },
    },
    position: {
      ...existing.position,
      ...(seed.position ?? {}),
    },
    recursion: {
      ...existing.recursion,
      ...(seed.recursion ?? {}),
    },
    effect: {
      ...existing.effect,
      ...(seed.effect ?? {}),
    },
    extra: {
      ...(existing.extra ?? {}),
      ...(seed.extra ?? {}),
    },
  };
}

function syncEntryDiagnostics(entries: WorldbookEntry[], worldbookName: string): void {
  diagnostics.worldbookName = worldbookName;
  diagnostics.entryCount = entries.length;
  diagnostics.hasMetaEntry = Boolean(readManagedEntry(entries, META_ENTRY_NAME));
  diagnostics.hasUpdateRulesEntry = Boolean(readManagedEntry(entries, UPDATE_RULES_ENTRY_NAME));
  diagnostics.hasVariableListEntry = Boolean(readManagedEntry(entries, VARIABLE_LIST_ENTRY_NAME));
  diagnostics.hasEventControllerEntry = Boolean(readManagedEntry(entries, EVENT_CONTROLLER_ENTRY_NAME));
  diagnostics.hasBookControllerEntry = Boolean(readManagedEntry(entries, BOOK_CONTROLLER_ENTRY_NAME));
  diagnostics.hasReminderControllerEntry = Boolean(readManagedEntry(entries, REMINDER_CONTROLLER_ENTRY_NAME));

  const festivalEntryCount = entries.filter(
    entry => isManagedWorldbookEntry(entry) && EXPECTED_FESTIVAL_ENTRY_NAMES.has(normalizeEntryName(entry.name)),
  ).length;
  const bookEntryCount = entries.filter(
    entry => isManagedWorldbookEntry(entry) && EXPECTED_BOOK_ENTRY_NAMES.has(normalizeEntryName(entry.name)),
  ).length;
  const reminderEntryCount = entries.filter(
    entry => isManagedWorldbookEntry(entry) && EXPECTED_REMINDER_ENTRY_NAMES.has(normalizeEntryName(entry.name)),
  ).length;
  const controllerEntryCount = entries.filter(
    entry => isManagedWorldbookEntry(entry) && EXPECTED_CONTROLLER_ENTRY_NAMES.has(normalizeEntryName(entry.name)),
  ).length;

  diagnostics.hasFestivalEntry = festivalEntryCount > 0;
  diagnostics.hasBookEntry = bookEntryCount > 0;
  diagnostics.hasReminderEntry = reminderEntryCount > 0;
  diagnostics.festivalEntryCount = festivalEntryCount;
  diagnostics.bookEntryCount = bookEntryCount;
  diagnostics.reminderEntryCount = reminderEntryCount;
  diagnostics.controllerEntryCount = controllerEntryCount;
  diagnostics.managedEntryCount = entries.filter(entry => isManagedWorldbookEntry(entry)).length;
  diagnostics.allManagedEntriesPresent = [...EXPECTED_MANAGED_ENTRY_NAMES].every(entryName =>
    Boolean(readManagedEntry(entries, entryName)),
  );
}

function isManagementEnabled(): boolean {
  try {
    return window.localStorage?.getItem(MANAGED_WORLDBOOK_STORAGE_KEY) !== '0';
  } catch (error) {
    console.warn(`[${SCRIPT_NAME}] 读取 worldbook 管理开关失败`, error);
    return true;
  }
}

function setManagementEnabled(enabled: boolean): void {
  diagnostics.managementEnabled = enabled;
  try {
    window.localStorage?.setItem(MANAGED_WORLDBOOK_STORAGE_KEY, enabled ? '1' : '0');
  } catch (error) {
    console.warn(`[${SCRIPT_NAME}] 写入 worldbook 管理开关失败`, error);
  }
}

async function readCharacterPrimaryWorldbookEntries(): Promise<{ worldbookName: string; entries: WorldbookEntry[] }> {
  const worldbookName = readCurrentCharacterPrimaryWorldbookName();
  if (!worldbookName) {
    throw new Error('当前角色没有主 worldbook，无法写入脚本条目');
  }
  const entries = await getWorldbook(worldbookName);
  return { worldbookName, entries };
}

function assertManagedEntriesWritten(entries: WorldbookEntry[], desiredEntries: ManagedWorldbookEntrySeed[]): void {
  const missingNames: string[] = [];
  const emptyContentNames: string[] = [];

  desiredEntries.forEach(entry => {
    const entryName = normalizeEntryName(entry.name);
    const actual = readManagedEntry(entries, entryName);
    if (!actual) {
      missingNames.push(entryName);
      return;
    }
    if (!String(actual.content ?? '').trim()) {
      emptyContentNames.push(entryName);
    }
  });

  if (missingNames.length > 0 || emptyContentNames.length > 0) {
    throw new Error(
      [
        missingNames.length > 0 ? `缺失托管条目: ${missingNames.join(', ')}` : '',
        emptyContentNames.length > 0 ? `托管条目正文为空: ${emptyContentNames.join(', ')}` : '',
      ]
        .filter(Boolean)
        .join('；'),
    );
  }
}

async function upsertManagedEntries(): Promise<EnsureCalendarManagedWorldbookEntriesResult> {
  diagnostics.managementEnabled = isManagementEnabled();
  if (!diagnostics.managementEnabled) {
    diagnostics.connectivity = 'missing';
    diagnostics.lastEnsureSucceeded = true;
    diagnostics.updatedDuringEnsure = false;
    diagnostics.createdDuringEnsure = false;
    diagnostics.worldbookName = readCurrentCharacterPrimaryWorldbookName();
    return {
      name: diagnostics.worldbookName,
      created: false,
      updated: false,
    };
  }

  const { worldbookName, entries } = await readCharacterPrimaryWorldbookEntries();
  const desiredEntries = buildManagedWorldbookEntries();
  const desiredEntryNames = new Set(desiredEntries.map(entry => normalizeEntryName(entry.name)));
  const existingManagedMap = new Map(
    entries.filter(entry => isManagedWorldbookEntry(entry)).map(entry => [normalizeEntryName(entry.name), entry]),
  );
  const missingEntries = desiredEntries.filter(entry => !existingManagedMap.has(normalizeEntryName(entry.name)));

  await updateWorldbookWith(worldbookName, currentEntries => {
    const currentManagedMap = new Map(
      currentEntries
        .filter(entry => isManagedWorldbookEntry(entry))
        .map(entry => [normalizeEntryName(entry.name), entry]),
    );
    const unmanagedEntries = currentEntries.filter(entry => !isManagedWorldbookEntry(entry));
    const nextManagedEntries = desiredEntries
      .map(entry => {
        const entryName = normalizeEntryName(entry.name);
        const existingManagedEntry = currentManagedMap.get(entryName);
        return existingManagedEntry ? mergeManagedEntry(existingManagedEntry, entry) : null;
      })
      .filter((entry): entry is ManagedWorldbookEntrySeed => Boolean(entry));

    return [...unmanagedEntries, ...nextManagedEntries];
  });

  if (missingEntries.length > 0) {
    await createWorldbookEntries(worldbookName, missingEntries);
  }

  const refreshedEntries = await getWorldbook(worldbookName);
  assertManagedEntriesWritten(refreshedEntries, desiredEntries);
  syncEntryDiagnostics(refreshedEntries, worldbookName);
  diagnostics.existsInRegistry = normalizeWorldbookNameList(getWorldbookNames()).includes(worldbookName);
  diagnostics.foundByScript = true;
  diagnostics.createdDuringEnsure = missingEntries.length > 0;
  diagnostics.updatedDuringEnsure =
    diagnostics.createdDuringEnsure ||
    refreshedEntries.filter(
      entry => isManagedWorldbookEntry(entry) && desiredEntryNames.has(normalizeEntryName(entry.name)),
    ).length === desiredEntries.length;
  diagnostics.lastEnsureSucceeded = true;
  diagnostics.connectivity = diagnostics.allManagedEntriesPresent ? 'ready' : 'missing';
  resetDiagnosticsError();

  return {
    name: worldbookName,
    created: diagnostics.createdDuringEnsure,
    updated: diagnostics.updatedDuringEnsure,
  };
}

async function refreshDiagnosticsFromCharacterWorldbook(): Promise<void> {
  diagnostics.managementEnabled = isManagementEnabled();
  diagnostics.worldbookName = readCurrentCharacterPrimaryWorldbookName();
  diagnostics.existsInRegistry =
    Boolean(diagnostics.worldbookName) &&
    normalizeWorldbookNameList(getWorldbookNames()).includes(diagnostics.worldbookName);

  if (!diagnostics.worldbookName || !diagnostics.existsInRegistry) {
    diagnostics.foundByScript = false;
    diagnostics.entryCount = 0;
    diagnostics.hasMetaEntry = false;
    diagnostics.hasUpdateRulesEntry = false;
    diagnostics.hasVariableListEntry = false;
    diagnostics.hasFestivalEntry = false;
    diagnostics.hasBookEntry = false;
    diagnostics.hasReminderEntry = false;
    diagnostics.hasEventControllerEntry = false;
    diagnostics.hasBookControllerEntry = false;
    diagnostics.hasReminderControllerEntry = false;
    diagnostics.festivalEntryCount = 0;
    diagnostics.bookEntryCount = 0;
    diagnostics.reminderEntryCount = 0;
    diagnostics.controllerEntryCount = 0;
    diagnostics.managedEntryCount = 0;
    diagnostics.allManagedEntriesPresent = false;
    diagnostics.connectivity = 'missing';
    return;
  }

  const entries = await getWorldbook(diagnostics.worldbookName);
  diagnostics.foundByScript = true;
  syncEntryDiagnostics(entries, diagnostics.worldbookName);
  diagnostics.connectivity =
    diagnostics.managementEnabled && diagnostics.allManagedEntriesPresent ? 'ready' : 'missing';
}

export function getCalendarManagedWorldbookDiagnostics(): CalendarManagedWorldbookDiagnostics {
  return { ...diagnostics };
}

export async function syncCalendarManagedCharacterEntries(): Promise<EnsureCalendarManagedWorldbookEntriesResult> {
  diagnostics.connectivity = 'checking';
  diagnostics.lastEnsureAt = nowIso();
  diagnostics.createdDuringEnsure = false;
  diagnostics.updatedDuringEnsure = false;
  diagnostics.lastEnsureSucceeded = false;
  diagnostics.foundByScript = false;
  resetDiagnosticsError();

  try {
    const result = await upsertManagedEntries();
    emitManagedWorldbookDebugLog('角色主 worldbook backend 条目同步完成', {
      worldbookName: result.name,
      created: result.created,
      updated: result.updated,
      managementEnabled: diagnostics.managementEnabled,
      managedEntryCount: diagnostics.managedEntryCount,
      expectedManagedEntryCount: diagnostics.expectedManagedEntryCount,
      festivalEntryCount: diagnostics.festivalEntryCount,
      expectedFestivalEntryCount: diagnostics.expectedFestivalEntryCount,
      bookEntryCount: diagnostics.bookEntryCount,
      expectedBookEntryCount: diagnostics.expectedBookEntryCount,
      reminderEntryCount: diagnostics.reminderEntryCount,
      expectedReminderEntryCount: diagnostics.expectedReminderEntryCount,
      controllerEntryCount: diagnostics.controllerEntryCount,
      expectedControllerEntryCount: diagnostics.expectedControllerEntryCount,
    });
    return result;
  } catch (error) {
    diagnostics.connectivity = 'error';
    diagnostics.lastEnsureSucceeded = false;
    diagnostics.foundByScript = false;
    setDiagnosticsError(error);
    emitManagedWorldbookWarnLog('同步角色主 worldbook backend 条目失败', {
      worldbookName: diagnostics.worldbookName,
      lastError: diagnostics.lastError,
    });
    throw error;
  }
}

export async function uninstallCalendarManagedWorldbookEntries(): Promise<{
  worldbookName: string;
  removedCount: number;
}> {
  const worldbookName = readCurrentCharacterPrimaryWorldbookName();
  if (!worldbookName) {
    throw new Error('当前角色没有主 worldbook，无法卸载脚本条目');
  }

  const beforeEntries = await getWorldbook(worldbookName);
  const removedCount = beforeEntries.filter(entry => isManagedWorldbookEntry(entry)).length;
  await deleteWorldbookEntries(worldbookName, entry => isManagedWorldbookEntry(entry));
  setManagementEnabled(false);
  await refreshDiagnosticsFromCharacterWorldbook();
  diagnostics.lastEnsureSucceeded = true;
  diagnostics.updatedDuringEnsure = removedCount > 0;
  diagnostics.createdDuringEnsure = false;
  diagnostics.connectivity = 'missing';
  resetDiagnosticsError();
  emitManagedWorldbookDebugLog('已从角色主 worldbook 卸载脚本 backend 条目', {
    worldbookName,
    removedCount,
  });

  return {
    worldbookName,
    removedCount,
  };
}

export async function installCalendarManagedWorldbookEntries(): Promise<EnsureCalendarManagedWorldbookEntriesResult> {
  diagnostics.lastImportTriggered = true;
  diagnostics.lastImportAt = nowIso();
  diagnostics.connectivity = 'checking';
  setManagementEnabled(true);
  emitManagedWorldbookDebugLog('收到手动导入角色主 worldbook backend 条目请求', {
    worldbookName: readCurrentCharacterPrimaryWorldbookName(),
  });

  try {
    const result = await syncCalendarManagedCharacterEntries();
    diagnostics.connectivity = 'recreated';
    diagnostics.createdDuringEnsure = result.created;
    diagnostics.updatedDuringEnsure = result.updated;
    diagnostics.lastEnsureSucceeded = true;
    return result;
  } catch (error) {
    diagnostics.connectivity = 'error';
    diagnostics.lastEnsureSucceeded = false;
    setDiagnosticsError(error);
    emitManagedWorldbookWarnLog('手动导入角色主 worldbook backend 条目失败', {
      worldbookName: diagnostics.worldbookName,
      lastError: diagnostics.lastError,
    });
    throw error;
  }
}

export async function ensureCalendarManagedWorldbookEntries(): Promise<EnsureCalendarManagedWorldbookEntriesResult> {
  diagnostics.connectivity = 'checking';
  diagnostics.lastEnsureAt = nowIso();
  diagnostics.createdDuringEnsure = false;
  diagnostics.updatedDuringEnsure = false;
  diagnostics.lastEnsureSucceeded = false;
  resetDiagnosticsError();

  try {
    const result = await syncCalendarManagedCharacterEntries();
    diagnostics.connectivity =
      diagnostics.managementEnabled && diagnostics.allManagedEntriesPresent ? 'ready' : 'missing';
    return result;
  } catch (error) {
    diagnostics.connectivity = 'error';
    diagnostics.lastEnsureSucceeded = false;
    diagnostics.foundByScript = false;
    setDiagnosticsError(error);
    emitManagedWorldbookWarnLog('角色主 worldbook backend 检查失败', {
      worldbookName: diagnostics.worldbookName,
      lastError: diagnostics.lastError,
    });
    throw error;
  }
}

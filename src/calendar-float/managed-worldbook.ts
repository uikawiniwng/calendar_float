/**
 * 负责：安装、重装、卸载、检查脚本自带的 worldbook backend 基础设施条目。
 * 不负责：节庆正文来源、书籍正文来源、trigger 逻辑判定。
 * 上游：[`./index.ts`](src/calendar-float/index.ts) 与 [`./widget.ts`](src/calendar-float/widget.ts) 会调用这里的能力。
 */
import { SCRIPT_NAME } from './constants';
import {
  buildCalendarUpdateRulesEntryContent,
  buildCalendarVariableListEntryContent,
} from './managed-worldbook-content';

const MANAGED_WORLDBOOK_MARKER = 'calendar_float_character_worldbook';
const MANAGED_ENTRY_PREFIX = '[DLC][扩展][月历球]';
const META_ENTRY_NAME = `${MANAGED_ENTRY_PREFIX}[meta]manifest`;
const UPDATE_RULES_ENTRY_NAME = `[mvu_update]${MANAGED_ENTRY_PREFIX}[月历变量更新规则]`;
const VARIABLE_LIST_ENTRY_NAME = `${MANAGED_ENTRY_PREFIX}[变量列表]`;
const MANAGED_WORLDBOOK_STORAGE_KEY = `${SCRIPT_NAME}:managed-worldbook-enabled`;
const CALENDAR_MANAGED_WORLDBOOK_VERSION = 'v4.0.0';
const DEFAULT_WORLDINFO_ORDER_BASE = 8800000;

export const CALENDAR_MANAGED_ENTRY_PREFIX = MANAGED_ENTRY_PREFIX;

const EXPECTED_MANAGED_ENTRY_NAMES = new Set([META_ENTRY_NAME, UPDATE_RULES_ENTRY_NAME, VARIABLE_LIST_ENTRY_NAME]);
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
  managedEntryCount: number;
  expectedManagedEntryCount: number;
  allManagedEntriesPresent: boolean;
  managementEnabled: boolean;
  lastError: string;
  lastEnsureAt: string;
  lastImportAt: string;
}

type ManagedWorldbookEntrySeed = Partial<WorldbookEntry>;
type PositionSlot = 'after_character_definition' | 'd1';

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

function normalizeEntryName(name: unknown): string {
  return String(name || '').trim();
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
    depth: 1,
    order,
  };
}

function buildManagedEntryBase(args: {
  name: string;
  content: string;
  order: number;
  slot: PositionSlot;
  enabled?: boolean;
  entryKind: string;
}): ManagedWorldbookEntrySeed {
  return {
    name: args.name,
    enabled: args.enabled !== false,
    strategy: {
      type: 'constant',
      keys: [],
      keys_secondary: {
        logic: 'and_any',
        keys: [],
      },
      scan_depth: 'same_as_global',
    },
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
    },
  };
}

function buildManagedWorldbookEntries(): ManagedWorldbookEntrySeed[] {
  return [
    buildManagedEntryBase({
      name: META_ENTRY_NAME,
      content: '本条目由脚本自动维护，用于标记月历球 runtime worldbook 基础设施已安装到角色主 worldbook。',
      order: DEFAULT_WORLDINFO_ORDER_BASE,
      slot: 'after_character_definition',
      enabled: false,
      entryKind: 'meta_manifest',
    }),
    buildManagedEntryBase({
      name: UPDATE_RULES_ENTRY_NAME,
      content: buildCalendarUpdateRulesEntryContent(),
      order: DEFAULT_WORLDINFO_ORDER_BASE + 10,
      slot: 'd1',
      entryKind: 'mvu_update_rule',
    }),
    buildManagedEntryBase({
      name: VARIABLE_LIST_ENTRY_NAME,
      content: buildCalendarVariableListEntryContent(),
      order: DEFAULT_WORLDINFO_ORDER_BASE + 20,
      slot: 'd1',
      entryKind: 'variable_list',
    }),
  ];
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
  diagnostics.managedEntryCount = entries.filter(entry => isManagedWorldbookEntry(entry)).length;
  diagnostics.allManagedEntriesPresent = Array.from(EXPECTED_MANAGED_ENTRY_NAMES).every(entryName =>
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

async function readWorldbookEntriesByName(
  worldbookName: string,
  options?: { createIfMissing?: boolean },
): Promise<{ worldbookName: string; entries: WorldbookEntry[]; existed: boolean }> {
  const normalizedWorldbookName = normalizeEntryName(worldbookName);
  if (!normalizedWorldbookName) {
    throw new Error('worldbook 名称不能为空');
  }

  try {
    const entries = await getWorldbook(normalizedWorldbookName);
    return {
      worldbookName: normalizedWorldbookName,
      entries,
      existed: true,
    };
  } catch (error) {
    if (!options?.createIfMissing) {
      throw error;
    }

    await createOrReplaceWorldbook(normalizedWorldbookName, []);
    const entries = await getWorldbook(normalizedWorldbookName);
    return {
      worldbookName: normalizedWorldbookName,
      entries,
      existed: false,
    };
  }
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

async function upsertManagedEntriesToTargetWorldbook(args: {
  worldbookName: string;
  entries: WorldbookEntry[];
  syncDiagnostics: boolean;
}): Promise<EnsureCalendarManagedWorldbookEntriesResult> {
  const { worldbookName, entries, syncDiagnostics } = args;
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
        return mergeManagedEntry(existingManagedEntry, entry);
      })
      .filter((entry): entry is ManagedWorldbookEntrySeed => Boolean(entry));

    return [...unmanagedEntries, ...nextManagedEntries];
  });

  if (missingEntries.length > 0) {
    await createWorldbookEntries(worldbookName, missingEntries);
  }

  const refreshedEntries = await getWorldbook(worldbookName);
  assertManagedEntriesWritten(refreshedEntries, desiredEntries);
  const updated =
    missingEntries.length > 0 ||
    refreshedEntries.filter(
      entry => isManagedWorldbookEntry(entry) && desiredEntryNames.has(normalizeEntryName(entry.name)),
    ).length === desiredEntries.length;

  if (syncDiagnostics) {
    syncEntryDiagnostics(refreshedEntries, worldbookName);
    diagnostics.existsInRegistry = normalizeWorldbookNameList(getWorldbookNames()).includes(worldbookName);
    diagnostics.foundByScript = true;
    diagnostics.createdDuringEnsure = missingEntries.length > 0;
    diagnostics.updatedDuringEnsure = updated;
    diagnostics.lastEnsureSucceeded = true;
    diagnostics.connectivity = diagnostics.allManagedEntriesPresent ? 'ready' : 'missing';
    resetDiagnosticsError();
  }

  return {
    name: worldbookName,
    created: missingEntries.length > 0,
    updated,
  };
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
  return upsertManagedEntriesToTargetWorldbook({
    worldbookName,
    entries,
    syncDiagnostics: true,
  });
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
    emitManagedWorldbookDebugLog('角色主 worldbook runtime 基础设施条目同步完成', {
      worldbookName: result.name,
      created: result.created,
      updated: result.updated,
      managementEnabled: diagnostics.managementEnabled,
      managedEntryCount: diagnostics.managedEntryCount,
      expectedManagedEntryCount: diagnostics.expectedManagedEntryCount,
    });
    return result;
  } catch (error) {
    diagnostics.connectivity = 'error';
    diagnostics.lastEnsureSucceeded = false;
    diagnostics.foundByScript = false;
    setDiagnosticsError(error);
    emitManagedWorldbookWarnLog('同步角色主 worldbook runtime 基础设施条目失败', {
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
  emitManagedWorldbookDebugLog('已从角色主 worldbook 卸载脚本 runtime 基础设施条目', {
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
  emitManagedWorldbookDebugLog('收到手动导入角色主 worldbook runtime 基础设施条目请求', {
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
    emitManagedWorldbookWarnLog('手动导入角色主 worldbook runtime 基础设施条目失败', {
      worldbookName: diagnostics.worldbookName,
      lastError: diagnostics.lastError,
    });
    throw error;
  }
}

export async function installCalendarManagedEntriesToExternalWorldbook(
  worldbookName: string,
): Promise<EnsureCalendarManagedWorldbookEntriesResult> {
  const {
    worldbookName: targetWorldbookName,
    entries,
    existed,
  } = await readWorldbookEntriesByName(worldbookName, {
    createIfMissing: true,
  });
  const result = await upsertManagedEntriesToTargetWorldbook({
    worldbookName: targetWorldbookName,
    entries,
    syncDiagnostics: false,
  });
  emitManagedWorldbookDebugLog(
    existed ? '已更新外部 worldbook runtime 基础设施条目' : '已创建外部 worldbook 并写入 runtime 基础设施条目',
    {
      worldbookName: targetWorldbookName,
      created: result.created,
      updated: result.updated,
    },
  );
  return result;
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
    emitManagedWorldbookWarnLog('角色主 worldbook runtime 基础设施检查失败', {
      worldbookName: diagnostics.worldbookName,
      lastError: diagnostics.lastError,
    });
    throw error;
  }
}

import { SCRIPT_NAME } from './constants';

export interface CalendarRuntimeContextIdentity {
  characterName: string;
  chatId: string;
  key: string;
}

export type CalendarRuntimeContextChangeReason = 'chat_changed' | 'character_page_loaded';

export interface CalendarRuntimeContextChange {
  reason: CalendarRuntimeContextChangeReason;
  previous: CalendarRuntimeContextIdentity;
  next: CalendarRuntimeContextIdentity;
}

export interface CalendarRuntimeContextWatcher {
  initial: CalendarRuntimeContextIdentity;
  stop: () => void;
}

export function buildCalendarRuntimeContextKey(characterName: unknown, chatId: unknown): string {
  return JSON.stringify([String(characterName ?? '').trim(), String(chatId ?? '').trim()]);
}

export function createCalendarRuntimeContextIdentity(
  characterName: unknown,
  chatId: unknown,
): CalendarRuntimeContextIdentity {
  const normalizedCharacterName = String(characterName ?? '').trim();
  const normalizedChatId = String(chatId ?? '').trim();
  return {
    characterName: normalizedCharacterName,
    chatId: normalizedChatId,
    key: buildCalendarRuntimeContextKey(normalizedCharacterName, normalizedChatId),
  };
}

export function readCalendarRuntimeContextIdentity(): CalendarRuntimeContextIdentity {
  let characterName = '';
  let chatId = '';
  try {
    characterName = String(getCurrentCharacterName?.() || '').trim();
  } catch (error) {
    console.warn(`[${SCRIPT_NAME}] 读取当前角色名失败，运行上下文暂以空角色名处理`, error);
  }
  try {
    chatId = String(SillyTavern?.getCurrentChatId?.() || '').trim();
  } catch (error) {
    console.warn(`[${SCRIPT_NAME}] 读取当前聊天 ID 失败，运行上下文暂以空聊天 ID 处理`, error);
  }
  return createCalendarRuntimeContextIdentity(characterName, chatId);
}

export function hasCalendarRuntimeContextChanged(
  previous: CalendarRuntimeContextIdentity,
  next: CalendarRuntimeContextIdentity,
): boolean {
  return previous.key !== next.key;
}

export function watchCalendarRuntimeContext(
  onChange: (change: CalendarRuntimeContextChange) => void | Promise<void>,
): CalendarRuntimeContextWatcher {
  let current = readCalendarRuntimeContextIdentity();
  let stopped = false;

  const handleChange = (reason: CalendarRuntimeContextChangeReason): void => {
    if (stopped) {
      return;
    }
    const next = readCalendarRuntimeContextIdentity();
    if (!hasCalendarRuntimeContextChanged(current, next)) {
      return;
    }

    const previous = current;
    current = next;
    void Promise.resolve(onChange({ reason, previous, next })).catch(error => {
      console.warn(`[${SCRIPT_NAME}] 切换运行上下文失败`, error);
    });
  };

  const stops = [
    eventOn(tavern_events.CHAT_CHANGED, () => handleChange('chat_changed')).stop,
    eventOn(tavern_events.CHARACTER_PAGE_LOADED, () => handleChange('character_page_loaded')).stop,
  ];

  return {
    initial: current,
    stop: () => {
      if (stopped) {
        return;
      }
      stopped = true;
      stops.forEach(stop => stop());
    },
  };
}

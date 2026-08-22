import type { RawCalendarEvent } from './types';

type VisibilitySource = Pick<RawCalendarEvent, '显示' | '可见性'>;

export function isCalendarEventVisibleToPlayer(event: VisibilitySource): boolean {
  if (typeof event.显示 === 'boolean') {
    return event.显示;
  }
  return event.可见性 !== '仅LLM' && event.可见性 !== '完全不显示';
}

/**
 * Legacy compatibility for old projection code. New Calendar items are LLM-visible
 * regardless of player UI `显示`; `可见性` is only consulted for old saved data.
 */
export function isCalendarEventVisibleToLlm(event: VisibilitySource): boolean {
  if (event.可见性 === undefined) {
    return true;
  }
  return event.可见性 !== '仅玩家' && event.可见性 !== '完全不显示';
}

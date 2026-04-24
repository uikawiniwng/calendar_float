import { getOfficialIndexData, getOfficialReminderSectionContent } from './official-data-loader';
import type { OfficialFestivalIndexItem } from './types';

export interface FestivalReminderTextRecord {
  festival: OfficialFestivalIndexItem;
  groupId: string;
  sectionId: string;
  content: string;
  reminderDays: number;
  locationKeywords: string[];
  mentionKeywords: string[];
}

function normalizeKeywordList(values: unknown): string[] {
  if (!Array.isArray(values)) {
    return [];
  }
  return values
    .map(value => String(value || '').trim())
    .filter(Boolean)
    .filter((value, index, list) => list.indexOf(value) === index);
}

function resolveReminderDays(festival: OfficialFestivalIndexItem): number {
  const reminderDays = Number(festival.reminder?.reminder_days ?? festival.controller?.reminder_days ?? 0);
  return Number.isFinite(reminderDays) && reminderDays > 0 ? reminderDays : 0;
}

function mergeReminderKeywords(festival: OfficialFestivalIndexItem): {
  locationKeywords: string[];
  mentionKeywords: string[];
} {
  return {
    locationKeywords: normalizeKeywordList([
      ...(festival.controller?.location_keywords ?? []),
      ...(festival.reminder?.location_keywords ?? []),
    ]),
    mentionKeywords: normalizeKeywordList([
      ...(festival.controller?.mention_keywords ?? []),
      ...(festival.reminder?.mention_keywords ?? []),
    ]),
  };
}

export function listOfficialFestivalReminderTexts(): FestivalReminderTextRecord[] {
  return getOfficialIndexData()
    .festivals.filter(festival => {
      const groupId = String(festival.reminder?.group || '').trim();
      const sectionId = String(festival.reminder?.section_id || '').trim();
      return festival.reminder?.enabled !== false && Boolean(groupId) && Boolean(sectionId);
    })
    .map(festival => {
      const groupId = String(festival.reminder?.group || '').trim();
      const sectionId = String(festival.reminder?.section_id || '').trim();
      const { locationKeywords, mentionKeywords } = mergeReminderKeywords(festival);
      return {
        festival,
        groupId,
        sectionId,
        content: getOfficialReminderSectionContent(groupId, sectionId),
        reminderDays: resolveReminderDays(festival),
        locationKeywords,
        mentionKeywords,
      };
    })
    .filter(record => Boolean(record.content.trim()));
}

export function getOfficialFestivalReminderTextByFestivalId(festivalId: string): FestivalReminderTextRecord | null {
  const normalizedFestivalId = String(festivalId || '').trim();
  if (!normalizedFestivalId) {
    return null;
  }
  return listOfficialFestivalReminderTexts().find(record => record.festival.id === normalizedFestivalId) ?? null;
}

import _ from 'lodash';
import type { ActiveCalendarBuckets, RawCalendarEvent } from './types';

export function sanitizeRule(value: unknown): RawCalendarEvent['重复规则'] {
  const rule = String(value ?? '无') as RawCalendarEvent['重复规则'];
  return ['无', '每天', '每周', '每月', '每年', '仅工作日', '仅节假日'].includes(rule) ? rule : '无';
}

export function sanitizeNarrativeType(value: unknown): NonNullable<RawCalendarEvent['类型']> {
  const type = String(value ?? '').trim() as NonNullable<RawCalendarEvent['类型']>;
  return ['日程', '事件', '回忆'].includes(type) ? type : '日程';
}

export function sanitizeImportance(value: unknown): NonNullable<RawCalendarEvent['重要度']> {
  const importance = String(value ?? '').trim() as NonNullable<RawCalendarEvent['重要度']>;
  return ['普通', '重要', '纪念'].includes(importance) ? importance : '普通';
}

export function sanitizeVisibility(value: unknown): NonNullable<RawCalendarEvent['可见性']> {
  const visibility = String(value ?? '').trim() as NonNullable<RawCalendarEvent['可见性']>;
  return ['玩家与LLM', '仅玩家', '仅系统'].includes(visibility) ? visibility : '玩家与LLM';
}

export function inferDefaultPostAction(
  type: NonNullable<RawCalendarEvent['类型']>,
  importance: NonNullable<RawCalendarEvent['重要度']>,
): NonNullable<RawCalendarEvent['完成后']> {
  if (type === '回忆') {
    return '不处理';
  }
  if (importance === '纪念') {
    return '转回忆';
  }
  if (type === '日程') {
    return '自动清理';
  }
  return '归档';
}

export function sanitizePostAction(
  value: unknown,
  type: NonNullable<RawCalendarEvent['类型']>,
  importance: NonNullable<RawCalendarEvent['重要度']>,
): NonNullable<RawCalendarEvent['完成后']> {
  const action = String(value ?? '').trim() as NonNullable<RawCalendarEvent['完成后']>;
  return ['不处理', '自动清理', '归档', '转回忆'].includes(action) ? action : inferDefaultPostAction(type, importance);
}

export function sanitizeTagList(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .map(item => String(item ?? '').trim())
    .filter(Boolean)
    .filter((item, index, array) => array.indexOf(item) === index);
}

export function sanitizeRawEvent(value: unknown): RawCalendarEvent {
  const source = _.isPlainObject(value) ? (value as Record<string, unknown>) : {};
  const 类型 = sanitizeNarrativeType(source.类型);
  const 重要度 = sanitizeImportance(source.重要度);
  return {
    标题: String(source.标题 ?? '').trim(),
    内容: String(source.内容 ?? '').trim(),
    时间: String(source.时间 ?? '').trim(),
    结束时间: String(source.结束时间 ?? '').trim(),
    重复规则: sanitizeRule(source.重复规则),
    类型,
    完成后: sanitizePostAction(source.完成后, 类型, 重要度),
    重要度,
    可见性: sanitizeVisibility(source.可见性),
    标签: sanitizeTagList(source.标签),
  };
}

export function sanitizeBucketRecords(value: unknown): Record<string, RawCalendarEvent> {
  if (!_.isPlainObject(value)) {
    return {};
  }
  const source = value as Record<string, unknown>;
  return Object.fromEntries(Object.entries(source).map(([id, event]) => [id, sanitizeRawEvent(event)])) as Record<
    string,
    RawCalendarEvent
  >;
}

export function sanitizeActiveCalendarBuckets(value: unknown): ActiveCalendarBuckets {
  const source = _.isPlainObject(value) ? (value as Record<string, unknown>) : {};
  return {
    临时: sanitizeBucketRecords(source.临时),
    重复: sanitizeBucketRecords(source.重复),
  };
}

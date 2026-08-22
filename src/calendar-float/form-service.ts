import { readActiveBuckets, readArchiveStore, replaceActiveBuckets, replaceArchiveStore } from './storage';
import type { CalendarBucketType, CalendarEventRecord, CalendarVisibility, RawCalendarEvent, RepeatRule } from './types';

export interface CalendarFormSaveInput {
  /** Legacy UI field. Persistence semantics are derived only from `rule`. */
  type: CalendarBucketType;
  id: string;
  title: string;
  tags: string[];
  content: string;
  start: string;
  end: string;
  rule: string;
  visibility: CalendarVisibility;
  editingRecord: Pick<CalendarEventRecord, 'id'> | null;
}

export type CalendarFormSaveResult =
  | { ok: true }
  | { ok: false; message: string };

const ALLOWED_REPEAT_RULES: RepeatRule[] = ['无', '每天', '每周', '每月', '每年', '仅工作日'];

function normalizeRepeatRule(rule: string): RepeatRule | null {
  return ALLOWED_REPEAT_RULES.includes(rule as RepeatRule) ? (rule as RepeatRule) : null;
}

function buildRawCalendarEvent(input: CalendarFormSaveInput, repeatRule: RepeatRule): RawCalendarEvent {
  return {
    标题: input.title,
    内容: input.content,
    时间: input.start,
    结束时间: input.end,
    重复规则: repeatRule,
    可见性: input.visibility,
    标签: input.tags,
  };
}

export async function saveCalendarForm(input: CalendarFormSaveInput): Promise<CalendarFormSaveResult> {
  if (!input.id || !input.title || !input.content || !input.start) {
    return { ok: false, message: 'ID / 标题 / 内容 / 时间 不能为空' };
  }

  const repeatRule = normalizeRepeatRule(input.rule);
  if (!repeatRule) {
    return { ok: false, message: `不支持的重复规则：${input.rule}` };
  }
  const targetType: CalendarBucketType = repeatRule === '无' ? '临时' : '重复';

  const buckets = await readActiveBuckets();
  const temp = { ...buckets.临时 };
  const repeat = { ...buckets.重复 };
  const archive = readArchiveStore();
  const conflictInActive = Boolean(temp[input.id] || repeat[input.id]);
  const conflictInArchive = Boolean(archive.completed[input.id]);
  const isSameEditingId = Boolean(input.editingRecord && input.editingRecord.id === input.id);

  if ((conflictInActive || conflictInArchive) && !isSameEditingId) {
    return { ok: false, message: 'ID 已存在' };
  }

  if (input.editingRecord) {
    delete temp[input.editingRecord.id];
    delete repeat[input.editingRecord.id];
    delete archive.completed[input.editingRecord.id];
  }

  const targetBucket = targetType === '重复' ? repeat : temp;
  targetBucket[input.id] = buildRawCalendarEvent(input, repeatRule);

  replaceArchiveStore(archive);
  await replaceActiveBuckets({ 临时: temp, 重复: repeat });

  return { ok: true };
}

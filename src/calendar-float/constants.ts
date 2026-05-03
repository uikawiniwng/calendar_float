import type { CalendarTagOption, RepeatRule } from './types';

export const SCRIPT_NAME = '月历悬浮球';
export const ROOT_ID = 'th-calendar-float-root';
export const STYLE_ID = 'th-calendar-float-style';
export const INSTANCE_KEY = 'CalendarFloatWidget';

export const MVU_MESSAGE_TARGET = { type: 'message', message_id: -1 } as const;
export const MVU_ROOT_PATH = 'stat_data.事件.日历';
export const MVU_TEMP_PATH = 'stat_data.事件.日历.临时';
export const MVU_REPEAT_PATH = 'stat_data.事件.日历.重复';

export const CHAT_ARCHIVE_KEY = 'calendar_float_archive';

export const REPEAT_RULES: RepeatRule[] = ['无', '每天', '每周', '每月', '每年', '仅工作日', '仅节假日'];

export const PRESET_TAG_OPTIONS: CalendarTagOption[] = [
  { value: '主线', label: '主线', source: 'preset' },
  { value: '支线', label: '支线', source: 'preset' },
  { value: '课程', label: '课程', source: 'preset' },
  { value: '约会', label: '约会', source: 'preset' },
  { value: '节庆', label: '节庆', source: 'preset' },
  { value: '旅行', label: '旅行', source: 'preset' },
  { value: '比赛', label: '比赛', source: 'preset' },
  { value: '限时', label: '限时', source: 'preset' },
  { value: '纪念', label: '纪念', source: 'preset' },
];

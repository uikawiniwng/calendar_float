import type { CalendarTagOption, FestivalRecord, RepeatRule } from './types';

export const SCRIPT_NAME = '月历悬浮球';
export const ROOT_ID = 'th-calendar-float-root';
export const STYLE_ID = 'th-calendar-float-style';
export const INSTANCE_KEY = 'CalendarFloatWidget';

export const MVU_MESSAGE_TARGET = { type: 'message', message_id: -1 } as const;
export const MVU_ROOT_PATH = 'stat_data.事件.日历';
export const MVU_TEMP_PATH = 'stat_data.事件.日历.临时';
export const MVU_REPEAT_PATH = 'stat_data.事件.日历.重复';
export const WORLD_TIME_PATH = 'stat_data.世界.时间';

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

export const FIXED_FESTIVALS: FestivalRecord[] = [
  {
    id: 'fixed_festival_creation_day',
    title: '创生之日',
    summary: '岁首新年，纪念世界创生。',
    content: '岁首新年，纪念世界创生。',
    startText: '01-01',
    endText: '01-01',
    sourceKind: 'fixed',
    relatedBookIds: [],
    stages: [],
    metadata: { source: '单位、时间与历法' },
  },
  {
    id: 'fixed_festival_summer_solstice',
    title: '夏至祭',
    summary: '祭祀神话众神的重要盛典。',
    content: '祭祀神话众神的重要盛典。',
    startText: '05-01',
    endText: '05-01',
    sourceKind: 'fixed',
    relatedBookIds: [],
    stages: [],
    metadata: { source: '单位、时间与历法' },
  },
  {
    id: 'fixed_festival_soul_day',
    title: '慰灵日',
    summary: '悼念先人亡魂的节日。',
    content: '悼念先人亡魂的节日。',
    startText: '09-01',
    endText: '09-01',
    sourceKind: 'fixed',
    relatedBookIds: [],
    stages: [],
    metadata: { source: '单位、时间与历法' },
  },
  {
    id: 'fixed_festival_winter_solstice',
    title: '冬至夜',
    summary: '家人团聚祈福的寒冬节庆。',
    content: '家人团聚祈福的寒冬节庆。',
    startText: '12-21',
    endText: '12-21',
    sourceKind: 'fixed',
    relatedBookIds: [],
    stages: [],
    metadata: { source: '单位、时间与历法' },
  },
  {
    id: 'fixed_festival_divine_grace',
    title: '神恩日',
    summary: '岁末感谢诸神庇护。',
    content: '岁末感谢诸神庇护。',
    startText: '12-31',
    endText: '12-31',
    sourceKind: 'fixed',
    relatedBookIds: [],
    stages: [],
    metadata: { source: '单位、时间与历法' },
  },
];

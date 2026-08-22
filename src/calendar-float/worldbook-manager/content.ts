import { getActiveCalendarProfile } from '../profile';

export function buildCalendarVariableListEntryContent(): string {
  return [
    '---',
    '现有月历事件',
    '',
    '<calendar_variables_display>',
    '<%_ { _%>',
    '<%_',
    "  const rootPath = 'stat_data.事件.月历';",
    '  const rawCalendar = getvar(rootPath, { defaults: {} });',
    '  const calendar = (_.isObject(rawCalendar.临时) || _.isObject(rawCalendar.重复))',
    "    ? _.assign({}, rawCalendar.临时 || {}, _.mapValues(rawCalendar.重复 || {}, function (event) { return _.assign({}, event, { 重复规则: _.get(event, '重复规则', _.get(event, '重复规则分类', '无')) }); }))",
    '    : rawCalendar;',
    "  const isVisibleToLLM = function (event) { return !['仅玩家', '完全不显示'].includes(String(_.get(event, '可见性', '')).trim()); };",
    "  const cleanEvent = function (event) { const output = _.pick(event, ['标题', '内容', '时间', '结束时间', '重复规则', '提前提醒天数', '可见性', '类型', '标签', '关联']); if (_.get(output, '重复规则') === '无') delete output.重复规则; return _.pickBy(output, function (value) { return value !== undefined && value !== null && value !== '' && !(_.isArray(value) && value.length === 0); }); };",
    '  const displayOutput = { 事件: { 月历: _.chain(_.isObject(calendar) ? calendar : {}).pickBy(isVisibleToLLM).mapValues(cleanEvent).pickBy(function (event) { return !_.isEmpty(event); }).value() } };',
    "  print(YAML.stringify(displayOutput, { blockQuote: 'literal' }));",
    '_%>',
    '<%_ } _%>',
    '</calendar_variables_display>',
  ].join('\n');
}

export function buildCalendarUpdateRulesEntryContent(): string {
  const profile = getActiveCalendarProfile();
  const rootPath = profile.paths.eventRoot.replace(/^stat_data\./, '');
  const timeExamples = profile.worldbook.updateRuleTimeExamples.map(example => `\`${example}\``).join('、');
  return [
    '---',
    '月历变量更新规则:',
    `  ${rootPath}:`,
    '    type: |-',
    '      {',
    '        [ID: string]: {',
    '          标题: string;',
    '          内容: string; // 只写与时间安排直接相关的简短备注',
    '          时间: string;',
    '          结束时间: optional[string];',
    "          重复规则: optional['每天' | '每周' | '每月' | '每年' | '仅工作日'];",
    '          提前提醒天数: optional[number];',
    "          可见性: optional['玩家与LLM' | '完全不显示'];",
    '          标签: optional[string[]];',
    "          关联: optional[{ 类型: '任务' | '世界事件'; ID: string }];",
    '        }',
    '      }',
    '    check:',
    '      - 月历只保存“何时发生/何时提醒”的时间事实；没有明确时间锚点的数据不属于月历',
    '      - 不得在月历复制任务的状态、进展、目标、奖励、结算或执行步骤；任务存在明确时间或截止时，只保存时间，并用`关联`指向任务ID',
    '      - 不得在月历保存世界事件的阶段、条件、剧情后果、势力反应或叙事要求；世界事件存在明确未来时间时，只保存时间，并用`关联`指向世界事件ID',
    '      - 月历不得为了制造剧情而发明未来灾害、袭击、商队、异常天气或其他事件；只能记录当前剧情、世界书规则或其他系统已经确定的未来时间事实',
    '      - 新事件需生成稳定唯一ID，必须匹配`/^[a-zA-Z0-9_]+$/`；同一时间事实改期或改名时沿用原ID',
    '      - 新增前检查现有事件，避免同一时间事实重复记录',
    '      - 一次性与重复事件使用同一个collection；无`重复规则`表示一次性，有`重复规则`表示周期事件，禁止在其他路径复制第二份',
    `      - 一次性时间只能使用${timeExamples}这类绝对/日期锚点，不得写“明天”“三天后”“月底”等自由相对时间`,
    '      - 重复事件的`时间`按规则写，例如`每天`、`每周一`、`每周一、三`、`每月10日`、`每年1月10日`；不得再建立`临时/重复`子目录',
    '      - `提前提醒天数`必须为大于等于0的整数；省略按0处理',
    '      - 普通日程默认`玩家与LLM`，可省略`可见性`；LLM只能写`玩家与LLM`或`完全不显示`，不得写`仅玩家`或`仅LLM`',
    '      - 已确定但暂时不应被玩家或LLM提前知道的未来时间事实可写`完全不显示`；它必须来自已有因果或明确规则，不得由月历自行策划',
    '      - `完全不显示`只能由月历脚本在提醒时间提升为`仅LLM`；LLM不得主动写`仅LLM`',
    '      - `回忆`和`仅玩家`均由月历脚本管理；转为回忆时脚本必须原子地设置`类型: 回忆`与`可见性: 仅玩家`，LLM不得主动创建或修改回忆',
    '      - 已发生且值得玩家回看的日程可由脚本转为回忆；否则事件失去提醒价值后移除',
    `      - ${buildCalendarTagRuleText()}`,
  ].join('\n');
}

function buildCalendarTagRuleText(): string {
  const profile = getActiveCalendarProfile();
  return `标签只用于UI分类，不得承载任务状态或世界事件状态；优先复用已有短标签。当前可用标签：<%- (function () { var raw = getvar('${profile.paths.eventRoot}', { defaults: {} }); var calendar = (_.isObject(raw.临时) || _.isObject(raw.重复)) ? _.assign({}, raw.临时 || {}, raw.重复 || {}) : raw; var baseTags = ['主线', '支线', '课程', '约会', '节庆', '旅行', '比赛', '限时', '纪念']; var mirroredTags = getvar('calendar_float_store.runtime.known_tags', { defaults: [] }); var eventTags = _.flatMap(_.values(_.isObject(calendar) ? calendar : {}), function (event) { return _.isArray(_.get(event, '标签')) ? _.get(event, '标签') : []; }); var tags = _.uniq([].concat(baseTags, _.isArray(mirroredTags) ? mirroredTags : [], eventTags).map(function (tag) { return String(tag || '').trim(); }).filter(Boolean)).sort(function (left, right) { return left.localeCompare(right, 'zh-CN'); }); return tags.length ? tags.join('、') : '暂无'; }()) %>`;
}

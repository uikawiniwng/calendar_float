export function buildCalendarVariableListEntryContent(): string {
  return [
    '---',
    '<status_current_variable>',
    '{{format_message_variable::stat_data}}',
    '</status_current_variable>',
  ].join('\n');
}

export function buildCalendarUpdateRulesEntryContent(): string {
  return [
    '---',
    'calendar_variables_update_rules:',
    '    事件.日历.${临时|重复}:  // 临时优先级高于重复',
    '        type: |-',
    '        {',
    '            [ID: string]: // 必须匹配regex: `/^[a-zA-Z0-9_]+$/`',
    '            {',
    '                标题: string;',
    '                内容: string; // 客观视角，详细描述、备忘信息',
    '                时间: string; // 可填完整格式（参照`世界-时间`）、局部匹配项（如1月-1日）或模糊语义，但禁止写相对时间',
    '                结束时间: optional[string]; // 格式要求同开始时间',
    "                重复规则: '无' | '每天' | '每周' | '每月' | '每年' | '仅工作日' | '仅节假日';",
    "                类型: optional['日程' | '事件' | '回忆'];",
    "                完成后: optional['不处理' | '自动清理' | '归档' | '转回忆'];",
    "                重要度: optional['普通' | '重要' | '纪念'];",
    "                可见性: optional['玩家与LLM' | '仅玩家' | '仅系统']; // 仅‘玩家与LLM’会展示给 LLM，其余值会被脚本保留但不注入展示层",
    '                标签: optional[string[]];',
    '            }',
    '        }',
    '        check:',
    '        - 随剧情进展或对话中提到的时间节点实时更新，内容可为计划、未来事件、固定时间安排如课程等',
    '        - **ID 唯一性**：新事件需生成唯一 ID；更新现有事件必须沿用原 ID',
    '        - 标题、内容和时间的描述须匹配重复规则',
    '        - 描述中禁止出现相对时间',
    '        - 如果未指定“类型 / 完成后 / 重要度 / 可见性 / 标签”，脚本会回落到默认值',
    '        - 可见性为“仅玩家”或“仅系统”的条目可以写入变量，但不会展示给 LLM',
    '        - 需要保持适当原子化',
  ].join('\n');
}

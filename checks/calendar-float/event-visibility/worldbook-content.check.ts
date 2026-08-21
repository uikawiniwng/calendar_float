/* eslint-disable import-x/no-nodejs-modules -- These checks execute under Node.js. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import {
  buildCalendarUpdateRulesEntryContent,
  buildCalendarVariableListEntryContent,
} from '../../../src/calendar-float/worldbook-manager/content';

const display = buildCalendarVariableListEntryContent();
assert.match(display, /rawCalendar\.临时/); // legacy read compatibility
assert.match(display, /事件: \{ 月历:/);
assert.match(display, /'关联'/);
assert.match(display, /仅玩家.*完全不显示/);

const rules = buildCalendarUpdateRulesEntryContent();
const staticRules = readFileSync('src/calendar-float/mvu_rules/月历变量更新规则.txt', 'utf8');

for (const content of [rules, staticRules]) {
  assert.match(content, /月历只保存.*时间事实/);
  assert.match(content, /一次性与重复事件使用同一个collection/);
  assert.match(content, /不得再建立`临时\/重复`子目录/);
  assert.match(content, /关联: optional/);
  assert.match(content, /不得在月历复制任务的状态、进展、目标、奖励/);
  assert.match(content, /不得在月历保存世界事件的阶段、条件、剧情后果/);
  assert.match(content, /不得为了制造剧情而发明未来/);
  assert.match(content, /回忆.*仅玩家/);
  assert.match(content, /提前提醒天数: optional\[number\]/);
  assert.match(content, /LLM不得主动写`仅LLM`/);
  assert.doesNotMatch(content, /^ {2}事件\.月历\.临时:/m);
  assert.doesNotMatch(content, /^ {2}事件\.月历\.重复:/m);
  assert.doesNotMatch(content, /每次回复最多新增一个隐藏剧情事件/);
}

console.log('event-visibility/worldbook-content.check.ts OK');

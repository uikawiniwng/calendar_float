/* eslint-disable import-x/no-nodejs-modules -- These checks execute under Node.js. */
import assert from 'node:assert/strict';

import { convertToMemory } from '../../src/calendar-float/event-normalizer';

const memory = convertToMemory({
  标题: '旧约会',
  内容: '已经发生',
  时间: '复兴纪元488年-6月5日-星期三-09:00',
  重复规则: '无',
  类型: '日程',
  完成后: '转回忆',
  可见性: '玩家与LLM',
});

assert.equal(memory.类型, '回忆');
assert.equal(memory.可见性, '仅玩家');
assert.equal(memory.完成后, '归档');

console.log('memory-conversion.check.ts OK');

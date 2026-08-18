import {
  buildCalendarRuntimeContextKey,
  createCalendarRuntimeContextIdentity,
  hasCalendarRuntimeContextChanged,
} from '../../src/calendar-float/runtime-context';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function testIdentityNormalization(): void {
  const identity = createCalendarRuntimeContextIdentity('  Alice  ', '  chat-1  ');
  assert(identity.characterName === 'Alice', '角色名应该去掉首尾空白');
  assert(identity.chatId === 'chat-1', '聊天 ID 应该去掉首尾空白');
  assert(identity.key === buildCalendarRuntimeContextKey('Alice', 'chat-1'), 'context key 应该使用规范化值');
}

function testContextChangeDetection(): void {
  const base = createCalendarRuntimeContextIdentity('Alice', 'chat-1');
  const same = createCalendarRuntimeContextIdentity(' Alice ', ' chat-1 ');
  const anotherChat = createCalendarRuntimeContextIdentity('Alice', 'chat-2');
  const anotherCharacter = createCalendarRuntimeContextIdentity('Bob', 'chat-1');

  assert(!hasCalendarRuntimeContextChanged(base, same), '相同角色和聊天不应该触发 runtime 重启');
  assert(hasCalendarRuntimeContextChanged(base, anotherChat), '切换聊天应该触发 runtime 重启');
  assert(hasCalendarRuntimeContextChanged(base, anotherCharacter), '切换角色应该触发 runtime 重启');
}

function testContextKeyDoesNotUseAmbiguousStringConcatenation(): void {
  const left = buildCalendarRuntimeContextKey('Alice\nchat', '1');
  const right = buildCalendarRuntimeContextKey('Alice', 'chat\n1');
  assert(left !== right, 'context key 不应该因为换行拼接产生碰撞');
}

function main(): void {
  testIdentityNormalization();
  testContextChangeDetection();
  testContextKeyDoesNotUseAmbiguousStringConcatenation();
  console.log('runtime-context.check.ts OK');
}

main();

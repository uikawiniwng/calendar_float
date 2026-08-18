import {
  buildCalendarRuntimeContextKey,
  createCalendarRuntimeContextIdentity,
  hasCalendarRuntimeContextChanged,
  watchCalendarRuntimeContext,
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

function testWatcherTracksChangesAndStaysSingleton(): void {
  let characterName = 'Alice';
  let chatId = 'chat-1';
  const handlers = new Map<string, Set<() => void>>();
  const chatChangedEvent = 'test-chat-changed';
  const characterLoadedEvent = 'test-character-loaded';

  (globalThis as any).getCurrentCharacterName = () => characterName;
  (globalThis as any).SillyTavern = {
    getCurrentChatId: () => chatId,
  };
  (globalThis as any).tavern_events = {
    CHAT_CHANGED: chatChangedEvent,
    CHARACTER_PAGE_LOADED: characterLoadedEvent,
  };
  (globalThis as any).eventOn = (event: string, handler: () => void) => {
    const eventHandlers = handlers.get(event) ?? new Set<() => void>();
    eventHandlers.add(handler);
    handlers.set(event, eventHandlers);
    return {
      stop: () => {
        eventHandlers.delete(handler);
      },
    };
  };

  const emit = (event: string): void => {
    [...(handlers.get(event) ?? [])].forEach(handler => handler());
  };
  const handlerCount = (): number => [...handlers.values()].reduce((total, values) => total + values.size, 0);

  const firstChanges: string[] = [];
  const first = watchCalendarRuntimeContext(change => {
    firstChanges.push(`${change.previous.key}->${change.next.key}`);
  });
  assert(first.initial.characterName === 'Alice' && first.initial.chatId === 'chat-1', 'watcher 应捕获初始 context');
  assert(handlerCount() === 2, 'watcher 应只绑定两个 context 事件');

  chatId = 'chat-2';
  emit(chatChangedEvent);
  assert(firstChanges.length === 1, '聊天变化应该触发一次 context change');
  emit(chatChangedEvent);
  assert(firstChanges.length === 1, '相同 context 的重复事件不应该重复触发');

  const secondChanges: string[] = [];
  const second = watchCalendarRuntimeContext(change => {
    secondChanges.push(`${change.previous.key}->${change.next.key}`);
  });
  assert(handlerCount() === 2, '新 watcher 应先停止旧 watcher，避免重复绑定');

  characterName = 'Bob';
  emit(characterLoadedEvent);
  assert(firstChanges.length === 1, '旧 watcher 被替换后不应该继续收到事件');
  assert(secondChanges.length === 1, '新 watcher 应收到角色切换事件');

  second.stop();
  assert(handlerCount() === 0, 'watcher stop 应移除所有事件监听');
  assert(globalThis.CalendarFloatRuntimeContextWatcher === undefined, '停止 singleton watcher 后应清理 global 引用');
}

function main(): void {
  testIdentityNormalization();
  testContextChangeDetection();
  testContextKeyDoesNotUseAmbiguousStringConcatenation();
  testWatcherTracksChangesAndStaysSingleton();
  console.log('runtime-context.check.ts OK');
}

main();

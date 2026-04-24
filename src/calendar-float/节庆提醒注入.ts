import { SCRIPT_NAME } from './constants';
import { matchFestivalRemindersForCurrentDate } from './节庆提醒匹配';

const REMINDER_PROMPT_ID = 'calendar_float_festival_reminder';
let lastInjectedContent = '';
let generationHookBound = false;
let chatChangedHookBound = false;

function buildReminderPromptContent(): string {
  const reminders = matchFestivalRemindersForCurrentDate();
  if (!reminders.length) {
    return '';
  }

  return reminders
    .map(reminder => {
      const statusLine = reminder.isActive
        ? `【进行中】${reminder.title}（${reminder.startText}${reminder.endText !== reminder.startText ? ` ~ ${reminder.endText}` : ''}）`
        : `【即将开始】${reminder.title}（还有 ${reminder.distanceToStart} 天，开始于 ${reminder.startText}）`;
      return [statusLine, reminder.content].filter(Boolean).join('\n');
    })
    .join('\n\n');
}

async function applyFestivalReminderPrompt(): Promise<void> {
  const reminders = matchFestivalRemindersForCurrentDate();
  if (!reminders.length) {
    if (lastInjectedContent) {
      await SillyTavern.setExtensionPrompt(REMINDER_PROMPT_ID, '', -1, 0, false, 0);
      lastInjectedContent = '';
    }
    return;
  }

  const primary = reminders[0];
  const content = buildReminderPromptContent();
  if (!content && lastInjectedContent) {
    await SillyTavern.setExtensionPrompt(REMINDER_PROMPT_ID, '', -1, 0, false, 0);
    lastInjectedContent = '';
    return;
  }

  if (content === lastInjectedContent) {
    return;
  }

  await SillyTavern.setExtensionPrompt(
    REMINDER_PROMPT_ID,
    content,
    1,
    primary.injectDepth,
    false,
    0,
    () => matchFestivalRemindersForCurrentDate().length > 0,
  );
  lastInjectedContent = content;
}

function bindGenerationHook(): void {
  if (generationHookBound) {
    return;
  }
  generationHookBound = true;
  eventOn(tavern_events.GENERATION_AFTER_COMMANDS, () => {
    void applyFestivalReminderPrompt().catch(error => {
      console.warn(`[${SCRIPT_NAME}] 节庆提醒注入失败`, error);
    });
  });
}

function bindChatChangedHook(): void {
  if (chatChangedHookBound) {
    return;
  }
  chatChangedHookBound = true;
  eventOn(tavern_events.CHAT_CHANGED, () => {
    void applyFestivalReminderPrompt().catch(error => {
      console.warn(`[${SCRIPT_NAME}] 切换聊天后刷新节庆提醒失败`, error);
    });
  });
}

export function bootstrapFestivalReminderInjection(): void {
  bindGenerationHook();
  bindChatChangedHook();
  void applyFestivalReminderPrompt().catch(error => {
    console.warn(`[${SCRIPT_NAME}] 初始化节庆提醒注入失败`, error);
  });
}

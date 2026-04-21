import { SCRIPT_NAME } from './constants';
import {
  ensureCalendarManagedWorldbookEntries,
  installCalendarManagedWorldbookEntries,
  uninstallCalendarManagedWorldbookEntries,
} from './managed-worldbook';
import { bootstrapCalendarWidget } from './widget';

function init(): void {
  console.info(`[${SCRIPT_NAME}] 开始初始化`);
  void ensureCalendarManagedWorldbookEntries().catch(error => {
    console.warn(`[${SCRIPT_NAME}] 初始化托管 worldbook 条目失败`, error);
  });
  bootstrapCalendarWidget();

  Object.assign(globalThis, {
    CalendarFloatInstallManagedWorldbookEntries: async () => installCalendarManagedWorldbookEntries(),
    CalendarFloatUninstallManagedWorldbookEntries: async () => uninstallCalendarManagedWorldbookEntries(),
  });
}

function cleanup(): void {
  console.info(`[${SCRIPT_NAME}] 开始卸载`);
  window.CalendarFloatWidget?.destroy('pagehide');
}

$(() => {
  errorCatched(init)();
});

$(window).on('pagehide', () => {
  cleanup();
});

declare global {
  var CalendarFloatInstallManagedWorldbookEntries:
    | (() => Promise<import('./managed-worldbook').EnsureCalendarManagedWorldbookEntriesResult>)
    | undefined;
  var CalendarFloatUninstallManagedWorldbookEntries:
    | (() => Promise<{
        worldbookName: string;
        removedCount: number;
      }>)
    | undefined;

  interface Window {
    CalendarFloatWidget?: {
      destroy: (reason?: string) => void;
      open: () => void;
      close: () => void;
      reload: () => Promise<void> | void;
    };
  }
}

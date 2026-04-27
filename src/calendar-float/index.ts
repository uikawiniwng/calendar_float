import { SCRIPT_NAME } from './constants';
import {
  bootstrapCalendarRuntimeWorldbookScanner,
  teardownCalendarRuntimeWorldbookScanner,
} from './runtime-worldbook-scanner';
import { bootstrapCalendarWidget } from './widget';
import {
  ensureCalendarManagedWorldbookEntries,
  installCalendarManagedEntriesToExternalWorldbook,
  installCalendarManagedWorldbookEntries,
  uninstallCalendarManagedWorldbookEntries,
} from './worldbook-backend-manager';

function init(): void {
  console.info(`[${SCRIPT_NAME}] 开始初始化`);
  void ensureCalendarManagedWorldbookEntries().catch(error => {
    console.warn(`[${SCRIPT_NAME}] 初始化托管 worldbook 条目失败`, error);
  });
  bootstrapCalendarRuntimeWorldbookScanner();
  bootstrapCalendarWidget();

  Object.assign(globalThis, {
    CalendarFloatInstallManagedWorldbookEntries: async () => installCalendarManagedWorldbookEntries(),
    CalendarFloatInstallManagedEntriesToWorldbook: async (name: string) =>
      installCalendarManagedEntriesToExternalWorldbook(name),
    CalendarFloatUninstallManagedWorldbookEntries: async () => uninstallCalendarManagedWorldbookEntries(),
  });
}

function cleanup(): void {
  console.info(`[${SCRIPT_NAME}] 开始卸载`);
  teardownCalendarRuntimeWorldbookScanner();
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
    | (() => Promise<import('./worldbook-backend-manager').EnsureCalendarManagedWorldbookEntriesResult>)
    | undefined;
  var CalendarFloatInstallManagedEntriesToWorldbook:
    | ((name: string) => Promise<import('./worldbook-backend-manager').EnsureCalendarManagedWorldbookEntriesResult>)
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

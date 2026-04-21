import type { WidgetRefs } from './types';

type SidebarTab = 'detail' | 'form';
type AgendaSortMode = 'date-asc' | 'date-desc' | 'title-asc';
type CalendarBucketType = '临时' | '重复';

export interface BindCalendarWidgetEventsOptions {
  refs: WidgetRefs;
  hostDocument: Document;
  hostWindow: Window & typeof globalThis;
  onToggleBall: () => void;
  onClosePanel: () => void;
  onReload: () => void | Promise<void>;
  onToggleTheme: () => void;
  onManagedWorldbookClick: () => void | Promise<void>;
  onSwitchTab: (tab: SidebarTab) => void;
  onOpenCreateForm: () => void;
  onCloseMobileSide: () => void;
  onCancelForm: () => void;
  onFillNowTime: () => void | Promise<void>;
  onSaveForm: () => void | Promise<void>;
  onPickDay: (dateKey: string) => void;
  onMonthPrev: () => void;
  onMonthNext: () => void;
  onMonthToday: () => void;
  onOpenBook: (bookId: string) => void;
  onOpenBookPage: (pageIndex: number) => void;
  onBookPrevPage: () => void;
  onBookNextPage: () => void;
  onCloseBookReader: () => void;
  onEditEvent: (eventId: string) => void;
  onCompleteEvent: (eventId: string, eventType: CalendarBucketType) => void | Promise<void>;
  onDeleteEvent: (eventId: string) => void | Promise<void>;
  onRestoreEvent: (eventId: string) => void | Promise<void>;
  onPurgeEvent: (eventId: string) => void | Promise<void>;
  onAgendaFilterInput: (keyword: string) => void;
  onAgendaToggleArchived: (checked: boolean) => void;
  onAgendaSortChange: (sort: AgendaSortMode) => void;
  onOpenAgendaItemDate: (dateKey: string) => void;
  onPanelDragStart: (event: MouseEvent) => void;
  onPanelDragMove: (event: MouseEvent) => void;
  onPanelDragEnd: () => void;
  onWindowResize: () => void;
}

function parseSidebarTab(value: string): SidebarTab {
  return value === 'form' ? 'form' : 'detail';
}

function parseAgendaSort(value: string): AgendaSortMode {
  return value === 'date-desc' || value === 'title-asc' ? value : 'date-asc';
}

function parseCalendarBucketType(value: string): CalendarBucketType {
  return value === '重复' ? '重复' : '临时';
}

export function bindCalendarWidgetEvents(options: BindCalendarWidgetEventsOptions): void {
  const { refs, hostDocument, hostWindow } = options;
  if (!refs.root || !refs.ball) {
    return;
  }

  $(refs.ball).off('.calendar-float');
  $(refs.root).off('.calendar-float');
  $(hostDocument).off('.calendar-float-panel-drag');
  $(hostWindow).off('.calendar-float-window');

  $(refs.ball).on('click.calendar-float', () => {
    options.onToggleBall();
  });

  $(refs.root).on('click.calendar-float', '[data-action="close"]', () => {
    options.onClosePanel();
  });

  $(refs.root).on('click.calendar-float', '[data-action="reload"]', () => {
    void options.onReload();
  });

  $(refs.root).on('click.calendar-float', '[data-action="toggle-theme"]', () => {
    options.onToggleTheme();
  });

  $(refs.root).on('click.calendar-float', '[data-action="managed-worldbook-connectivity"]', () => {
    void options.onManagedWorldbookClick();
  });

  $(refs.root).on('click.calendar-float', '[data-action="switch-tab"]', event => {
    const tab = parseSidebarTab(String((event.currentTarget as HTMLElement).getAttribute('data-tab') || 'detail'));
    options.onSwitchTab(tab);
  });

  $(refs.root).on('click.calendar-float', '[data-action="open-create-form"]', () => {
    options.onOpenCreateForm();
  });

  $(refs.root).on('click.calendar-float', '[data-action="close-mobile-side"]', () => {
    options.onCloseMobileSide();
  });

  $(refs.root).on('click.calendar-float', '[data-action="cancel-form"]', () => {
    options.onCancelForm();
  });

  $(refs.root).on('click.calendar-float', '[data-action="fill-now-time"]', () => {
    void options.onFillNowTime();
  });

  $(refs.root).on('click.calendar-float', '[data-action="save-form"]', () => {
    void options.onSaveForm();
  });

  $(refs.root).on('click.calendar-float', '[data-action="pick-day"]', event => {
    const dateKey = String((event.currentTarget as HTMLElement).getAttribute('data-date-key') || '');
    if (!dateKey) {
      return;
    }
    options.onPickDay(dateKey);
  });

  $(refs.root).on('click.calendar-float', '[data-action="month-prev"]', () => {
    options.onMonthPrev();
  });

  $(refs.root).on('click.calendar-float', '[data-action="month-next"]', () => {
    options.onMonthNext();
  });

  $(refs.root).on('click.calendar-float', '[data-action="month-today"]', () => {
    options.onMonthToday();
  });

  $(refs.root).on('click.calendar-float', '[data-action="open-book"]', event => {
    const bookId = String((event.currentTarget as HTMLElement).getAttribute('data-book-id') || '');
    if (!bookId) {
      return;
    }
    options.onOpenBook(bookId);
  });

  $(refs.root).on('click.calendar-float', '[data-action="open-book-page"]', event => {
    const pageIndex = Number((event.currentTarget as HTMLElement).getAttribute('data-page-index') || '0');
    options.onOpenBookPage(Number.isFinite(pageIndex) ? pageIndex : 0);
  });

  $(refs.root).on('click.calendar-float', '[data-action="book-prev-page"]', () => {
    options.onBookPrevPage();
  });

  $(refs.root).on('click.calendar-float', '[data-action="book-next-page"]', () => {
    options.onBookNextPage();
  });

  $(refs.root).on('click.calendar-float', '[data-action="close-book-reader"]', () => {
    options.onCloseBookReader();
  });

  $(refs.root).on('click.calendar-float', '[data-action="edit-event"]', event => {
    const eventId = String((event.currentTarget as HTMLElement).getAttribute('data-event-id') || '');
    if (!eventId) {
      return;
    }
    options.onEditEvent(eventId);
  });

  $(refs.root).on('click.calendar-float', '[data-action="complete-event"]', event => {
    const eventId = String((event.currentTarget as HTMLElement).getAttribute('data-event-id') || '');
    if (!eventId) {
      return;
    }
    const eventType = parseCalendarBucketType(
      String((event.currentTarget as HTMLElement).getAttribute('data-event-type') || '临时'),
    );
    void options.onCompleteEvent(eventId, eventType);
  });

  $(refs.root).on('click.calendar-float', '[data-action="delete-event"]', event => {
    const eventId = String((event.currentTarget as HTMLElement).getAttribute('data-event-id') || '');
    if (!eventId) {
      return;
    }
    void options.onDeleteEvent(eventId);
  });

  $(refs.root).on('click.calendar-float', '[data-action="restore-event"]', event => {
    const eventId = String((event.currentTarget as HTMLElement).getAttribute('data-event-id') || '');
    if (!eventId) {
      return;
    }
    void options.onRestoreEvent(eventId);
  });

  $(refs.root).on('click.calendar-float', '[data-action="purge-event"]', event => {
    const eventId = String((event.currentTarget as HTMLElement).getAttribute('data-event-id') || '');
    if (!eventId) {
      return;
    }
    void options.onPurgeEvent(eventId);
  });

  $(refs.root).on('input.calendar-float', '[data-action="agenda-filter-input"]', event => {
    options.onAgendaFilterInput(String((event.currentTarget as HTMLInputElement).value || ''));
  });

  $(refs.root).on('change.calendar-float', '[data-action="agenda-toggle-archived"]', event => {
    options.onAgendaToggleArchived(Boolean((event.currentTarget as HTMLInputElement).checked));
  });

  $(refs.root).on('change.calendar-float', '[data-action="agenda-sort-select"]', event => {
    options.onAgendaSortChange(parseAgendaSort(String((event.currentTarget as HTMLSelectElement).value || 'date-asc')));
  });

  $(refs.root).on('click.calendar-float', '[data-action="open-agenda-item-date"]', event => {
    const target = event.target as HTMLElement | null;
    if (
      target?.closest(
        '[data-action="edit-event"], [data-action="complete-event"], [data-action="delete-event"], [data-action="restore-event"], [data-action="purge-event"], [data-action="open-book"], [data-action="open-book-page"], [data-action="book-prev-page"], [data-action="book-next-page"], [data-action="close-book-reader"]',
      )
    ) {
      return;
    }
    const dateKey = String((event.currentTarget as HTMLElement).getAttribute('data-date-key') || '');
    if (!dateKey) {
      return;
    }
    options.onOpenAgendaItemDate(dateKey);
  });

  $(refs.root).on('mousedown.calendar-float', '[data-drag-handle="panel"]', event => {
    options.onPanelDragStart(event as unknown as MouseEvent);
  });

  $(hostDocument).on('mousemove.calendar-float-panel-drag', event => {
    options.onPanelDragMove(event as unknown as MouseEvent);
  });

  $(hostDocument).on('mouseup.calendar-float-panel-drag', () => {
    options.onPanelDragEnd();
  });

  $(hostWindow).on('resize.calendar-float-window', () => {
    options.onWindowResize();
  });
}

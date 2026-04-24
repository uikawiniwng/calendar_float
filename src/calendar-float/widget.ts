import { clamp } from 'lodash';
import { INSTANCE_KEY, ROOT_ID, SCRIPT_NAME, STYLE_ID } from './constants';
import { formatDateKey } from './date';
import { saveCalendarForm } from './form-service';
import {
  getCalendarManagedWorldbookDiagnostics,
  installCalendarManagedEntriesToExternalWorldbook,
  installCalendarManagedWorldbookEntries,
  uninstallCalendarManagedWorldbookEntries,
  type CalendarManagedWorldbookDiagnostics,
} from './managed-worldbook';
import { buildDailyAgenda, buildMonthCells, buildReminderState, loadCalendarDataset } from './model';
import { buildSelectedDayDetail, fallbackDateLabel, renderFormHtml } from './render';
import {
  archiveCompletedEvent,
  ensureMvuReady,
  getAvailableCalendarWorldbooks,
  readActiveBuckets,
  readArchiveStore,
  readCurrentWorldTime,
  replaceActiveBuckets,
  replaceArchiveStore,
  restoreArchivedEvent,
  syncArchiveOnActiveRemoval,
} from './storage';
import type {
  DailyAgendaGroup,
  DailyAgendaItem,
  DatePoint,
  MonthDayCell,
  ReminderState,
  WidgetRefs,
  WidgetState,
} from './types';
import { bindCalendarWidgetEvents } from './widget-events';
import { getViewportSize, isDesktopViewport } from './widget-layout';
import {
  renderAgendaPanel as renderAgendaPanelExternal,
  renderBookMainView as renderBookMainViewExternal,
  renderCalendarMonthView,
  renderDetailPanel as renderDetailPanelExternal,
} from './widget-render';
import { ensureCalendarWidgetStyle } from './widget-style';

const hostWindow =
  window.parent && window.parent !== window && window.parent.document
    ? (window.parent as Window & typeof globalThis)
    : window;
const hostDocument = hostWindow.document;
const renderMarkdownApi = (() => {
  const maybeApi = (hostWindow as unknown as { renderMarkdown?: unknown }).renderMarkdown;
  return typeof maybeApi === 'function' ? (maybeApi as (input: string) => string) : null;
})();
const showdownConverterCtor = (() => {
  const maybeShowdown = (
    hostWindow as unknown as {
      showdown?: {
        Converter?: new (options?: Record<string, unknown>) => { makeHtml(input: string): string };
      };
    }
  ).showdown;
  return maybeShowdown?.Converter ?? null;
})();
const markdownConverter = showdownConverterCtor
  ? new showdownConverterCtor({
      simpleLineBreaks: true,
      strikethrough: true,
      tables: true,
      ghCompatibleHeaderId: true,
      openLinksInNewWindow: true,
    })
  : null;

type SidebarTab = 'detail' | 'form';
type ManagedWorldbookDialogMode = 'menu' | 'confirm-uninstall' | 'confirm-reinstall';

const refs: WidgetRefs = {
  root: null,
  ball: null,
  panel: null,
  monthGrid: null,
  agendaList: null,
  detailPanel: null,
  formPanel: null,
  sourcePanel: null,
};

const state: WidgetState = {
  open: false,
  destroyed: false,
  currentMonth: getTodayPoint(),
  selectedDateKey: '',
  reminder: createEmptyReminder(),
  dataset: null,
  filterKeyword: '',
  showArchived: true,
  formMode: 'create',
  editingEventId: null,
};

const uiState = {
  sidebarTab: 'detail' as SidebarTab,
  panelLeft: null as number | null,
  panelTop: null as number | null,
  dragging: false,
  dragStartX: 0,
  dragStartY: 0,
  dragOriginLeft: 0,
  dragOriginTop: 0,
  openedBookId: null as string | null,
  openedBookPageIndex: 0,
  theme: 'light' as 'light' | 'dark',
  agendaSort: 'date-asc' as 'date-asc' | 'date-desc' | 'title-asc',
  mobileSideOpen: false,
  managedWorldbookBusy: false,
  managedWorldbookDialogOpen: false,
  managedWorldbookDialogMode: null as ManagedWorldbookDialogMode | null,
  managedWorldbookDialogDiagnostics: null as CalendarManagedWorldbookDiagnostics | null,
};

function getTodayPoint(): DatePoint {
  const now = new Date();
  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate(),
  };
}

function createEmptyReminder(): ReminderState {
  return {
    hasUpcoming: false,
    maxLevel: 'none',
    reasons: [],
  };
}

function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderMarkdownContent(markdown: string): string {
  const text = String(markdown || '').trim();
  if (!text) {
    return '<p>（暂无内容）</p>';
  }

  if (markdownConverter) {
    try {
      return markdownConverter.makeHtml(text);
    } catch (error) {
      console.warn(`[${SCRIPT_NAME}] showdown Markdown 渲染失败`, error);
    }
  }

  if (renderMarkdownApi) {
    try {
      const rendered = renderMarkdownApi(text);
      const hasHtmlStructure = /<\s*(h\d|p|ul|ol|li|blockquote|pre|code|hr|table|em|strong|a)\b/i.test(rendered);
      if (hasHtmlStructure) {
        return rendered;
      }
    } catch (error) {
      console.warn(`[${SCRIPT_NAME}] 宿主 Markdown 渲染失败`, error);
    }
  }

  return `<p>${escapeHtml(text).replace(/\n/g, '<br>')}</p>`;
}

function isDesktopMode(): boolean {
  return isDesktopViewport(hostWindow);
}

function getThemeStorageKey(): string {
  return `${SCRIPT_NAME}:theme`;
}

function getPreferredTheme(): 'light' | 'dark' {
  try {
    if (hostWindow.matchMedia && hostWindow.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
  } catch (error) {
    console.warn(`[${SCRIPT_NAME}] 读取系统主题失败`, error);
  }
  return 'light';
}

function applyTheme(): void {
  if (!refs.root) {
    return;
  }
  refs.root.dataset.theme = uiState.theme;
  const toggle = refs.root.querySelector<HTMLButtonElement>('[data-action="toggle-theme"]');
  if (toggle) {
    const nextTitle = uiState.theme === 'dark' ? '切换到白天主题' : '切换到夜晚主题';
    toggle.textContent = uiState.theme === 'dark' ? '☀' : '☾';
    toggle.title = nextTitle;
    toggle.setAttribute('aria-label', nextTitle);
  }
}

function loadTheme(): void {
  let nextTheme = getPreferredTheme();
  try {
    const saved = hostWindow.localStorage?.getItem(getThemeStorageKey());
    if (saved === 'light' || saved === 'dark') {
      nextTheme = saved;
    }
  } catch (error) {
    console.warn(`[${SCRIPT_NAME}] 读取主题存档失败`, error);
  }
  uiState.theme = nextTheme;
  applyTheme();
}

function saveTheme(): void {
  try {
    hostWindow.localStorage?.setItem(getThemeStorageKey(), uiState.theme);
  } catch (error) {
    console.warn(`[${SCRIPT_NAME}] 保存主题存档失败`, error);
  }
}

function toggleTheme(): void {
  uiState.theme = uiState.theme === 'light' ? 'dark' : 'light';
  applyTheme();
  saveTheme();
}

function ensureStyle(): void {
  ensureCalendarWidgetStyle(hostDocument);
}

function ensureRoot(): void {
  if (refs.root) {
    return;
  }

  const root = hostDocument.createElement('div');
  root.id = ROOT_ID;
  root.setAttribute('script_id', getScriptId());
  root.dataset.open = 'false';
  root.dataset.hasUpcoming = 'false';
  root.dataset.tab = uiState.sidebarTab;
  root.dataset.theme = uiState.theme;
  root.dataset.mobileSideOpen = 'false';
  root.dataset.managedWorldbookConnectivity = 'unknown';
  root.innerHTML = `
    <button type="button" class="th-calendar-ball" aria-label="打开月历">📅</button>
    <section class="th-calendar-panel" aria-label="月历悬浮面板">
      <div class="th-calendar-shell">
        <section class="th-calendar-main">
          <div class="th-main-head" data-drag-handle="panel">
            <div class="th-main-head-copy">
              <div class="th-main-title">月历悬浮球</div>
              <button type="button" class="th-connectivity-button" data-action="managed-worldbook-connectivity" data-state="unknown" aria-label="托管 worldbook backend 条目状态按钮">
                <span class="th-connectivity-dot"></span>
                <span class="th-connectivity-text">WB Backend: 检查中</span>
              </button>
            </div>
            <div class="th-window-actions">
              <button type="button" class="th-btn" data-action="toggle-theme" title="切换到夜晚主题" aria-label="切换到夜晚主题">☾</button>
              <button type="button" class="th-btn" data-action="reload" title="刷新">↻</button>
              <button type="button" class="th-btn" data-action="close" title="关闭">✕</button>
            </div>
          </div>
          <div data-role="month-grid"></div>
        </section>
        <aside class="th-calendar-side">
          <div class="th-side-head">
            <div class="th-side-head-copy">
              <div class="th-side-title">本月事件</div>
            </div>
            <button type="button" class="th-btn th-mobile-side-close" data-action="close-mobile-side" aria-label="收起下方面板">⌄</button>
          </div>
          <div class="th-sidebar-tabs">
            <button type="button" class="th-tab-button" data-action="switch-tab" data-tab="detail">日期详情</button>
            <button type="button" class="th-tab-button th-primary-btn th-tab-add-button" data-action="open-create-form" data-role="sidebar-create-entry" aria-label="新增事件" title="新增事件">+</button>
          </div>
          <div class="th-side-body">
            <div class="th-side-panel is-detail" data-role="detail-panel"></div>
            <div class="th-side-panel is-form" data-role="form-panel"></div>
          </div>
        </aside>
        <button type="button" class="th-btn th-fab-add" data-action="open-create-form" aria-label="新增事件">+</button>
      </div>
    </section>
    <div class="th-managed-worldbook-dialog-layer" data-role="managed-worldbook-dialog-layer" aria-hidden="true"></div>
  `;

  hostDocument.body.appendChild(root);

  refs.root = root;
  refs.ball = root.querySelector<HTMLButtonElement>('.th-calendar-ball');
  refs.panel = root.querySelector<HTMLElement>('.th-calendar-panel');
  refs.monthGrid = root.querySelector<HTMLElement>('[data-role="month-grid"]');
  refs.agendaList = null;
  refs.detailPanel = root.querySelector<HTMLElement>('[data-role="detail-panel"]');
  refs.formPanel = root.querySelector<HTMLElement>('[data-role="form-panel"]');
}

function getEditingRecord() {
  if (!state.dataset || !state.editingEventId) {
    return null;
  }
  return (
    [...state.dataset.activeEvents, ...state.dataset.archivedEvents].find(item => item.id === state.editingEventId) ??
    null
  );
}

function buildFormEditingNotice(): string {
  return '';
}

function syncStateAnchors(): void {
  if (state.dataset?.nowDate) {
    state.currentMonth = {
      year: state.dataset.nowDate.year,
      month: state.dataset.nowDate.month,
      day: 1,
    };
  }
}

function applyPanelPosition(): void {
  if (!refs.panel || !isDesktopMode()) {
    return;
  }
  refs.panel.style.left = `${uiState.panelLeft}px`;
  refs.panel.style.top = `${uiState.panelTop}px`;
}

function buildManagedWorldbookSummaryLines(diagnostics: CalendarManagedWorldbookDiagnostics): string[] {
  return [
    `主 Worldbook: ${diagnostics.worldbookName || '（未绑定主 worldbook）'}`,
    `状态: ${diagnostics.connectivity}`,
    `管理开关: ${diagnostics.managementEnabled ? '启用' : '已关闭'}`,
    `Backend 条目总数: ${diagnostics.managedEntryCount}/${diagnostics.expectedManagedEntryCount}`,
    `manifest: ${diagnostics.hasMetaEntry ? '是' : '否'}`,
    `变量列表: ${diagnostics.hasVariableListEntry ? '是' : '否'}`,
    `mvu_update: ${diagnostics.hasUpdateRulesEntry ? '是' : '否'}`,
    `controller: ${diagnostics.controllerEntryCount}/${diagnostics.expectedControllerEntryCount}`,
    `event: ${diagnostics.festivalEntryCount}/${diagnostics.expectedFestivalEntryCount}`,
    `book: ${diagnostics.bookEntryCount}/${diagnostics.expectedBookEntryCount}`,
    `条目完整: ${diagnostics.allManagedEntriesPresent ? '是' : '否'}`,
    diagnostics.lastError ? `最近错误: ${diagnostics.lastError}` : '最近错误: 无',
  ];
}

/**
 * UI 只展示“角色主 worldbook backend 条目状态”，不宣称实际生成插入链路已验证通过。
 * 这样后续维护者不会误把 diagnostics 当成真实生成结果。
 */
function getConnectivityButtonCopy(diagnostics: CalendarManagedWorldbookDiagnostics): {
  text: string;
  title: string;
} {
  const installedText = `${diagnostics.managedEntryCount}/${diagnostics.expectedManagedEntryCount}`;
  switch (diagnostics.connectivity) {
    case 'ready':
      return {
        text: `WB Backend: 已安装 ${installedText}`,
        title: `worldbook backend 条目已安装到角色主 worldbook；当前 ${installedText}，点击打开操作菜单`,
      };
    case 'recreated':
      return {
        text: `WB Backend: 已重建 ${installedText}`,
        title: `worldbook backend 条目已重新写入角色主 worldbook；当前 ${installedText}，点击打开操作菜单`,
      };
    case 'missing': {
      const verb = uiState.managedWorldbookBusy ? '处理中…' : '点击导入';
      if (!diagnostics.managementEnabled) {
        return {
          text: uiState.managedWorldbookBusy ? 'WB Backend: 重新安装中…' : `WB Backend: 已卸载 ${installedText}`,
          title: uiState.managedWorldbookBusy
            ? '正在重新安装 worldbook backend 条目到角色主 worldbook'
            : `worldbook backend 条目已卸载或管理开关关闭；当前 ${installedText}，点击打开操作菜单`,
        };
      }
      return {
        text: `WB Backend: 缺失 ${installedText}，${verb}`,
        title: uiState.managedWorldbookBusy
          ? '正在补齐角色主 worldbook 中的 backend 条目'
          : `角色主 worldbook 中 backend 条目不完整；当前 ${installedText}，点击打开操作菜单`,
      };
    }
    case 'checking':
      return {
        text: 'WB Backend: 检查中',
        title: '脚本正在检查角色主 worldbook 中的 backend 条目状态',
      };
    case 'error':
      return {
        text: uiState.managedWorldbookBusy ? 'WB Backend: 重试中…' : `WB Backend: 错误 ${installedText}`,
        title: uiState.managedWorldbookBusy
          ? '正在尝试重建角色主 worldbook 中的 backend 条目'
          : `脚本读取角色主 worldbook 失败；当前 ${installedText}，点击打开操作菜单`,
      };
    default:
      return {
        text: 'WB Backend: 未检查',
        title: '尚未检查角色主 worldbook 的 backend 条目状态',
      };
  }
}

function updateManagedWorldbookButton(): void {
  if (!refs.root) {
    return;
  }
  const diagnostics = getCalendarManagedWorldbookDiagnostics();
  const button = refs.root.querySelector<HTMLButtonElement>('[data-action="managed-worldbook-connectivity"]');
  refs.root.dataset.managedWorldbookConnectivity = diagnostics.connectivity;
  if (!button) {
    return;
  }
  const copy = getConnectivityButtonCopy(diagnostics);
  button.dataset.state = diagnostics.connectivity;
  button.disabled = uiState.managedWorldbookBusy || diagnostics.connectivity === 'checking';
  button.title = copy.title;
  button.setAttribute('aria-label', copy.title);
  const textNode = button.querySelector<HTMLElement>('.th-connectivity-text');
  if (textNode) {
    textNode.textContent = copy.text;
  }
}

function openManagedWorldbookDialog(
  mode: ManagedWorldbookDialogMode,
  diagnostics = getCalendarManagedWorldbookDiagnostics(),
): void {
  uiState.managedWorldbookDialogOpen = true;
  uiState.managedWorldbookDialogMode = mode;
  uiState.managedWorldbookDialogDiagnostics = diagnostics;
  renderShell();
}

function closeManagedWorldbookDialog(): void {
  uiState.managedWorldbookDialogOpen = false;
  uiState.managedWorldbookDialogMode = null;
  uiState.managedWorldbookDialogDiagnostics = null;
  renderShell();
}

function renderManagedWorldbookDialog(): void {
  if (!refs.root) {
    return;
  }

  const layer = refs.root.querySelector<HTMLElement>('[data-role="managed-worldbook-dialog-layer"]');
  if (!layer) {
    return;
  }

  if (!uiState.managedWorldbookDialogOpen || !uiState.managedWorldbookDialogMode) {
    layer.dataset.open = 'false';
    layer.setAttribute('aria-hidden', 'true');
    layer.innerHTML = '';
    return;
  }

  const diagnostics = uiState.managedWorldbookDialogDiagnostics ?? getCalendarManagedWorldbookDiagnostics();
  const summaryHtml = buildManagedWorldbookSummaryLines(diagnostics)
    .map(line => `<li class="th-managed-worldbook-dialog-summary-item">${escapeHtml(line)}</li>`)
    .join('');
  const uninstallDisabled = diagnostics.managedEntryCount <= 0;

  let title = 'WB Backend 操作';
  let description = '请选择要执行的操作。';
  let actionHtml = [
    `<button type="button" class="th-btn th-managed-worldbook-dialog-btn is-danger" data-action="managed-worldbook-menu-uninstall" ${uninstallDisabled ? 'disabled' : ''}>uninstall</button>`,
    '<button type="button" class="th-btn th-primary-btn th-managed-worldbook-dialog-btn" data-action="managed-worldbook-menu-reinstall">reinstall</button>',
    '<button type="button" class="th-btn th-managed-worldbook-dialog-btn" data-action="managed-worldbook-menu-export-external">export to external worldbook</button>',
    '<button type="button" class="th-btn th-managed-worldbook-dialog-btn" data-action="managed-worldbook-dialog-return">return</button>',
  ].join('');

  if (uiState.managedWorldbookDialogMode === 'confirm-uninstall') {
    title = '确认卸载';
    description =
      'Are you sure remove all? This will uninstall all script-managed backend entries from the current main worldbook.';
    actionHtml = [
      '<button type="button" class="th-btn th-managed-worldbook-dialog-btn is-danger" data-action="managed-worldbook-confirm-uninstall">yes</button>',
      '<button type="button" class="th-btn th-managed-worldbook-dialog-btn" data-action="managed-worldbook-dialog-return">no</button>',
    ].join('');
  } else if (uiState.managedWorldbookDialogMode === 'confirm-reinstall') {
    title = '确认重装';
    description = 'All managed entries will reset to default. Are you sure to do that?';
    actionHtml = [
      '<button type="button" class="th-btn th-primary-btn th-managed-worldbook-dialog-btn" data-action="managed-worldbook-confirm-reinstall">yes</button>',
      '<button type="button" class="th-btn th-managed-worldbook-dialog-btn" data-action="managed-worldbook-dialog-return">no</button>',
    ].join('');
  }

  layer.dataset.open = 'true';
  layer.setAttribute('aria-hidden', 'false');
  layer.innerHTML = `
    <div class="th-managed-worldbook-dialog-backdrop"></div>
    <section class="th-managed-worldbook-dialog" role="dialog" aria-modal="true" aria-label="${escapeHtml(title)}">
      <div class="th-managed-worldbook-dialog-head">
        <div class="th-managed-worldbook-dialog-title">${escapeHtml(title)}</div>
        <div class="th-managed-worldbook-dialog-desc">${escapeHtml(description)}</div>
      </div>
      <ul class="th-managed-worldbook-dialog-summary">${summaryHtml}</ul>
      <div class="th-managed-worldbook-dialog-actions">${actionHtml}</div>
    </section>
  `;

  const bindClick = (selector: string, handler: () => void) => {
    const element = layer.querySelector<HTMLElement>(selector);
    if (element) {
      element.onclick = () => {
        handler();
      };
    }
  };

  bindClick('.th-managed-worldbook-dialog-backdrop', closeManagedWorldbookDialog);
  bindClick('[data-action="managed-worldbook-dialog-return"]', closeManagedWorldbookDialog);
  bindClick('[data-action="managed-worldbook-menu-uninstall"]', () => {
    openManagedWorldbookDialog('confirm-uninstall', diagnostics);
  });
  bindClick('[data-action="managed-worldbook-menu-reinstall"]', () => {
    openManagedWorldbookDialog('confirm-reinstall', diagnostics);
  });
  bindClick('[data-action="managed-worldbook-menu-export-external"]', () => {
    void promptExternalManagedWorldbookInstall();
  });
  bindClick('[data-action="managed-worldbook-confirm-uninstall"]', () => {
    void confirmManagedWorldbookUninstall();
  });
  bindClick('[data-action="managed-worldbook-confirm-reinstall"]', () => {
    void confirmManagedWorldbookReinstall();
  });
}

function switchSidebarTab(tab: SidebarTab): void {
  uiState.sidebarTab = tab;
  if (uiState.sidebarTab === 'form' && !state.editingEventId) {
    state.formMode = 'create';
  }
  if (refs.root) {
    refs.root.dataset.tab = uiState.sidebarTab;
    refs.root.querySelectorAll<HTMLElement>('[data-action="switch-tab"]').forEach(button => {
      button.classList.toggle('is-active', button.getAttribute('data-tab') === uiState.sidebarTab);
    });
    refs.root.querySelectorAll<HTMLElement>('[data-role="sidebar-create-entry"]').forEach(button => {
      const isActive = uiState.sidebarTab === 'form';
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
  }
  if (uiState.sidebarTab === 'form') {
    renderFormSection();
  }
}

function revealSidebarOnMobile(): void {
  if (isDesktopMode()) {
    return;
  }
  uiState.mobileSideOpen = true;
  if (refs.root) {
    refs.root.dataset.mobileSideOpen = 'true';
  }
  const sideBody = refs.root?.querySelector<HTMLElement>('.th-side-body');
  if (!sideBody) {
    return;
  }
  hostWindow.requestAnimationFrame(() => {
    sideBody.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

function hideSidebarOnMobile(): void {
  if (isDesktopMode()) {
    return;
  }
  uiState.mobileSideOpen = false;
  if (refs.root) {
    refs.root.dataset.mobileSideOpen = 'false';
  }
}

function readFormValue(field: string): string {
  return String(
    refs.formPanel?.querySelector<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(
      `[data-form-field="${field}"]`,
    )?.value || '',
  ).trim();
}

function renderMonthView(cells: MonthDayCell[]): string {
  return renderCalendarMonthView({
    cells,
    currentMonth: {
      year: state.currentMonth.year,
      month: state.currentMonth.month,
    },
  });
}

function renderBookMainView(bookId: string): string {
  return renderBookMainViewExternal({
    book: state.dataset?.books[bookId] ?? null,
    currentPageIndex: uiState.openedBookPageIndex,
    renderMarkdownContent,
  });
}

function getCurrentMonthAgendaGroups(): DailyAgendaGroup[] {
  if (!state.dataset) {
    return [];
  }
  const dayCount = new Date(state.currentMonth.year, state.currentMonth.month, 0).getDate();
  return buildDailyAgenda(
    state.dataset,
    formatDateKey({
      year: state.currentMonth.year,
      month: state.currentMonth.month,
      day: 1,
    }),
    dayCount,
  );
}

function renderAgendaPanel(groups: DailyAgendaGroup[]): string {
  return renderAgendaPanelExternal({
    groups,
    filterKeyword: state.filterKeyword,
    showArchived: state.showArchived,
    agendaSort: uiState.agendaSort,
    editingEventId: state.editingEventId,
  });
}

function renderDetailPanel(selectedLabel: string, selectedItems: DailyAgendaItem[]): string {
  if (!state.dataset) {
    return '<div class="th-empty">数据加载中…</div>';
  }

  const openedBook = uiState.openedBookId ? (state.dataset.books[uiState.openedBookId] ?? null) : null;
  if (uiState.openedBookId && !openedBook) {
    uiState.openedBookId = null;
  }

  return renderDetailPanelExternal({
    selectedLabel,
    selectedItems,
    openedBook,
    openedBookPageIndex: uiState.openedBookPageIndex,
    booksById: state.dataset.books,
    editingEventId: state.editingEventId,
    renderMarkdownContent,
  });
}

function renderFormSection(): void {
  if (!refs.formPanel || !state.dataset) {
    return;
  }
  const editing = getEditingRecord();
  refs.formPanel.innerHTML = `${buildFormEditingNotice()}${renderFormHtml({
    nowText: state.dataset.nowText || fallbackDateLabel(state.selectedDateKey),
    titleCandidates: state.dataset.suggestions.titleCandidates,
    idCandidates: state.dataset.suggestions.idCandidates,
    tagCandidates: state.dataset.suggestions.tagCandidates.map(option => option.label),
    values: editing
      ? {
          type: editing.type,
          id: editing.id,
          title: editing.title,
          tags: editing.tags.join(', '),
          content: editing.content,
          start: editing.startText,
          end: editing.endText,
          rule: editing.repeatRule,
        }
      : {
          type: '临时',
          start: state.selectedDateKey || state.dataset.nowText || '',
          rule: '无',
        },
    editing: Boolean(editing),
  })}`;
}

function renderShell(): void {
  if (!refs.root || !refs.monthGrid || !refs.detailPanel || !refs.formPanel) {
    return;
  }

  refs.root.dataset.open = state.open ? 'true' : 'false';
  refs.root.dataset.hasUpcoming = state.reminder.hasUpcoming ? 'true' : 'false';
  refs.root.dataset.tab = uiState.sidebarTab;
  refs.root.dataset.readingBook = uiState.openedBookId ? 'true' : 'false';
  refs.root.dataset.mobileSideOpen = !isDesktopMode() && uiState.mobileSideOpen ? 'true' : 'false';
  applyTheme();
  updateManagedWorldbookButton();
  renderManagedWorldbookDialog();
  refs.root.querySelectorAll<HTMLElement>('[data-action="switch-tab"]').forEach(button => {
    const tab = button.getAttribute('data-tab') || '';
    button.classList.toggle('is-active', tab === refs.root?.dataset.tab);
  });
  refs.root.querySelectorAll<HTMLElement>('[data-role="sidebar-create-entry"]').forEach(button => {
    const isActive = uiState.sidebarTab === 'form';
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
  });

  if (!state.dataset) {
    refs.monthGrid.innerHTML = '<div class="th-empty">数据加载中…</div>';
    refs.detailPanel.innerHTML = '<div class="th-empty">数据加载中…</div>';
    refs.formPanel.innerHTML = '<div class="th-empty">数据加载中…</div>';
    return;
  }

  const cells = buildMonthCells({
    month: state.currentMonth,
    selectedDateKey: state.selectedDateKey,
    dataset: state.dataset,
  });
  const monthAgendaGroups = getCurrentMonthAgendaGroups();
  const selectedAgendaGroups = state.selectedDateKey ? buildDailyAgenda(state.dataset, state.selectedDateKey, 1) : [];
  const detail = buildSelectedDayDetail({
    dateKey: state.selectedDateKey,
    cells,
    agendaGroups: selectedAgendaGroups,
  });
  const selectedLabel = detail.agenda?.label ?? fallbackDateLabel(state.selectedDateKey);

  refs.monthGrid.innerHTML = uiState.openedBookId ? renderBookMainView(uiState.openedBookId) : renderMonthView(cells);
  refs.detailPanel.innerHTML =
    !state.selectedDateKey && isDesktopMode()
      ? renderAgendaPanel(monthAgendaGroups)
      : renderDetailPanel(selectedLabel, detail.agenda?.items ?? []);
  const sideTitle = refs.root.querySelector<HTMLElement>('.th-side-title');
  if (sideTitle) {
    sideTitle.textContent =
      uiState.sidebarTab === 'form'
        ? state.editingEventId
          ? '编辑事件'
          : '新增事件'
        : !state.selectedDateKey && isDesktopMode()
          ? `${state.currentMonth.month}月事件`
          : selectedLabel || '日期详情';
  }
  if (uiState.sidebarTab === 'form') {
    renderFormSection();
  } else {
    refs.formPanel.innerHTML = '';
  }
  applyPanelPosition();
}

async function refreshDataset(): Promise<void> {
  await syncArchiveOnActiveRemoval(readCurrentWorldTime().text || '');
  state.dataset = await loadCalendarDataset();
  state.reminder = buildReminderState(state.dataset);
  syncStateAnchors();
  renderShell();
}

function setOpen(open: boolean): void {
  state.open = open;
  if (!open) {
    uiState.mobileSideOpen = false;
    uiState.managedWorldbookDialogOpen = false;
    uiState.managedWorldbookDialogMode = null;
    uiState.managedWorldbookDialogDiagnostics = null;
  }
  renderShell();
  if (open) {
    void refreshDataset();
  }
}

function startCreateForm(): void {
  state.formMode = 'create';
  state.editingEventId = null;
  uiState.openedBookId = null;
  switchSidebarTab('form');
  revealSidebarOnMobile();
}

function startEditForm(eventId: string): void {
  state.formMode = 'edit';
  state.editingEventId = eventId;
  switchSidebarTab('form');
  revealSidebarOnMobile();
}

async function saveForm(): Promise<void> {
  const editing = getEditingRecord();
  const result = await saveCalendarForm({
    type: readFormValue('type') === '重复' ? '重复' : '临时',
    id: readFormValue('id'),
    title: readFormValue('title'),
    tags: readFormValue('tags')
      .split(/[，,]/)
      .map(value => value.trim())
      .filter(Boolean),
    content: readFormValue('content'),
    start: readFormValue('start'),
    end: readFormValue('end'),
    rule: readFormValue('rule') || '无',
    editingRecord: editing ? { id: editing.id } : null,
  });

  if (!result.ok) {
    hostWindow.alert(result.message);
    return;
  }

  state.formMode = 'create';
  state.editingEventId = null;
  switchSidebarTab('detail');
  await refreshDataset();
}

async function deleteEvent(eventId: string): Promise<void> {
  const active = state.dataset?.activeEvents.find(item => item.id === eventId);
  if (!active) {
    return;
  }
  const ok = hostWindow.confirm(`确认删除事件「${active.title}」吗？`);
  if (!ok) {
    return;
  }
  const buckets = await readActiveBuckets();
  const temp = { ...buckets.临时 };
  const repeat = { ...buckets.重复 };
  delete temp[eventId];
  delete repeat[eventId];
  await replaceActiveBuckets({ 临时: temp, 重复: repeat });
  await refreshDataset();
}

async function purgeArchived(eventId: string): Promise<void> {
  const archive = readArchiveStore();
  if (!archive.completed[eventId]) {
    return;
  }
  const ok = hostWindow.confirm(`确认彻底删除归档事件「${eventId}」吗？`);
  if (!ok) {
    return;
  }
  delete archive.completed[eventId];
  replaceArchiveStore(archive);
  await refreshDataset();
}

async function fillNowTime(): Promise<void> {
  await ensureMvuReady();
  const worldTime = readCurrentWorldTime();
  const input = refs.formPanel?.querySelector<HTMLInputElement>('[data-form-field="start"]');
  if (input) {
    input.value = worldTime.text || '';
  }
}

async function handleManagedWorldbookClick(): Promise<void> {
  const diagnostics = getCalendarManagedWorldbookDiagnostics();
  console.info(`[${SCRIPT_NAME}] 用户点击 managed worldbook connectivity 按钮`, diagnostics);
  if (uiState.managedWorldbookBusy) {
    return;
  }

  openManagedWorldbookDialog('menu', diagnostics);
}

function buildExternalWorldbookPromptPayload(): {
  message: string;
  suggestedName: string;
} {
  const diagnostics = getCalendarManagedWorldbookDiagnostics();
  const availableNames = getAvailableCalendarWorldbooks()
    .map(name => String(name || '').trim())
    .filter(Boolean);
  const suggestedName = availableNames.find(name => name !== diagnostics.worldbookName) ?? `${SCRIPT_NAME}-backend`;
  const listedNames =
    availableNames.length > 0
      ? availableNames
          .slice(0, 12)
          .map(name => `- ${name}`)
          .join('\n')
      : '（当前没有可复用的 worldbook，可直接输入新名称创建）';

  return {
    suggestedName,
    message: [
      '请输入外部 worldbook 名称。',
      '可填写已有 worldbook 名称，或输入新名称自动创建。',
      `当前主 worldbook：${diagnostics.worldbookName || '（未绑定）'}`,
      '可用 worldbook：',
      listedNames,
    ].join('\n'),
  };
}

async function promptExternalManagedWorldbookInstall(): Promise<void> {
  if (uiState.managedWorldbookBusy) {
    return;
  }

  const { message, suggestedName } = buildExternalWorldbookPromptPayload();
  const targetName = String(hostWindow.prompt(message, suggestedName) || '').trim();
  if (!targetName) {
    return;
  }

  uiState.managedWorldbookDialogOpen = false;
  uiState.managedWorldbookDialogMode = null;
  uiState.managedWorldbookDialogDiagnostics = null;
  uiState.managedWorldbookBusy = true;
  renderShell();
  try {
    const result = await installCalendarManagedEntriesToExternalWorldbook(targetName);
    console.info(`[${SCRIPT_NAME}] 已将 backend 条目写入外部 worldbook`, result);
    hostWindow.alert(`已将 backend 条目写入外部 worldbook\nWorldbook: ${result.name}`);
  } catch (error) {
    console.warn(`[${SCRIPT_NAME}] 写入外部 worldbook backend 条目失败`, error);
    hostWindow.alert(`写入外部 worldbook 失败：${error instanceof Error ? error.message : String(error)}`);
  } finally {
    uiState.managedWorldbookBusy = false;
    renderShell();
  }
}

async function confirmManagedWorldbookUninstall(): Promise<void> {
  if (uiState.managedWorldbookBusy) {
    return;
  }

  uiState.managedWorldbookDialogOpen = false;
  uiState.managedWorldbookDialogMode = null;
  uiState.managedWorldbookDialogDiagnostics = null;
  uiState.managedWorldbookBusy = true;
  renderShell();
  try {
    const result = await uninstallCalendarManagedWorldbookEntries();
    console.info(`[${SCRIPT_NAME}] 一键卸载 worldbook backend 条目成功`, result);
    hostWindow.alert(`已卸载 ${result.removedCount} 个 backend 条目\nWorldbook: ${result.worldbookName}`);
  } catch (error) {
    console.warn(`[${SCRIPT_NAME}] 一键卸载 worldbook backend 条目失败`, error);
    hostWindow.alert(`卸载 backend 条目失败：${error instanceof Error ? error.message : String(error)}`);
  } finally {
    uiState.managedWorldbookBusy = false;
    renderShell();
  }
}

async function confirmManagedWorldbookReinstall(): Promise<void> {
  if (uiState.managedWorldbookBusy) {
    return;
  }

  uiState.managedWorldbookDialogOpen = false;
  uiState.managedWorldbookDialogMode = null;
  uiState.managedWorldbookDialogDiagnostics = null;
  uiState.managedWorldbookBusy = true;
  renderShell();
  try {
    const result = await installCalendarManagedWorldbookEntries();
    console.info(`[${SCRIPT_NAME}] 手动重装 worldbook backend 条目成功`, result);
    hostWindow.alert(`已重装 backend 条目，所有托管条目已恢复默认状态\nWorldbook: ${result.name}`);
  } catch (error) {
    console.warn(`[${SCRIPT_NAME}] 手动重装 worldbook backend 条目失败`, error);
    hostWindow.alert(`重装 backend 条目失败：${error instanceof Error ? error.message : String(error)}`);
  } finally {
    uiState.managedWorldbookBusy = false;
    renderShell();
  }
}

function resetPanelPosition(): void {
  if (!isDesktopMode()) {
    uiState.panelLeft = null;
    uiState.panelTop = null;
    if (refs.panel) {
      refs.panel.style.left = '';
      refs.panel.style.top = '';
    }
    return;
  }
  const viewport = getViewportSize({ hostWindow, hostDocument });
  if (!refs.panel) {
    return;
  }
  const width = refs.panel.offsetWidth || Math.min(1320, viewport.width * 0.9);
  const height = refs.panel.offsetHeight || Math.min(860, viewport.height * 0.9);
  uiState.panelLeft = Math.round((viewport.width - width) / 2);
  uiState.panelTop = Math.round((viewport.height - height) / 2);
  applyPanelPosition();
}

function handlePanelDragStart(event: MouseEvent): void {
  if (!isDesktopMode() || !refs.panel) {
    return;
  }
  const target = event.target as HTMLElement | null;
  if (!target || target.closest('button, input, textarea, select, label')) {
    return;
  }
  const panelRect = refs.panel.getBoundingClientRect();
  uiState.dragging = true;
  uiState.dragStartX = event.clientX;
  uiState.dragStartY = event.clientY;
  uiState.dragOriginLeft = panelRect.left;
  uiState.dragOriginTop = panelRect.top;
  event.preventDefault();
}

function handlePanelDragMove(event: MouseEvent): void {
  if (!uiState.dragging || !refs.panel) {
    return;
  }
  const viewport = getViewportSize({ hostWindow, hostDocument });
  const panelWidth = refs.panel.offsetWidth;
  const panelHeight = refs.panel.offsetHeight;
  const nextLeft = clamp(
    uiState.dragOriginLeft + (event.clientX - uiState.dragStartX),
    8,
    viewport.width - panelWidth - 8,
  );
  const nextTop = clamp(
    uiState.dragOriginTop + (event.clientY - uiState.dragStartY),
    8,
    viewport.height - panelHeight - 8,
  );
  uiState.panelLeft = nextLeft;
  uiState.panelTop = nextTop;
  applyPanelPosition();
}

function handlePanelDragEnd(): void {
  uiState.dragging = false;
}

function bindEvents(): void {
  bindCalendarWidgetEvents({
    refs,
    hostDocument,
    hostWindow,
    onToggleBall: () => {
      setOpen(!state.open);
    },
    onClosePanel: () => {
      setOpen(false);
    },
    onReload: refreshDataset,
    onToggleTheme: toggleTheme,
    onManagedWorldbookClick: handleManagedWorldbookClick,
    onSwitchTab: switchSidebarTab,
    onOpenCreateForm: startCreateForm,
    onCloseMobileSide: hideSidebarOnMobile,
    onCancelForm: () => {
      state.editingEventId = null;
      state.formMode = 'create';
      switchSidebarTab('detail');
    },
    onFillNowTime: fillNowTime,
    onSaveForm: saveForm,
    onPickDay: (dateKey: string) => {
      state.selectedDateKey = dateKey;
      state.editingEventId = null;
      state.formMode = 'create';
      uiState.openedBookId = null;
      switchSidebarTab('detail');
      renderShell();
      revealSidebarOnMobile();
    },
    onMonthPrev: () => {
      state.currentMonth = {
        year: state.currentMonth.month === 1 ? state.currentMonth.year - 1 : state.currentMonth.year,
        month: state.currentMonth.month === 1 ? 12 : state.currentMonth.month - 1,
        day: 1,
      };
      state.selectedDateKey = '';
      uiState.openedBookId = null;
      switchSidebarTab('detail');
      renderShell();
    },
    onMonthNext: () => {
      state.currentMonth = {
        year: state.currentMonth.month === 12 ? state.currentMonth.year + 1 : state.currentMonth.year,
        month: state.currentMonth.month === 12 ? 1 : state.currentMonth.month + 1,
        day: 1,
      };
      state.selectedDateKey = '';
      uiState.openedBookId = null;
      switchSidebarTab('detail');
      renderShell();
    },
    onMonthToday: () => {
      if (state.dataset?.nowDate) {
        state.currentMonth = {
          year: state.dataset.nowDate.year,
          month: state.dataset.nowDate.month,
          day: 1,
        };
        state.selectedDateKey = '';
        uiState.openedBookId = null;
        switchSidebarTab('detail');
      }
      renderShell();
    },
    onOpenBook: (bookId: string) => {
      const book = state.dataset?.books[bookId];
      if (!book) {
        return;
      }
      uiState.openedBookId = bookId;
      uiState.openedBookPageIndex = 0;
      switchSidebarTab('detail');
      renderShell();
    },
    onCloseBookReader: () => {
      uiState.openedBookId = null;
      uiState.openedBookPageIndex = 0;
      renderShell();
    },
    onOpenBookPage: (pageIndex: number) => {
      uiState.openedBookPageIndex = Math.max(0, pageIndex);
      renderShell();
    },
    onBookPrevPage: () => {
      uiState.openedBookPageIndex = Math.max(0, uiState.openedBookPageIndex - 1);
      renderShell();
    },
    onBookNextPage: () => {
      uiState.openedBookPageIndex += 1;
      renderShell();
    },
    onEditEvent: startEditForm,
    onCompleteEvent: (eventId: string, eventType: '临时' | '重复') =>
      archiveCompletedEvent({ id: eventId, type: eventType, completedAt: state.dataset?.nowText || '' }).then(
        refreshDataset,
      ),
    onDeleteEvent: deleteEvent,
    onRestoreEvent: (eventId: string) => restoreArchivedEvent(eventId).then(refreshDataset),
    onPurgeEvent: purgeArchived,
    onAgendaFilterInput: (keyword: string) => {
      state.filterKeyword = keyword;
      renderShell();
    },
    onAgendaToggleArchived: (checked: boolean) => {
      state.showArchived = checked;
      renderShell();
    },
    onAgendaSortChange: (sort: 'date-asc' | 'date-desc' | 'title-asc') => {
      uiState.agendaSort = sort;
      renderShell();
    },
    onOpenAgendaItemDate: (dateKey: string) => {
      state.selectedDateKey = dateKey;
      state.editingEventId = null;
      state.formMode = 'create';
      uiState.openedBookId = null;
      uiState.openedBookPageIndex = 0;
      switchSidebarTab('detail');
      renderShell();
      revealSidebarOnMobile();
    },
    onPanelDragStart: handlePanelDragStart,
    onPanelDragMove: handlePanelDragMove,
    onPanelDragEnd: handlePanelDragEnd,
    onWindowResize: () => {
      if (!isDesktopMode()) {
        uiState.panelLeft = null;
        uiState.panelTop = null;
        if (refs.panel) {
          refs.panel.style.left = '';
          refs.panel.style.top = '';
        }
        return;
      }
      renderShell();
    },
  });
}

function destroy(reason?: string): void {
  if (state.destroyed) {
    return;
  }
  state.destroyed = true;
  if (refs.ball) {
    $(refs.ball).off('.calendar-float');
  }
  if (refs.root) {
    $(refs.root).off('.calendar-float');
    refs.root.remove();
  }
  $(hostDocument).off('.calendar-float-panel-drag');
  $(hostWindow).off('.calendar-float-window');
  hostDocument.getElementById(STYLE_ID)?.remove();
  refs.root = null;
  refs.ball = null;
  refs.panel = null;
  refs.monthGrid = null;
  refs.agendaList = null;
  refs.detailPanel = null;
  refs.formPanel = null;
  if (reason && reason !== 'reload') {
    console.info(`[${SCRIPT_NAME}] 已销毁: ${reason}`);
  }
  delete hostWindow[INSTANCE_KEY];
  if (window !== hostWindow) {
    delete window[INSTANCE_KEY];
  }
}

async function reload(): Promise<void> {
  await refreshDataset();
}

export function bootstrapCalendarWidget(): void {
  hostWindow[INSTANCE_KEY]?.destroy('reload');
  ensureStyle();
  ensureRoot();
  loadTheme();
  bindEvents();
  resetPanelPosition();
  renderShell();
  void refreshDataset();
  hostWindow[INSTANCE_KEY] = {
    destroy,
    open: () => setOpen(true),
    close: () => setOpen(false),
    reload,
  };
  if (window !== hostWindow) {
    window[INSTANCE_KEY] = hostWindow[INSTANCE_KEY];
  }
}

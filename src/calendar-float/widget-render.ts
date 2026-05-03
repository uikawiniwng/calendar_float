import { extractClockTimeText } from './date';
import { formatCalendarMonthTitle } from './runtime-month-alias';
import type {
  ArchivedCalendarEvent,
  CalendarArchivePolicy,
  CalendarBookRecord,
  CalendarEventColorStyle,
  CalendarEventRecord,
  DailyAgendaGroup,
  DailyAgendaItem,
  MonthDayCell,
} from './types';

export type AgendaSortMode = 'date-asc' | 'date-desc' | 'title-asc';

function escapeWidgetHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function isEditingItem(itemId: string, editingEventId: string | null): boolean {
  return Boolean(editingEventId && editingEventId === itemId);
}

function buildEditingFlag(itemId: string, editingEventId: string | null): string {
  return isEditingItem(itemId, editingEventId) ? '<span class="th-item-editing-flag">当前编辑</span>' : '';
}

function buildCustomColorStyle(color?: CalendarEventColorStyle): string {
  if (!color) {
    return '';
  }
  const border = color.border || color.background;
  return `--th-chip-bg: ${escapeWidgetHtml(color.background)}; --th-chip-text: ${escapeWidgetHtml(color.text)}; --th-chip-border: ${escapeWidgetHtml(border)}; --th-card-accent: ${escapeWidgetHtml(color.background)}; --th-card-accent-soft: ${escapeWidgetHtml(color.background)}; --th-card-accent-border: ${escapeWidgetHtml(border)}; --th-card-accent-strong: ${escapeWidgetHtml(color.text)};`;
}

function buildCustomColorAttrs(color?: CalendarEventColorStyle): string {
  const style = buildCustomColorStyle(color);
  return style ? ` has-custom-color" style="${style}"` : '"';
}

function buildItemActionButtons(item: Pick<DailyAgendaItem, 'id' | 'type' | 'source'>): string {
  if (item.source === 'festival') {
    return '';
  }
  if (item.source === 'archive') {
    return `<div class="th-card-actions th-card-actions--icon"><button type="button" class="th-btn th-icon-btn" data-action="edit-event" data-event-id="${escapeWidgetHtml(item.id)}" title="编辑" aria-label="编辑">✎</button><button type="button" class="th-btn th-icon-btn" data-action="restore-event" data-event-id="${escapeWidgetHtml(item.id)}" title="恢复" aria-label="恢复">↺</button><button type="button" class="th-btn th-icon-btn is-danger" data-action="purge-event" data-event-id="${escapeWidgetHtml(item.id)}" title="彻底删除" aria-label="彻底删除">🗑</button></div>`;
  }
  return `<div class="th-card-actions th-card-actions--icon"><button type="button" class="th-btn th-icon-btn" data-action="edit-event" data-event-id="${escapeWidgetHtml(item.id)}" title="编辑" aria-label="编辑">✎</button><button type="button" class="th-btn th-icon-btn" data-action="complete-event" data-event-id="${escapeWidgetHtml(item.id)}" data-event-type="${escapeWidgetHtml(item.type)}" title="完成" aria-label="完成">✓</button><button type="button" class="th-btn th-icon-btn is-danger" data-action="delete-event" data-event-id="${escapeWidgetHtml(item.id)}" title="删除" aria-label="删除">🗑</button></div>`;
}

export interface CalendarBookPage {
  index: number;
  title: string;
  content: string;
}

export function parseCalendarBookPages(
  book: Pick<CalendarBookRecord, 'title' | 'summary' | 'content'>,
): CalendarBookPage[] {
  const source = String(book.content || book.summary || '（暂无内容）').replace(/\r\n?/g, '\n');
  const rawPages = source
    .split(/\[newpage\]/gi)
    .map(page => page.trim())
    .filter(Boolean);
  const pages = rawPages.length ? rawPages : ['（暂无内容）'];

  return pages.map((rawContent, index) => {
    const headingAtTop = rawContent.match(/^\s*##\s+(.+?)\s*(?:\n+|$)/);
    const title = headingAtTop?.[1]?.trim() || `第${index + 1}页`;
    const content = headingAtTop ? rawContent.slice(headingAtTop[0].length).trim() || rawContent : rawContent;

    return {
      index,
      title,
      content,
    };
  });
}

function getBookTitleFontSize(title: string): number {
  const visualLength = Math.max(
    Array.from(title).reduce((total, character) => total + (character.charCodeAt(0) <= 0xff ? 0.56 : 1), 0),
    1,
  );
  return Math.max(8, Math.min(48, Math.floor(760 / visualLength)));
}

function buildBookFooterControls(pages: CalendarBookPage[], currentPageIndex: number): string {
  const pageControls =
    pages.length > 1
      ? `<div class="th-book-pagination-main">
          <button type="button" class="th-book-page-arrow" data-action="book-prev-page" ${currentPageIndex <= 0 ? 'disabled' : ''} aria-label="上一页">←</button>
          <div class="th-book-page-number-list" aria-label="页码列表">
            ${pages
              .map(
                page =>
                  `<button type="button" class="th-book-page-number ${page.index === currentPageIndex ? 'is-active' : ''}" data-action="open-book-page" data-page-index="${page.index}" aria-pressed="${page.index === currentPageIndex ? 'true' : 'false'}">${page.index + 1}</button>`,
              )
              .join('')}
          </div>
          <button type="button" class="th-book-page-arrow" data-action="book-next-page" ${currentPageIndex >= pages.length - 1 ? 'disabled' : ''} aria-label="下一页">→</button>
        </div>`
      : '<div class="th-book-pagination-main th-book-pagination-main--empty" aria-hidden="true"></div>';

  return `
    <nav class="th-book-pagination${pages.length > 1 ? ' has-page-controls' : ' has-return-only'}" aria-label="读物底部控制">
      <div class="th-book-pagination-spacer" aria-hidden="true"></div>
      ${pageControls}
      <button type="button" class="th-btn th-book-return-btn" data-action="close-book-reader">返回日期详情</button>
    </nav>
  `;
}

function chunkWeekRows(cells: MonthDayCell[]): MonthDayCell[][] {
  const rows: MonthDayCell[][] = [];
  for (let index = 0; index < cells.length; index += 7) {
    rows.push(cells.slice(index, index + 7));
  }
  return rows;
}

function isSameContinuousChip(
  left: MonthDayCell['chips'][number] | undefined,
  right: MonthDayCell['chips'][number] | undefined,
): boolean {
  if (!left || !right) {
    return false;
  }
  return left.title === right.title && left.colorToken === right.colorToken && left.source === right.source;
}

function countContinuousChipSpan(week: MonthDayCell[], cellIndex: number, chipIndex: number): number {
  const chip = week[cellIndex]?.chips[chipIndex];
  if (!chip) {
    return 1;
  }
  let span = 1;
  while (isSameContinuousChip(chip, week[cellIndex + span]?.chips[chipIndex])) {
    span += 1;
  }
  return span;
}

function renderWeekChipOverlay(week: MonthDayCell[]): string {
  const bars: string[] = [];
  week.forEach((cell, cellIndex) => {
    cell.chips.forEach((chip, chipIndex) => {
      if (isSameContinuousChip(week[cellIndex - 1]?.chips[chipIndex], chip)) {
        return;
      }
      const span = countContinuousChipSpan(week, cellIndex, chipIndex);
      const colorClass = chip.color ? ' has-custom-color' : '';
      const customStyle = buildCustomColorStyle(chip.color);
      bars.push(
        `<div class="th-chip th-week-chip-bar is-${chip.colorToken}${colorClass}" style="grid-column: ${cellIndex + 1} / span ${span}; grid-row: ${chipIndex + 1}; ${customStyle}" title="${escapeWidgetHtml(chip.title)}">${escapeWidgetHtml(chip.title)}</div>`,
      );
    });
  });
  return bars.length ? `<div class="th-week-chip-grid">${bars.join('')}</div>` : '';
}

export function renderCalendarMonthView(options: {
  cells: MonthDayCell[];
  currentMonth: { year: number; month: number; alias?: string };
}): string {
  const { cells, currentMonth } = options;
  const weekRows = chunkWeekRows(cells);
  return `
    <div class="th-month-view">
      <section class="th-month-header">
        <div>
          <div class="th-month-title">${escapeWidgetHtml(formatCalendarMonthTitle(currentMonth.year, currentMonth.month, currentMonth.alias))}</div>
        </div>
        <div class="th-month-actions">
          <button type="button" class="th-btn" data-action="month-prev">上个月</button>
          <button type="button" class="th-btn" data-action="month-today">回到本月</button>
          <button type="button" class="th-btn" data-action="month-next">下个月</button>
        </div>
      </section>
      <section class="th-month-board">
        <div class="th-week-head">${['日', '一', '二', '三', '四', '五', '六'].map(name => `<div>${name}</div>`).join('')}</div>
        <div class="th-month-grid">
          ${weekRows
            .map(week => {
              const weekChipRows = Math.max(
                1,
                ...week.map(cell => cell.chips.length + (cell.overflowCount > 0 ? 1 : 0)),
              );
              return `<div class="th-week-block" style="--th-week-chip-rows: ${weekChipRows};"><div class="th-week-days">${week
                .map(cell => {
                  const classes = ['th-day-cell'];
                  if (!cell.inCurrentMonth) {
                    classes.push('is-muted');
                  }
                  if (cell.isToday) {
                    classes.push('is-today');
                  }
                  if (cell.isSelected) {
                    classes.push('is-selected');
                  }
                  return `<button type="button" class="${classes.join(' ')}" data-action="pick-day" data-date-key="${escapeWidgetHtml(cell.key)}"><div class="th-day-head"><span class="th-day-number">${cell.day}</span></div><div class="th-day-meta">${cell.overflowCount > 0 ? `<div class="th-overflow">+${cell.overflowCount} 条</div>` : ''}</div></button>`;
                })
                .join('')}</div>${renderWeekChipOverlay(week)}</div>`;
            })
            .join('')}
        </div>
      </section>
    </div>
  `;
}

export function renderBookMainView(options: {
  book: CalendarBookRecord | null;
  currentPageIndex: number;
  renderMarkdownContent: (markdown: string) => string;
}): string {
  const { book, currentPageIndex, renderMarkdownContent } = options;
  if (!book) {
    return '<div class="th-empty">读物不存在或已失效。</div>';
  }

  const pages = parseCalendarBookPages(book);
  const safePageIndex = Math.min(Math.max(currentPageIndex, 0), pages.length - 1);
  const currentPage = pages[safePageIndex];
  const pageTitle = currentPage.title.trim();
  const bookTitle = book.title.trim();
  const displayBookTitle = bookTitle || '未命名读物';
  const decoratedBookTitle = `《${displayBookTitle}》`;
  const titleFontSize = getBookTitleFontSize(decoratedBookTitle);
  const shouldShowPageTitle =
    !!pageTitle && pageTitle !== bookTitle && pageTitle !== displayBookTitle && !/^第\d+页$/.test(pageTitle);

  return `
    <article class="th-book-main-card">
      <div class="th-book-main-head">
        <div class="th-book-main-title-wrap">
          <div class="th-month-title" style="--th-book-title-size: ${titleFontSize}px;">${escapeWidgetHtml(decoratedBookTitle)}</div>
          <div class="th-month-subtitle">读物正文 · Markdown 阅读模式</div>
        </div>
      </div>
      ${book.summary ? `<div class="th-reminder-summary"><div>${escapeWidgetHtml(book.summary)}</div></div>` : ''}
      <section class="th-book-reading-surface" aria-label="${escapeWidgetHtml(shouldShowPageTitle ? pageTitle : displayBookTitle)}">
        ${shouldShowPageTitle ? `<div class="th-book-page-title">${escapeWidgetHtml(pageTitle)}</div>` : ''}
        <div class="th-book-main-body">${renderMarkdownContent(currentPage.content || '（暂无内容）')}</div>
      </section>
      ${buildBookFooterControls(pages, safePageIndex)}
    </article>
  `;
}

function buildItemClockMeta(item: Pick<DailyAgendaItem, 'startText' | 'endText'>, className: string): string {
  const startClock = extractClockTimeText(item.startText);
  const endClock = extractClockTimeText(item.endText);
  const clockText =
    startClock && endClock && endClock !== startClock ? `${startClock} ~ ${endClock}` : startClock || endClock;
  return clockText ? `<div class="${className}">${escapeWidgetHtml(clockText)}</div>` : '';
}

function matchesAgendaKeyword(item: DailyAgendaItem, keyword: string): boolean {
  if (!keyword) {
    return true;
  }
  const haystack = [item.title, item.summary, item.stageTitle || '', item.tags.join(' ')].join(' ').toLowerCase();
  return haystack.includes(keyword);
}

function sortAgendaGroups(groups: DailyAgendaGroup[], agendaSort: AgendaSortMode): DailyAgendaGroup[] {
  const nextGroups = groups.map(group => ({
    ...group,
    items:
      agendaSort === 'title-asc'
        ? [...group.items].sort((left, right) => left.title.localeCompare(right.title, 'zh-CN'))
        : group.items,
  }));

  if (agendaSort === 'date-desc') {
    return nextGroups.sort((left, right) => right.dateKey.localeCompare(left.dateKey));
  }
  return nextGroups.sort((left, right) => left.dateKey.localeCompare(right.dateKey));
}

function getFilteredAgendaGroups(options: {
  groups: DailyAgendaGroup[];
  filterKeyword: string;
  showArchived: boolean;
  agendaSort: AgendaSortMode;
}): DailyAgendaGroup[] {
  const { groups, filterKeyword, showArchived, agendaSort } = options;
  const keyword = filterKeyword.trim().toLowerCase();
  return sortAgendaGroups(
    groups
      .map(group => ({
        ...group,
        items: group.items.filter(item => {
          if (!showArchived && item.source === 'archive') {
            return false;
          }
          return matchesAgendaKeyword(item, keyword);
        }),
      }))
      .filter(group => group.items.length > 0),
    agendaSort,
  );
}

export function renderAgendaPanel(options: {
  groups: DailyAgendaGroup[];
  filterKeyword: string;
  showArchived: boolean;
  agendaSort: AgendaSortMode;
  editingEventId: string | null;
}): string {
  const { groups, filterKeyword, showArchived, agendaSort, editingEventId } = options;
  const filteredGroups = getFilteredAgendaGroups({ groups, filterKeyword, showArchived, agendaSort });
  return `
    <section class="th-agenda-toolbar">
      <div class="th-agenda-toolbar-row">
        <input type="text" data-action="agenda-filter-input" value="${escapeWidgetHtml(filterKeyword)}" placeholder="筛选当前列表中的事件" />
      </div>
      <div class="th-agenda-toolbar-row">
        <label class="th-agenda-toggle"><input class="th-native-check" type="checkbox" data-action="agenda-toggle-archived" ${showArchived ? 'checked' : ''} /><span class="th-check-proxy" aria-hidden="true">${showArchived ? '✓' : ''}</span><span>显示归档事件</span></label>
        <select data-action="agenda-sort-select">
          <option value="date-asc" ${agendaSort === 'date-asc' ? 'selected' : ''}>日期升序</option>
          <option value="date-desc" ${agendaSort === 'date-desc' ? 'selected' : ''}>日期降序</option>
          <option value="title-asc" ${agendaSort === 'title-asc' ? 'selected' : ''}>标题排序</option>
        </select>
      </div>
    </section>
    <section class="th-agenda-groups">
      ${
        filteredGroups.length
          ? filteredGroups
              .map(group => {
                const items = group.items
                  .map(item => {
                    const tags = item.tags.length
                      ? `<div class="th-item-tags">${item.tags.map(tag => `<span>${escapeWidgetHtml(tag)}</span>`).join('')}</div>`
                      : '';
                    const actionButtons = buildItemActionButtons(item);
                    const classes = ['th-agenda-item', `is-${item.source}`];
                    if (isEditingItem(item.id, editingEventId)) {
                      classes.push('is-editing');
                    }
                    return `<article class="${classes.join(' ')}${buildCustomColorAttrs(item.color)} data-action="open-agenda-item-date" data-date-key="${escapeWidgetHtml(item.dateKey)}"><div class="th-item-top"><div class="th-item-title-wrap"><div class="th-item-title">${escapeWidgetHtml(item.title)}</div>${buildEditingFlag(item.id, editingEventId)}</div>${actionButtons}</div>${item.stageTitle ? `<div class="th-item-stage">${escapeWidgetHtml(item.stageTitle)}</div>` : ''}${buildItemClockMeta(item, 'th-item-time')}<div class="th-item-summary">${escapeWidgetHtml(item.summary || '（无详情）')}</div>${tags}</article>`;
                  })
                  .join('');
                return `<section class="th-agenda-group"><div class="th-agenda-date">${escapeWidgetHtml(group.label)}</div>${items}</section>`;
              })
              .join('')
          : '<div class="th-empty">当前筛选条件下没有匹配事件。</div>'
      }
    </section>
  `;
}

export function renderDetailPanel(options: {
  selectedLabel: string;
  selectedItems: DailyAgendaItem[];
  openedBook: CalendarBookRecord | null;
  openedBookPageIndex: number;
  booksById: Record<string, CalendarBookRecord>;
  editingEventId: string | null;
  renderMarkdownContent: (markdown: string) => string;
  addonHtml?: string;
}): string {
  const {
    selectedItems,
    openedBook,
    openedBookPageIndex,
    booksById,
    editingEventId,
    renderMarkdownContent,
    addonHtml = '',
  } = options;
  if (openedBook) {
    const pages = parseCalendarBookPages(openedBook);
    const safePageIndex = Math.min(Math.max(openedBookPageIndex, 0), pages.length - 1);
    const currentPage = pages[safePageIndex];
    const bookTitle = openedBook.title.trim() || '未命名读物';
    const decoratedBookTitle = `《${bookTitle}》`;
    const titleFontSize = getBookTitleFontSize(decoratedBookTitle);
    return `<article class="th-detail-card is-book-reader"><div class="th-book-reader-head"><div class="th-book-main-title-wrap"><div class="th-item-title" style="--th-book-title-size: ${titleFontSize}px;">${escapeWidgetHtml(decoratedBookTitle)}</div><div class="th-detail-meta">读物详情</div></div></div>${openedBook.summary ? `<div class="th-detail-summary">${escapeWidgetHtml(openedBook.summary)}</div>` : ''}<div class="th-book-page-title">${escapeWidgetHtml(currentPage.title)}</div><div class="th-book-reader-body">${renderMarkdownContent(currentPage.content || '（暂无内容）')}</div>${buildBookFooterControls(pages, safePageIndex)}</article>`;
  }
  if (!selectedItems.length) {
    return (
      addonHtml || '<section class="th-side-section"><div class="th-empty">这一天暂时没有命中的事件。</div></section>'
    );
  }
  const cards = selectedItems
    .map(item => {
      const books = item.relatedBookIds
        .map(bookId => booksById[bookId])
        .filter(Boolean)
        .map(
          book =>
            `<button type="button" class="th-book-link" data-action="open-book" data-book-id="${escapeWidgetHtml(book.id)}">${escapeWidgetHtml(book.title)}</button>`,
        )
        .join('');
      const tags = item.tags.length
        ? `<div class="th-item-tags">${item.tags.map(tag => `<span>${escapeWidgetHtml(tag)}</span>`).join('')}</div>`
        : '';
      const classes = ['th-detail-card', `is-${item.source}`];
      if (isEditingItem(item.id, editingEventId)) {
        classes.push('is-editing');
      }
      return `<article class="${classes.join(' ')}${buildCustomColorAttrs(item.color)}><div class="th-item-top"><div class="th-item-title-wrap"><div class="th-item-title">${escapeWidgetHtml(item.title)}</div>${buildEditingFlag(item.id, editingEventId)}</div>${buildItemActionButtons(item)}</div>${item.stageTitle ? `<div class="th-item-stage">${escapeWidgetHtml(item.stageTitle)}</div>` : ''}${buildItemClockMeta(item, 'th-detail-meta')}<div class="th-detail-summary">${escapeWidgetHtml(item.summary || '（无详情）')}</div>${tags}${books ? `<div class="th-detail-books">${books}</div>` : ''}</article>`;
    })
    .join('');
  return `${addonHtml}<section class="th-side-section">${cards}</section>`;
}

function serializeTagList(tags: string[]): string {
  return tags.join(', ');
}

function renderPolicyTagPicker(args: {
  field: string;
  selectedTags: string[];
  tagCandidates: string[];
  placeholder: string;
}): string {
  const selectedSet = new Set(args.selectedTags);
  const escapedField = escapeWidgetHtml(args.field);
  const listId = `th-policy-tag-list-${args.field.replace(/[^a-z0-9_-]/gi, '-')}`;
  const candidates = [...args.tagCandidates, ...args.selectedTags]
    .map(tag => String(tag || '').trim())
    .filter(Boolean)
    .filter((tag, index, array) => array.indexOf(tag) === index)
    .sort((left, right) => {
      const selectedRank = Number(selectedSet.has(right)) - Number(selectedSet.has(left));
      return selectedRank || left.localeCompare(right, 'zh-CN');
    });
  const optionHtml = candidates
    .map(tag => {
      const active = selectedSet.has(tag);
      return `<button type="button" class="th-tag-option ${active ? 'is-active' : ''}" data-action="toggle-policy-tag" data-policy-tag-field="${escapedField}" data-tag-value="${escapeWidgetHtml(tag)}" aria-pressed="${active ? 'true' : 'false'}"><span class="th-tag-option-check" aria-hidden="true">${active ? '✓' : ''}</span><span>${escapeWidgetHtml(tag)}</span></button>`;
    })
    .join('');
  return `
    <div class="th-tag-picker th-policy-tag-picker" data-role="policy-tag-picker" data-policy-tag-field="${escapedField}">
      <input type="hidden" data-policy-field="${escapedField}" value="${escapeWidgetHtml(serializeTagList(args.selectedTags))}" />
      <div class="th-policy-tag-search-shell">
        <input type="text" data-action="policy-tag-search-input" data-policy-tag-field="${escapedField}" placeholder="${escapeWidgetHtml(args.placeholder)}" aria-controls="${escapeWidgetHtml(listId)}" />
        <button type="button" class="th-policy-tag-arrow" data-action="toggle-policy-tag-list" data-policy-tag-field="${escapedField}" aria-expanded="false" aria-controls="${escapeWidgetHtml(listId)}" aria-label="展开可用标签">▾</button>
        <button type="button" class="th-btn th-policy-tag-add" data-action="add-policy-tag" data-policy-tag-field="${escapedField}">加入</button>
      </div>
      <div class="th-policy-tag-meta">已选 ${args.selectedTags.length} 个；展开列表可直接勾选</div>
      <div id="${escapeWidgetHtml(listId)}" class="th-tag-option-list" data-role="policy-tag-option-list" hidden>${optionHtml || '<span class="th-tag-picker-empty" data-role="policy-tag-empty">暂无候选标签</span>'}</div>
    </div>
  `;
}

function formatArchiveReason(event: ArchivedCalendarEvent | undefined): string {
  switch (event?.archive_reason) {
    case 'auto_cleanup':
      return '自动清理';
    case 'manual_delete':
      return '手动移入';
    case 'memory':
      return '回忆';
    case 'completed':
    default:
      return '完成';
  }
}

export function renderArchivePanel(options: {
  archivedEvents: CalendarEventRecord[];
  filterKeyword: string;
  policy: CalendarArchivePolicy;
  tagCandidates: string[];
}): string {
  const keyword = options.filterKeyword.trim().toLowerCase();
  const filteredEvents = options.archivedEvents
    .filter(event => {
      if (!keyword) {
        return true;
      }
      return [event.title, event.content, event.tags.join(' '), event.id].join(' ').toLowerCase().includes(keyword);
    })
    .sort((left, right) =>
      String(right.metadata.archived_at || '').localeCompare(String(left.metadata.archived_at || '')),
    );
  const eventCards = filteredEvents.length
    ? filteredEvents
        .map(event => {
          const raw = event.raw as ArchivedCalendarEvent | undefined;
          const tags = event.tags.length
            ? `<div class="th-item-tags">${event.tags.map(tag => `<span>${escapeWidgetHtml(tag)}</span>`).join('')}</div>`
            : '';
          return `<article class="th-agenda-item is-archive${buildCustomColorAttrs(event.color)}><div class="th-item-top"><div class="th-item-title-wrap"><div class="th-item-title">${escapeWidgetHtml(event.title)}</div><span class="th-item-editing-flag">${escapeWidgetHtml(formatArchiveReason(raw))}</span></div>${buildItemActionButtons({ id: event.id, type: event.type, source: 'archive' })}</div><div class="th-item-time">${escapeWidgetHtml(event.startText || '未填写')}${event.endText ? ` ~ ${escapeWidgetHtml(event.endText)}` : ''}</div><div class="th-item-summary">${escapeWidgetHtml(event.content || '（无详情）')}</div>${tags}</article>`;
        })
        .join('')
    : '<div class="th-empty">归档区里没有匹配的事件。</div>';

  return `
    <section class="th-agenda-toolbar">
      <div class="th-agenda-toolbar-row">
        <input type="text" data-action="agenda-filter-input" value="${escapeWidgetHtml(options.filterKeyword)}" placeholder="筛选归档事件" />
      </div>
      <div class="th-agenda-toolbar-row">
        <button type="button" class="th-btn is-danger" data-action="purge-auto-delete-archive">清理黑名单归档</button>
      </div>
    </section>
    <section class="th-archive-policy-panel">
      <div class="th-side-section-head">
        <div>
          <div class="th-side-section-title">归档规则</div>
          <div class="th-side-section-subtitle">收藏优先于黑名单；未命中的事件默认进入归档区。</div>
        </div>
      </div>
      <label class="th-agenda-toggle"><input class="th-native-check" type="checkbox" data-policy-field="archive-on-active-removal" ${options.policy.archiveOnActiveRemoval ? 'checked' : ''} /><span class="th-check-proxy" aria-hidden="true">${options.policy.archiveOnActiveRemoval ? '✓' : ''}</span><span>LLM 移除事件时默认归档</span></label>
      <div class="th-form-field th-archive-policy-section th-archive-policy-section--delete">
        <div class="th-policy-field-label"><span>黑名单标签</span><small>命中后直接清理，不进入归档。</small></div>
        ${renderPolicyTagPicker({
          field: 'auto-delete-tags',
          selectedTags: options.policy.autoDeleteTags,
          tagCandidates: options.tagCandidates,
          placeholder: '搜索黑名单标签，或输入新标签',
        })}
      </div>
      <div class="th-archive-policy-divider" aria-hidden="true"></div>
      <div class="th-form-field th-archive-policy-section th-archive-policy-section--protect">
        <div class="th-policy-field-label"><span>收藏保护标签</span><small>命中后永不自动删除或归档。</small></div>
        ${renderPolicyTagPicker({
          field: 'protected-tags',
          selectedTags: options.policy.protectedTags,
          tagCandidates: options.tagCandidates,
          placeholder: '搜索收藏保护标签，或输入新标签',
        })}
      </div>
      <div class="th-card-actions">
        <button type="button" class="th-btn th-primary-btn" data-action="save-archive-policy">保存规则</button>
      </div>
    </section>
    <section class="th-agenda-groups">${eventCards}</section>
  `;
}

import type { CalendarBookRecord, DailyAgendaGroup, DailyAgendaItem, MonthDayCell } from './types';
import { formatCalendarMonthTitle } from './月份别名';

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

function buildBookPagination(pages: CalendarBookPage[], currentPageIndex: number): string {
  if (pages.length <= 1) {
    return '';
  }

  return `
    <div class="th-book-pagination">
      <div class="th-book-pagination-main">
        <button type="button" class="th-btn" data-action="book-prev-page" ${currentPageIndex <= 0 ? 'disabled' : ''}>上一页</button>
        <div class="th-book-pagination-status">第 ${currentPageIndex + 1} / ${pages.length} 页</div>
        <button type="button" class="th-btn" data-action="book-next-page" ${currentPageIndex >= pages.length - 1 ? 'disabled' : ''}>下一页</button>
      </div>
      <div class="th-book-page-tabs">
        ${pages
          .map(
            page =>
              `<button type="button" class="th-book-page-tab ${page.index === currentPageIndex ? 'is-active' : ''}" data-action="open-book-page" data-page-index="${page.index}" aria-pressed="${page.index === currentPageIndex ? 'true' : 'false'}">${escapeWidgetHtml(page.title)}</button>`,
          )
          .join('')}
      </div>
    </div>
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
      bars.push(
        `<div class="th-chip th-week-chip-bar is-${chip.colorToken}" style="grid-column: ${cellIndex + 1} / span ${span}; grid-row: ${chipIndex + 1};" title="${escapeWidgetHtml(chip.title)}">${escapeWidgetHtml(chip.title)}</div>`,
      );
    });
  });
  return bars.length ? `<div class="th-week-chip-grid">${bars.join('')}</div>` : '';
}

export function renderCalendarMonthView(options: {
  cells: MonthDayCell[];
  currentMonth: { year: number; month: number };
}): string {
  const { cells, currentMonth } = options;
  const weekRows = chunkWeekRows(cells);
  return `
    <div class="th-month-view">
      <section class="th-month-header">
        <div>
          <div class="th-month-title">${escapeWidgetHtml(formatCalendarMonthTitle(currentMonth.year, currentMonth.month))}</div>
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

  return `
    <article class="th-book-main-card">
      <div class="th-book-main-head">
        <div>
          <div class="th-month-title">${escapeWidgetHtml(book.title)}</div>
          <div class="th-month-subtitle">读物正文 · Markdown 阅读模式</div>
        </div>
        <div class="th-month-actions">
          <button type="button" class="th-btn" data-action="close-book-reader">返回日期详情</button>
        </div>
      </div>
      ${book.summary ? `<div class="th-reminder-summary"><div>${escapeWidgetHtml(book.summary)}</div></div>` : ''}
      ${buildBookPagination(pages, safePageIndex)}
      <div class="th-book-page-title">${escapeWidgetHtml(currentPage.title)}</div>
      <div class="th-book-main-body">${renderMarkdownContent(currentPage.content || '（暂无内容）')}</div>
    </article>
  `;
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
        <label class="th-agenda-toggle"><input type="checkbox" data-action="agenda-toggle-archived" ${showArchived ? 'checked' : ''} />显示归档事件</label>
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
                    return `<article class="${classes.join(' ')}" data-action="open-agenda-item-date" data-date-key="${escapeWidgetHtml(item.dateKey)}"><div class="th-item-top"><div class="th-item-title-wrap"><div class="th-item-title">${escapeWidgetHtml(item.title)}</div>${buildEditingFlag(item.id, editingEventId)}</div>${actionButtons}</div>${item.stageTitle ? `<div class="th-item-stage">${escapeWidgetHtml(item.stageTitle)}</div>` : ''}<div class="th-item-time">${escapeWidgetHtml(item.startText || '未填写')} ${item.endText ? `~ ${escapeWidgetHtml(item.endText)}` : ''}</div><div class="th-item-summary">${escapeWidgetHtml(item.summary || '（无详情）')}</div>${tags}</article>`;
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
}): string {
  const {
    selectedLabel,
    selectedItems,
    openedBook,
    openedBookPageIndex,
    booksById,
    editingEventId,
    renderMarkdownContent,
  } = options;
  if (openedBook) {
    const pages = parseCalendarBookPages(openedBook);
    const safePageIndex = Math.min(Math.max(openedBookPageIndex, 0), pages.length - 1);
    const currentPage = pages[safePageIndex];
    return `<article class="th-detail-card is-book-reader"><div class="th-book-reader-head"><div><div class="th-item-title">${escapeWidgetHtml(openedBook.title)}</div><div class="th-detail-meta">读物详情</div></div><button type="button" class="th-book-link" data-action="close-book-reader">返回日期详情</button></div>${openedBook.summary ? `<div class="th-detail-summary">${escapeWidgetHtml(openedBook.summary)}</div>` : ''}${buildBookPagination(pages, safePageIndex)}<div class="th-book-page-title">${escapeWidgetHtml(currentPage.title)}</div><div class="th-book-reader-body">${renderMarkdownContent(currentPage.content || '（暂无内容）')}</div></article>`;
  }
  const heading = `
    <div class="th-side-section-head">
      <div class="th-side-section-title">${escapeWidgetHtml(selectedLabel || '日期详情')}</div>
    </div>
  `;
  if (!selectedItems.length) {
    return `<section class="th-side-section">${heading}<div class="th-empty">这一天暂时没有命中的事件。</div></section>`;
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
      return `<article class="${classes.join(' ')}"><div class="th-item-top"><div class="th-item-title-wrap"><div class="th-item-title">${escapeWidgetHtml(item.title)}</div>${buildEditingFlag(item.id, editingEventId)}</div>${buildItemActionButtons(item)}</div>${item.stageTitle ? `<div class="th-item-stage">${escapeWidgetHtml(item.stageTitle)}</div>` : ''}<div class="th-detail-meta">${escapeWidgetHtml(item.type)} · ${escapeWidgetHtml(item.startText || '未填写')}${item.endText ? ` ~ ${escapeWidgetHtml(item.endText)}` : ''}</div><div class="th-detail-summary">${escapeWidgetHtml(item.summary || '（无详情）')}</div>${tags}${books ? `<div class="th-detail-books">${books}</div>` : ''}</article>`;
    })
    .join('');
  return `<section class="th-side-section">${heading}${cards}</section>`;
}

import { formatDateLabel } from './date';
import type { DailyAgendaGroup, MonthDayCell, SelectedDayDetail } from './types';

function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function renderFormHtml(args: {
  nowText: string;
  titleCandidates: string[];
  idCandidates: string[];
  tagCandidates: string[];
  values?: {
    type?: string;
    id?: string;
    title?: string;
    tags?: string;
    content?: string;
    start?: string;
    end?: string;
    rule?: string;
  };
  editing?: boolean;
}): string {
  const values = args.values ?? {};
  return `
    <section class="th-calendar-section">
      <div class="th-section-title-row">
        <div>
          <div class="th-section-title">${args.editing ? '编辑事件' : '新增事件'}</div>
          <div class="th-section-subtitle">当前世界时间：${escapeHtml(args.nowText || '未读取到')}</div>
        </div>
      </div>
      <div class="th-form-shell">
        <div class="th-form-field">
          <label>类型</label>
          <select data-form-field="type">
            <option value="临时" ${values.type === '重复' ? '' : 'selected'}>临时</option>
            <option value="重复" ${values.type === '重复' ? 'selected' : ''}>重复</option>
          </select>
        </div>
        <div class="th-form-field">
          <label>ID</label>
          <input data-form-field="id" value="${escapeHtml(values.id || '')}" placeholder="例如 quest_01" />
        </div>
        <div class="th-form-field">
          <label>标题</label>
          <input data-form-field="title" value="${escapeHtml(values.title || '')}" placeholder="事件标题" />
        </div>
        <div class="th-form-field">
          <label>标签</label>
          <input data-form-field="tags" value="${escapeHtml(values.tags || '')}" placeholder="例如 主线, 比赛" />
        </div>
        <div class="th-form-field">
          <label>内容</label>
          <textarea data-form-field="content" rows="4" placeholder="详细描述、备忘信息">${escapeHtml(values.content || '')}</textarea>
        </div>
        <div class="th-form-field">
          <label>时间</label>
          <input data-form-field="start" value="${escapeHtml(values.start || '')}" placeholder="完整世界时间或 04-15" />
        </div>
        <div class="th-form-field">
          <label>结束时间</label>
          <input data-form-field="end" value="${escapeHtml(values.end || '')}" placeholder="可留空" />
        </div>
        <div class="th-form-field">
          <label>重复规则</label>
          <select data-form-field="rule">
            ${['无', '每天', '每周', '每月', '每年', '仅工作日', '仅节假日']
              .map(
                rule =>
                  `<option value="${escapeHtml(rule)}" ${values.rule === rule ? 'selected' : rule === '无' && !values.rule ? 'selected' : ''}>${escapeHtml(rule)}</option>`,
              )
              .join('')}
          </select>
        </div>
        <div class="th-card-actions">
          <button type="button" class="th-btn" data-action="fill-now-time">现在</button>
          <button type="button" class="th-btn" data-action="save-form">${args.editing ? '保存修改' : '新增事件'}</button>
          <button type="button" class="th-btn" data-action="cancel-form">取消</button>
        </div>
      </div>
    </section>
  `;
}

export function buildSelectedDayDetail(args: {
  dateKey: string;
  cells: MonthDayCell[];
  agendaGroups: DailyAgendaGroup[];
}): SelectedDayDetail {
  return {
    dateKey: args.dateKey,
    monthCell: args.cells.find(cell => cell.key === args.dateKey),
    agenda: args.agendaGroups.find(group => group.dateKey === args.dateKey) ?? null,
  };
}

export function fallbackDateLabel(dateKey: string): string {
  const match = dateKey.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) {
    return dateKey;
  }
  return formatDateLabel({
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
  });
}

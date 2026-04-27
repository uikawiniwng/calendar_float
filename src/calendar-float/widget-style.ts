import { ROOT_ID, STYLE_ID } from './constants';

export function ensureCalendarWidgetStyle(hostDocument: Document): void {
  if (!hostDocument || hostDocument.getElementById(STYLE_ID)) {
    return;
  }

  const style = hostDocument.createElement('style');
  style.id = STYLE_ID;
  style.setAttribute('script_id', getScriptId());
  style.textContent = `
    #${ROOT_ID} {
      position: fixed;
      inset: 0;
      z-index: 99999;
      pointer-events: none;
      font-family: "Noto Sans SC", "Microsoft YaHei", sans-serif;
      color: #2b241c;
    }

    #${ROOT_ID} * { box-sizing: border-box; }

    #${ROOT_ID} .th-calendar-ball {
      position: fixed;
      right: 18px;
      top: 32vh;
      width: 56px;
      height: 56px;
      border: 1px solid rgba(147, 112, 51, 0.45);
      border-radius: 18px;
      background: rgba(233, 211, 171, 0.86);
      color: #4c3820;
      box-shadow: 0 14px 30px rgba(68, 44, 20, 0.18);
      backdrop-filter: blur(10px);
      pointer-events: auto;
      cursor: pointer;
      font-size: 26px;
      z-index: 2;
    }

    #${ROOT_ID} .th-calendar-ball::after {
      content: '';
      position: absolute;
      top: 8px;
      right: 8px;
      width: 10px;
      height: 10px;
      border-radius: 999px;
      background: #d84b52;
      opacity: 0;
      transform: scale(0.7);
      transition: opacity 160ms ease, transform 160ms ease;
    }

    #${ROOT_ID}[data-has-upcoming='true'] .th-calendar-ball::after {
      opacity: 1;
      transform: scale(1);
    }

    #${ROOT_ID} .th-calendar-panel {
      position: fixed;
      left: 5vw;
      top: 4vh;
      width: min(1280px, calc(100vw - 72px));
      height: min(840px, calc(100vh - 72px));
      border-radius: 28px;
      border: 1px solid rgba(155, 128, 84, 0.22);
      background: rgba(242, 234, 220, 0.94);
      color: #2c241b;
      box-shadow: 0 28px 60px rgba(56, 38, 20, 0.24);
      display: none;
      pointer-events: auto;
      overflow: hidden;
      padding: 16px;
      backdrop-filter: blur(10px);
    }

    #${ROOT_ID}[data-open='true'] .th-calendar-panel { display: block; }

    #${ROOT_ID} .th-calendar-shell {
      display: grid;
      grid-template-columns: minmax(0, 1.35fr) minmax(320px, 0.82fr);
      gap: 16px;
      height: 100%;
    }

    #${ROOT_ID}[data-reading-book='true'] .th-calendar-shell {
      grid-template-columns: minmax(0, 1fr);
    }

    #${ROOT_ID}[data-reading-book='true'] .th-calendar-side {
      display: none;
    }

    #${ROOT_ID} .th-calendar-main,
    #${ROOT_ID} .th-calendar-side {
      min-height: 0;
      overflow: hidden;
    }

    #${ROOT_ID} .th-calendar-main {
      display: grid;
      grid-template-rows: auto 1fr;
      background: rgba(255, 252, 246, 0.96);
      border: 1px solid rgba(155, 128, 84, 0.14);
      border-radius: 22px;
      overflow: hidden;
      min-width: 0;
    }

    #${ROOT_ID} .th-main-head {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      gap: 16px;
      min-height: 74px;
      padding: 18px 128px 18px 22px;
      border-bottom: 1px solid rgba(155, 128, 84, 0.12);
      background: linear-gradient(180deg, rgba(255,255,255,0.92), rgba(255,249,240,0.82));
      cursor: move;
      user-select: none;
      position: relative;
    }

    #${ROOT_ID} .th-main-head * { user-select: none; }
    #${ROOT_ID} .th-main-head-copy {
      min-width: 0;
      display: flex;
      align-items: center;
      gap: 14px;
      flex-wrap: wrap;
    }

    #${ROOT_ID} .th-connectivity-button {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      min-height: 34px;
      padding: 7px 12px;
      border: 1px solid rgba(155, 128, 84, 0.28);
      border-radius: 999px;
      background: rgba(255, 252, 246, 0.92);
      color: #5a4734;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.01em;
      box-shadow: inset 0 1px 0 rgba(255,255,255,0.72);
      cursor: pointer;
      transition: 140ms ease;
    }

    #${ROOT_ID} .th-connectivity-button:hover {
      background: #fff7ea;
      transform: translateY(-1px);
    }

    #${ROOT_ID} .th-connectivity-button:disabled {
      cursor: progress;
      opacity: 0.72;
      transform: none;
    }

    #${ROOT_ID} .th-connectivity-dot {
      width: 10px;
      height: 10px;
      border-radius: 999px;
      background: #b7a894;
      box-shadow: 0 0 0 3px rgba(183, 168, 148, 0.18);
      flex: 0 0 auto;
    }

    #${ROOT_ID} .th-connectivity-text {
      white-space: nowrap;
      line-height: 1.2;
    }

    #${ROOT_ID} .th-connectivity-button[data-state='ready'],
    #${ROOT_ID} .th-connectivity-button[data-state='recreated'] {
      border-color: rgba(80, 150, 102, 0.34);
      color: #275c3a;
      background: rgba(237, 249, 240, 0.94);
    }

    #${ROOT_ID} .th-connectivity-button[data-state='ready'] .th-connectivity-dot,
    #${ROOT_ID} .th-connectivity-button[data-state='recreated'] .th-connectivity-dot {
      background: #4ea36a;
      box-shadow: 0 0 0 3px rgba(78, 163, 106, 0.18);
    }

    #${ROOT_ID} .th-connectivity-button[data-state='missing'],
    #${ROOT_ID} .th-connectivity-button[data-state='checking'] {
      border-color: rgba(191, 143, 68, 0.34);
      color: #8a5a16;
      background: rgba(255, 246, 228, 0.96);
    }

    #${ROOT_ID} .th-connectivity-button[data-state='missing'] .th-connectivity-dot,
    #${ROOT_ID} .th-connectivity-button[data-state='checking'] .th-connectivity-dot {
      background: #d39b33;
      box-shadow: 0 0 0 3px rgba(211, 155, 51, 0.18);
    }

    #${ROOT_ID} .th-connectivity-button[data-state='error'] {
      border-color: rgba(196, 91, 91, 0.36);
      color: #8f2f2f;
      background: rgba(255, 238, 238, 0.96);
    }

    #${ROOT_ID} .th-connectivity-button[data-state='error'] .th-connectivity-dot {
      background: #d65b5b;
      box-shadow: 0 0 0 3px rgba(214, 91, 91, 0.18);
    }

    #${ROOT_ID} .th-main-title { font-size: 22px; font-weight: 800; letter-spacing: 0.01em; color: #3b2d1f; white-space: nowrap; }
    #${ROOT_ID} .th-main-subtitle { display: none; }
    #${ROOT_ID} .th-month-subtitle,
    #${ROOT_ID} .th-side-subtitle,
    #${ROOT_ID} .th-side-section-subtitle,
    #${ROOT_ID} .th-form-editing-notice,
    #${ROOT_ID} .th-agenda-toolbar-tip,
    #${ROOT_ID} .th-reminder-summary {
      display: none;
    }
    #${ROOT_ID} .th-main-actions,
    #${ROOT_ID} .th-month-actions,
    #${ROOT_ID} .th-sidebar-tabs,
    #${ROOT_ID} .th-card-actions,
    #${ROOT_ID} .th-inline-books,
    #${ROOT_ID} .th-detail-books,
    #${ROOT_ID} .th-window-actions { display: flex; gap: 8px; flex-wrap: wrap; }

    #${ROOT_ID} .th-main-actions {
      margin-left: auto;
      display: flex;
      align-items: center;
      padding-right: 8px;
    }
    #${ROOT_ID} .th-card-actions--icon {
      margin-left: auto;
      align-items: center;
      justify-content: flex-end;
      gap: 6px;
      flex-wrap: nowrap;
      flex: 0 0 auto;
    }
    #${ROOT_ID} .th-icon-btn {
      width: 34px;
      height: 34px;
      min-width: 34px;
      padding: 0;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 15px;
      line-height: 1;
      border-radius: 999px;
      box-shadow: inset 0 1px 0 rgba(255,255,255,0.18);
    }
    #${ROOT_ID} .th-window-actions {
      position: absolute;
      top: 16px;
      right: 16px;
      align-items: center;
      gap: 6px;
      flex-wrap: nowrap;
      z-index: 5;
    }
    #${ROOT_ID} .th-window-actions .th-btn {
      width: 34px;
      height: 34px;
      min-width: 34px;
      padding: 0;
      font-size: 16px;
      line-height: 1;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 10px;
    }
    #${ROOT_ID} .th-fab-add {
      position: absolute;
      right: 18px;
      bottom: 18px;
      width: 58px;
      height: 58px;
      border: 1px solid rgba(191, 143, 68, 0.38);
      border-radius: 999px;
      background: rgba(243, 223, 181, 0.98);
      color: #74480f;
      box-shadow: 0 16px 28px rgba(56, 38, 20, 0.18);
      display: none;
      align-items: center;
      justify-content: center;
      font-size: 34px;
      line-height: 1;
      padding: 0;
      z-index: 4;
    }

    #${ROOT_ID} .th-btn,
    #${ROOT_ID} .th-book-link,
    #${ROOT_ID} .th-form-shell input,
    #${ROOT_ID} .th-form-shell select,
    #${ROOT_ID} .th-form-shell textarea {
      border: 1px solid rgba(155, 128, 84, 0.26);
      background: rgba(255, 252, 246, 0.98);
      border-radius: 12px;
      color: #3a2d20;
      font: inherit;
    }

    #${ROOT_ID} .th-btn,
    #${ROOT_ID} .th-book-link {
      padding: 8px 12px;
      cursor: pointer;
      transition: 140ms ease;
      color: #4f3a26;
      font-weight: 700;
    }

    #${ROOT_ID} .th-btn:hover,
    #${ROOT_ID} .th-book-link:hover { background: #fff7ea; }
    #${ROOT_ID} .th-btn.is-danger,
    #${ROOT_ID} .th-book-link.is-danger { border-color: rgba(180, 70, 60, 0.42); color: #a0382d; }

    #${ROOT_ID} .th-managed-worldbook-dialog-layer {
      position: fixed;
      inset: 0;
      display: none;
      align-items: center;
      justify-content: center;
      padding: 20px;
      pointer-events: none;
      z-index: 12;
    }

    #${ROOT_ID} .th-managed-worldbook-dialog-layer[data-open='true'] {
      display: flex;
      pointer-events: auto;
    }

    #${ROOT_ID} .th-managed-worldbook-dialog-backdrop {
      position: absolute;
      inset: 0;
      background: rgba(33, 24, 16, 0.34);
      backdrop-filter: blur(4px);
    }

    #${ROOT_ID} .th-managed-worldbook-dialog {
      position: relative;
      width: min(520px, calc(100vw - 32px));
      max-height: min(78vh, 720px);
      display: grid;
      gap: 14px;
      padding: 20px;
      border-radius: 20px;
      border: 1px solid rgba(155, 128, 84, 0.22);
      background: rgba(255, 251, 245, 0.98);
      box-shadow: 0 24px 60px rgba(45, 31, 18, 0.28);
      overflow: auto;
    }

    #${ROOT_ID} .th-managed-worldbook-dialog-head {
      display: grid;
      gap: 8px;
    }

    #${ROOT_ID} .th-managed-worldbook-dialog-title {
      font-size: 18px;
      font-weight: 800;
      color: #3b2d1f;
    }

    #${ROOT_ID} .th-managed-worldbook-dialog-desc {
      font-size: 13px;
      line-height: 1.6;
      color: #6d5a45;
    }

    #${ROOT_ID} .th-managed-worldbook-dialog-summary {
      display: grid;
      gap: 8px;
      margin: 0;
      padding: 12px 14px;
      list-style: none;
      border-radius: 16px;
      border: 1px solid rgba(155, 128, 84, 0.16);
      background: rgba(246, 239, 228, 0.78);
    }

    #${ROOT_ID} .th-managed-worldbook-dialog-summary-item {
      font-size: 12px;
      line-height: 1.55;
      color: #564431;
    }

    #${ROOT_ID} .th-managed-worldbook-dialog-actions {
      display: flex;
      gap: 10px;
      justify-content: flex-end;
      flex-wrap: wrap;
    }

    #${ROOT_ID} .th-managed-worldbook-dialog-btn {
      min-width: 96px;
      text-transform: lowercase;
    }

    #${ROOT_ID} [data-role="month-grid"] {
      min-height: 0;
      overflow: auto;
      padding: 14px 16px 16px;
      display: grid;
      grid-template-rows: minmax(0, 1fr);
      grid-auto-rows: minmax(0, 1fr);
      gap: 10px;
      align-content: stretch;
      background: rgba(255, 252, 246, 0.98);
    }

    #${ROOT_ID} .th-reminder-summary {
      display: grid;
      gap: 4px;
      padding: 10px 12px;
      border-radius: 12px;
      background: rgba(255, 246, 228, 0.9);
      border: 1px solid rgba(193, 158, 95, 0.28);
      font-size: 12px;
    }

    #${ROOT_ID} .th-month-header {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      align-items: center;
      gap: 12px;
      padding: 0 4px;
    }

    #${ROOT_ID} .th-month-title { font-size: 22px; font-weight: 800; color: #3c2f22; }
    #${ROOT_ID} .th-month-subtitle { font-size: 13px; color: #7a6a58; margin-top: 4px; }
    #${ROOT_ID} .th-month-actions {
      align-items: center;
      justify-content: flex-end;
      flex-wrap: nowrap;
    }
    #${ROOT_ID} .th-month-actions .th-btn {
      min-width: 84px;
      padding-inline: 14px;
    }

    #${ROOT_ID} .th-month-view {
      display: grid;
      grid-template-rows: auto minmax(0, 1fr);
      min-height: 100%;
      gap: 10px;
    }

    #${ROOT_ID} .th-month-board {
      border: 1px solid rgba(155, 128, 84, 0.16);
      border-radius: 18px;
      overflow: hidden;
      background: #fffefb;
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.72);
      display: grid;
      grid-template-rows: auto minmax(0, 1fr);
      min-height: 0;
      height: 100%;
    }

    #${ROOT_ID} .th-week-head {
      display: grid;
      grid-template-columns: repeat(7, minmax(0, 1fr));
      border-bottom: 1px solid rgba(155, 128, 84, 0.14);
      background: #fbf6ec;
    }

    #${ROOT_ID} .th-week-head > div {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 38px;
      padding: 0 8px;
      text-align: center;
      font-size: 12px;
      font-weight: 700;
      color: #7d6b58;
      border-right: 1px solid rgba(155, 128, 84, 0.12);
    }

    #${ROOT_ID} .th-week-head > div:last-child { border-right: 0; }
    #${ROOT_ID} .th-month-grid {
      display: grid;
      grid-auto-rows: minmax(0, 1fr);
      min-height: 0;
      height: 100%;
    }

    #${ROOT_ID} .th-week-block {
      position: relative;
      --th-week-chip-rows: 1;
      border-bottom: 1px solid rgba(155, 128, 84, 0.12);
      background: #fffefb;
      min-height: 0;
      display: grid;
    }

    #${ROOT_ID} .th-week-block:last-child { border-bottom: 0; }

    #${ROOT_ID} .th-week-days {
      display: grid;
      grid-template-columns: repeat(7, minmax(0, 1fr));
      min-height: calc(26px + var(--th-week-chip-rows) * 18px + 8px);
      height: 100%;
      position: relative;
      z-index: 1;
    }

    #${ROOT_ID} .th-day-cell {
      border-right: 1px solid rgba(155, 128, 84, 0.12);
      border-top: 1px solid rgba(155, 128, 84, 0.08);
      background: #fffefb;
      min-height: 82px;
      padding: 6px 5px 5px;
      text-align: left;
      cursor: pointer;
      border-radius: 0;
      box-shadow: none;
      position: relative;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    #${ROOT_ID} .th-day-cell:last-child { border-right: 0; }
    #${ROOT_ID} .th-day-cell.is-muted { background: #f6f1e7; color: #b3a392; }
    #${ROOT_ID} .th-day-cell.is-selected { background: #fff6e8; }
    #${ROOT_ID} .th-day-cell.is-today { box-shadow: inset 0 0 0 2px rgba(191, 143, 68, 0.45); }
    #${ROOT_ID} .th-day-head { display: flex; align-items: center; justify-content: center; margin-bottom: 0; }
    #${ROOT_ID} .th-day-number { display: block; width: 100%; text-align: center; font-size: 16px; font-weight: 700; line-height: 1; color: #564431; }
    #${ROOT_ID} .th-day-cell.is-muted .th-day-number { color: #b8aa99; }
    #${ROOT_ID} .th-day-meta {
      position: relative;
      flex: 1 1 auto;
      min-height: 0;
    }
    #${ROOT_ID} .th-week-chip-grid {
      position: absolute;
      left: 0;
      right: 0;
      top: 28px;
      display: grid;
      grid-template-columns: repeat(7, minmax(0, 1fr));
      grid-auto-rows: 16px;
      row-gap: 2px;
      align-content: start;
      pointer-events: none;
      z-index: 3;
    }
    #${ROOT_ID} .th-chip {
      display: flex;
      align-items: center;
      border-radius: 8px;
      padding: 4px 7px;
      font-size: 11px;
      font-weight: 600;
      line-height: 1.25;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 100%;
      position: relative;
      z-index: 2;
    }

    #${ROOT_ID} .th-chip.is-continue-left {
      width: calc(100% + 9px);
      margin-left: -9px;
      padding-left: 12px;
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;
    }

    #${ROOT_ID} .th-chip.is-continue-right {
      width: calc(100% + 9px);
      margin-right: -9px;
      padding-right: 12px;
      border-top-right-radius: 0;
      border-bottom-right-radius: 0;
    }

    #${ROOT_ID} .th-chip.is-continue-left.is-continue-right {
      width: calc(100% + 18px);
      border-radius: 0;
    }

    #${ROOT_ID} .th-week-chip-bar {
      margin: 0 6px;
      z-index: 4;
    }
    #${ROOT_ID} .th-chip.is-festival { background: #ffe6a6; color: #895710; border: 1px solid rgba(201, 145, 40, 0.24); }
    #${ROOT_ID} .th-chip.is-user { background: #dcecff; color: #305d97; border: 1px solid rgba(95, 148, 216, 0.22); }
    #${ROOT_ID} .th-chip.is-archived { background: #e8e1db; color: #6d5745; border: 1px solid rgba(122, 98, 74, 0.16); }
    #${ROOT_ID} .th-overflow {
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      font-size: 11px;
      color: #7b6954;
      font-weight: 700;
    }

    #${ROOT_ID} .th-calendar-side {
      border: 1px solid rgba(155, 128, 84, 0.14);
      border-radius: 22px;
      background: linear-gradient(180deg, rgba(248, 241, 229, 0.98), rgba(243, 236, 222, 0.98));
      display: grid;
      grid-template-rows: auto auto minmax(0, 1fr);
      overflow: hidden;
    }

    #${ROOT_ID} .th-side-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      min-height: 74px;
      padding: 18px;
      border-bottom: 1px solid rgba(155, 128, 84, 0.12);
      background: rgba(255, 250, 242, 0.82);
    }
    #${ROOT_ID} .th-side-head-copy {
      min-width: 0;
      display: grid;
      gap: 4px;
    }
    #${ROOT_ID} .th-side-title { font-size: 16px; font-weight: 800; color: #403122; }
    #${ROOT_ID} .th-side-subtitle { font-size: 12px; color: #776654; margin-top: 4px; }
    #${ROOT_ID} .th-primary-btn {
      background: #f3dfb5;
      border-color: rgba(191, 143, 68, 0.4);
      color: #74480f;
      box-shadow: inset 0 1px 0 rgba(255,255,255,0.65);
      white-space: nowrap;
    }

    #${ROOT_ID} .th-sidebar-tabs {
      padding: 12px 18px 12px;
      background: transparent;
      align-items: center;
      justify-content: space-between;
      flex-wrap: nowrap;
      gap: 10px;
    }

    #${ROOT_ID} .th-tab-button {
      border: 1px solid rgba(155, 128, 84, 0.28);
      background: rgba(255,255,255,0.9);
      border-radius: 999px;
      padding: 8px 14px;
      min-height: 40px;
      cursor: pointer;
      font: inherit;
      color: #52402f;
      font-weight: 700;
      box-shadow: inset 0 1px 0 rgba(255,255,255,0.78), 0 6px 14px rgba(95, 70, 40, 0.06);
    }

    #${ROOT_ID} .th-tab-button.is-active { background: #fff4db; border-color: rgba(191, 143, 68, 0.48); color: #8a5a16; }
    #${ROOT_ID} .th-tab-add-button {
      width: 40px;
      height: 40px;
      min-width: 40px;
      margin-left: auto;
      padding: 0;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 999px;
      font-size: 24px;
      line-height: 1;
      box-shadow: inset 0 1px 0 rgba(255,255,255,0.78), 0 6px 14px rgba(95, 70, 40, 0.08);
    }
    #${ROOT_ID} .th-tab-add-button.is-active {
      background: #fff0cf;
      border-color: rgba(191, 143, 68, 0.52);
      color: #8a5a16;
      box-shadow: 0 0 0 2px rgba(191, 143, 68, 0.14), 0 6px 14px rgba(95, 70, 40, 0.08);
    }
    #${ROOT_ID} .th-mobile-side-close {
      display: none;
      width: 32px;
      height: 32px;
      min-width: 32px;
      padding: 0;
      border-radius: 10px;
      align-items: center;
      justify-content: center;
    }

    #${ROOT_ID} .th-side-body { min-height: 0; overflow: auto; padding: 16px 18px 18px; }
    #${ROOT_ID} .th-side-panel { display: none; }
    #${ROOT_ID} .th-side-section {
      display: grid;
      gap: 12px;
    }
    #${ROOT_ID} .th-side-section-head {
      display: grid;
      gap: 4px;
      padding: 2px 2px 4px;
    }
    #${ROOT_ID} .th-side-section-title {
      font-size: 14px;
      font-weight: 800;
      color: #443425;
    }
    #${ROOT_ID} .th-side-section-subtitle {
      font-size: 12px;
      color: #7a6a58;
      line-height: 1.5;
    }
    #${ROOT_ID} .th-agenda-toolbar {
      display: grid;
      gap: 10px;
      margin-bottom: 12px;
      padding: 12px;
      border-radius: 14px;
      border: 1px solid rgba(155, 128, 84, 0.14);
      background: rgba(255,255,255,0.72);
    }
    #${ROOT_ID} .th-agenda-toolbar-row {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      align-items: center;
    }
    #${ROOT_ID} .th-agenda-toolbar input,
    #${ROOT_ID} .th-agenda-toolbar select {
      min-width: 0;
      flex: 1 1 150px;
      padding: 8px 10px;
      border-radius: 10px;
      border: 1px solid rgba(155, 128, 84, 0.22);
      background: rgba(255,255,255,0.96);
      color: #3a2d20;
      font: inherit;
    }
    #${ROOT_ID} .th-agenda-toggle {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: #6e604f;
      white-space: nowrap;
    }
    #${ROOT_ID} .th-agenda-toolbar-tip {
      font-size: 12px;
      color: #7a6a58;
    }
    #${ROOT_ID}[data-tab='agenda'] .th-side-panel.is-agenda,
    #${ROOT_ID}[data-tab='detail'] .th-side-panel.is-detail,
    #${ROOT_ID}[data-tab='form'] .th-side-panel.is-form { display: block; }

    #${ROOT_ID} .th-agenda-groups { display: grid; gap: 12px; }
    #${ROOT_ID} .th-agenda-group,
    #${ROOT_ID} .th-detail-card {
      display: grid;
      gap: 8px;
      padding: 14px;
      border-radius: 16px;
      border: 1px solid rgba(155, 128, 84, 0.16);
      background: rgba(255,255,255,0.86);
      box-shadow: 0 8px 20px rgba(95, 70, 40, 0.05);
    }

    #${ROOT_ID} .th-agenda-date { font-weight: 800; color: #4c3a29; }
    #${ROOT_ID} .th-agenda-item,
    #${ROOT_ID} .th-detail-card {
      --th-card-accent: #ffe6a6;
      --th-card-accent-soft: #ffe6a6;
      --th-card-accent-border: rgba(201, 145, 40, 0.24);
      --th-card-accent-strong: #895710;
      overflow: hidden;
    }
    #${ROOT_ID} .th-agenda-item {
      display: grid;
      gap: 6px;
      padding: 12px;
      border-radius: 14px;
      border: 1px solid rgba(155, 128, 84, 0.18);
      background: rgba(255,255,255,0.94);
    }

    #${ROOT_ID} .th-agenda-item.is-festival,
    #${ROOT_ID} .th-detail-card.is-festival {
      --th-card-accent: #ffe6a6;
      --th-card-accent-soft: #ffe6a6;
      --th-card-accent-border: rgba(201, 145, 40, 0.24);
      --th-card-accent-strong: #895710;
    }
    #${ROOT_ID} .th-agenda-item.is-active,
    #${ROOT_ID} .th-detail-card.is-active {
      --th-card-accent: #dcecff;
      --th-card-accent-soft: #dcecff;
      --th-card-accent-border: rgba(95, 148, 216, 0.22);
      --th-card-accent-strong: #305d97;
    }
    #${ROOT_ID} .th-agenda-item.is-archive,
    #${ROOT_ID} .th-detail-card.is-archive {
      --th-card-accent: #e8e1db;
      --th-card-accent-soft: #e8e1db;
      --th-card-accent-border: rgba(122, 98, 74, 0.16);
      --th-card-accent-strong: #6d5745;
    }
    #${ROOT_ID} .th-agenda-item.is-editing,
    #${ROOT_ID} .th-detail-card.is-editing {
      border-color: rgba(208, 146, 89, 0.52);
      box-shadow: 0 0 0 2px rgba(208, 146, 89, 0.18), 0 10px 24px rgba(0, 0, 0, 0.12);
    }
    #${ROOT_ID} .th-item-top {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 8px;
      margin: -12px -12px 0;
      padding: 12px 12px 10px;
      border-bottom: 1px solid var(--th-card-accent-border);
      background: var(--th-card-accent-soft);
    }
    #${ROOT_ID} .th-item-title-wrap { display: grid; gap: 4px; min-width: 0; }
    #${ROOT_ID} .th-item-title { font-weight: 800; color: var(--th-card-accent-strong); }
    #${ROOT_ID} .th-card-actions--icon .th-icon-btn {
      border-color: var(--th-card-accent-border);
      color: var(--th-card-accent-strong);
      background: rgba(255,255,255,0.58);
    }
    #${ROOT_ID} .th-card-actions--icon .th-icon-btn:hover {
      background: rgba(255,255,255,0.78);
    }
    #${ROOT_ID} .th-card-actions--icon .th-icon-btn.is-danger {
      color: #e18f7d;
      border-color: rgba(225, 143, 125, 0.36);
    }
    #${ROOT_ID} .th-item-editing-flag {
      display: inline-flex;
      align-items: center;
      width: fit-content;
      padding: 2px 8px;
      border-radius: 999px;
      background: rgba(95, 148, 216, 0.14);
      border: 1px solid rgba(95, 148, 216, 0.34);
      color: #28558c;
      font-size: 11px;
      font-weight: 700;
    }
    #${ROOT_ID} .th-item-stage { font-size: 11px; color: #7b6954; }
    #${ROOT_ID} .th-item-time,
    #${ROOT_ID} .th-detail-meta { font-size: 12px; color: #6e604f; }
    #${ROOT_ID} .th-item-summary,
    #${ROOT_ID} .th-detail-summary { font-size: 13px; line-height: 1.6; }
    #${ROOT_ID} .th-item-tags { display: flex; gap: 6px; flex-wrap: wrap; }
    #${ROOT_ID} .th-item-tags span { border-radius: 999px; background: #f0e7d9; padding: 2px 8px; font-size: 11px; }
    #${ROOT_ID} .th-detail-card.is-book-reader { gap: 12px; }
    #${ROOT_ID} .th-book-main-card {
      display: grid;
      grid-template-rows: auto auto minmax(0, 1fr);
      gap: 14px;
      min-height: 0;
      height: 100%;
    }
    #${ROOT_ID} .th-book-main-head {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 12px;
    }
    #${ROOT_ID} .th-book-reader-head {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 12px;
    }
    #${ROOT_ID} .th-book-pagination {
      display: grid;
      gap: 10px;
      padding: 10px 12px;
      border: 1px solid rgba(155, 128, 84, 0.14);
      border-radius: 14px;
      background: rgba(255,255,255,0.72);
    }
    #${ROOT_ID} .th-book-pagination-main {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      flex-wrap: wrap;
    }
    #${ROOT_ID} .th-book-pagination-status {
      font-size: 12px;
      font-weight: 700;
      color: #6f5c49;
    }
    #${ROOT_ID} .th-book-page-tabs {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
    #${ROOT_ID} .th-book-page-tab {
      border: 1px solid rgba(155, 128, 84, 0.22);
      background: rgba(255,255,255,0.92);
      border-radius: 999px;
      padding: 6px 12px;
      color: #564431;
      font: inherit;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
      transition: 140ms ease;
    }
    #${ROOT_ID} .th-book-page-tab:hover {
      background: #fff7ea;
    }
    #${ROOT_ID} .th-book-page-tab.is-active {
      background: #fff0cf;
      border-color: rgba(191, 143, 68, 0.42);
      color: #8a5a16;
    }
    #${ROOT_ID} .th-book-page-title {
      font-size: 16px;
      font-weight: 800;
      color: #443425;
    }
    #${ROOT_ID} .th-book-main-body,
    #${ROOT_ID} .th-book-reader-body {
      font-size: 14px;
      line-height: 1.75;
      color: #372b1f;
      overflow-wrap: anywhere;
      overflow: auto;
      min-height: 0;
      padding-right: 8px;
    }
    #${ROOT_ID} .th-book-reader-body > :first-child { margin-top: 0; }
    #${ROOT_ID} .th-book-reader-body > :last-child { margin-bottom: 0; }
    #${ROOT_ID} .th-book-reader-body h1,
    #${ROOT_ID} .th-book-reader-body h2,
    #${ROOT_ID} .th-book-reader-body h3,
    #${ROOT_ID} .th-book-reader-body h4,
    #${ROOT_ID} .th-book-reader-body h5,
    #${ROOT_ID} .th-book-reader-body h6 {
      margin: 1.1em 0 0.45em;
      line-height: 1.35;
      color: #34281d;
    }
    #${ROOT_ID} .th-book-reader-body p,
    #${ROOT_ID} .th-book-reader-body ul,
    #${ROOT_ID} .th-book-reader-body ol,
    #${ROOT_ID} .th-book-reader-body blockquote,
    #${ROOT_ID} .th-book-reader-body pre {
      margin: 0.7em 0;
    }
    #${ROOT_ID} .th-book-reader-body ul,
    #${ROOT_ID} .th-book-reader-body ol {
      padding-left: 1.5em;
    }
    #${ROOT_ID} .th-book-reader-body blockquote {
      margin-left: 0;
      padding: 10px 12px;
      border-left: 3px solid rgba(191, 143, 68, 0.42);
      background: rgba(255, 248, 235, 0.85);
      color: #5d4a36;
      border-radius: 10px;
    }
    #${ROOT_ID} .th-book-reader-body code {
      padding: 0.12em 0.38em;
      border-radius: 6px;
      background: rgba(92, 73, 51, 0.08);
      font-family: Consolas, "SFMono-Regular", monospace;
      font-size: 0.92em;
    }
    #${ROOT_ID} .th-book-reader-body pre {
      padding: 12px 14px;
      border-radius: 12px;
      background: #f7f1e6;
      overflow: auto;
    }
    #${ROOT_ID} .th-book-reader-body pre code {
      padding: 0;
      background: transparent;
    }
    #${ROOT_ID} .th-book-reader-body hr {
      border: 0;
      border-top: 1px solid rgba(155, 128, 84, 0.22);
      margin: 1em 0;
    }
    #${ROOT_ID} .th-book-reader-body img {
      max-width: 100%;
      height: auto;
      border-radius: 12px;
    }

    #${ROOT_ID} .th-form-editing-notice {
      margin-bottom: 12px;
      padding: 10px 12px;
      border-radius: 12px;
      background: rgba(223, 238, 255, 0.82);
      border: 1px solid rgba(95, 148, 216, 0.3);
      color: #32567f;
      font-size: 12px;
      line-height: 1.6;
    }
    #${ROOT_ID} .th-form-shell { display: grid; gap: 10px; }
    #${ROOT_ID} .th-form-field { display: grid; gap: 4px; }
    #${ROOT_ID} .th-form-field label { font-size: 12px; color: #6e604f; }
    #${ROOT_ID} .th-form-shell input,
    #${ROOT_ID} .th-form-shell select,
    #${ROOT_ID} .th-form-shell textarea { width: 100%; padding: 10px 12px; }
    #${ROOT_ID} .th-form-shell textarea { resize: vertical; min-height: 100px; }
    #${ROOT_ID} .th-empty {
      padding: 12px;
      border-radius: 12px;
      background: rgba(255,255,255,0.72);
      color: #7e6c58;
      border: 1px dashed rgba(155, 128, 84, 0.2);
    }

    #${ROOT_ID}[data-theme='dark'] {
      color: #e3e9f2;
    }

    #${ROOT_ID}[data-theme='dark'] .th-calendar-ball {
      border-color: rgba(255, 255, 255, 0.14);
      background: rgba(22, 26, 32, 0.96);
      color: #f4f7fb;
      box-shadow: 0 14px 30px rgba(0, 0, 0, 0.5);
    }

    #${ROOT_ID}[data-theme='dark'] .th-calendar-panel {
      border-color: #2a313d;
      background: rgba(15, 19, 24, 0.985);
      color: #e3e9f2;
      box-shadow: 0 30px 64px rgba(0, 0, 0, 0.6);
    }

    #${ROOT_ID}[data-theme='dark'] .th-calendar-main,
    #${ROOT_ID}[data-theme='dark'] .th-calendar-side,
    #${ROOT_ID}[data-theme='dark'] .th-month-board,
    #${ROOT_ID}[data-theme='dark'] .th-week-block,
    #${ROOT_ID}[data-theme='dark'] .th-day-cell,
    #${ROOT_ID}[data-theme='dark'] .th-agenda-group,
    #${ROOT_ID}[data-theme='dark'] .th-detail-card,
    #${ROOT_ID}[data-theme='dark'] .th-agenda-item,
    #${ROOT_ID}[data-theme='dark'] .th-empty,
    #${ROOT_ID}[data-theme='dark'] .th-reminder-summary,
    #${ROOT_ID}[data-theme='dark'] .th-form-shell input,
    #${ROOT_ID}[data-theme='dark'] .th-form-shell select,
    #${ROOT_ID}[data-theme='dark'] .th-form-shell textarea,
    #${ROOT_ID}[data-theme='dark'] .th-btn,
    #${ROOT_ID}[data-theme='dark'] .th-book-link {
      background: #1a2028;
      color: #e3e9f2;
      border-color: #303948;
    }

    #${ROOT_ID}[data-theme='dark'] [data-role="month-grid"],
    #${ROOT_ID}[data-theme='dark'] .th-side-head,
    #${ROOT_ID}[data-theme='dark'] .th-sidebar-tabs,
    #${ROOT_ID}[data-theme='dark'] .th-main-head,
    #${ROOT_ID}[data-theme='dark'] .th-week-head {
      background: #242c37;
      color: #e3e9f2;
      border-color: #303948;
    }

    #${ROOT_ID}[data-theme='dark'] .th-main-title,
    #${ROOT_ID}[data-theme='dark'] .th-month-title,
    #${ROOT_ID}[data-theme='dark'] .th-side-title,
    #${ROOT_ID}[data-theme='dark'] .th-agenda-date,
    #${ROOT_ID}[data-theme='dark'] .th-day-number,
    #${ROOT_ID}[data-theme='dark'] .th-book-reader-body h1,
    #${ROOT_ID}[data-theme='dark'] .th-book-reader-body h2,
    #${ROOT_ID}[data-theme='dark'] .th-book-reader-body h3,
    #${ROOT_ID}[data-theme='dark'] .th-book-reader-body h4,
    #${ROOT_ID}[data-theme='dark'] .th-book-reader-body h5,
    #${ROOT_ID}[data-theme='dark'] .th-book-reader-body h6 {
      color: #f7fafc;
    }

    #${ROOT_ID}[data-theme='dark'] .th-connectivity-button {
      background: #1d2430;
      color: #dbe3ee;
      border-color: #394555;
      box-shadow: inset 0 1px 0 rgba(255,255,255,0.04);
    }

    #${ROOT_ID}[data-theme='dark'] .th-connectivity-button:hover {
      background: #28313e;
    }

    #${ROOT_ID}[data-theme='dark'] .th-connectivity-dot {
      background: #7f8fa3;
      box-shadow: 0 0 0 3px rgba(127, 143, 163, 0.16);
    }

    #${ROOT_ID}[data-theme='dark'] .th-connectivity-button[data-state='ready'],
    #${ROOT_ID}[data-theme='dark'] .th-connectivity-button[data-state='recreated'] {
      background: rgba(44, 86, 61, 0.92);
      color: #e6fff0;
      border-color: rgba(131, 201, 154, 0.28);
    }

    #${ROOT_ID}[data-theme='dark'] .th-connectivity-button[data-state='ready'] .th-connectivity-dot,
    #${ROOT_ID}[data-theme='dark'] .th-connectivity-button[data-state='recreated'] .th-connectivity-dot {
      background: #83c99a;
      box-shadow: 0 0 0 3px rgba(131, 201, 154, 0.16);
    }

    #${ROOT_ID}[data-theme='dark'] .th-connectivity-button[data-state='missing'],
    #${ROOT_ID}[data-theme='dark'] .th-connectivity-button[data-state='checking'] {
      background: rgba(104, 76, 31, 0.92);
      color: #fff1cc;
      border-color: rgba(255, 214, 120, 0.26);
    }

    #${ROOT_ID}[data-theme='dark'] .th-connectivity-button[data-state='missing'] .th-connectivity-dot,
    #${ROOT_ID}[data-theme='dark'] .th-connectivity-button[data-state='checking'] .th-connectivity-dot {
      background: #f0c56e;
      box-shadow: 0 0 0 3px rgba(240, 197, 110, 0.14);
    }

    #${ROOT_ID}[data-theme='dark'] .th-connectivity-button[data-state='error'] {
      background: rgba(101, 41, 41, 0.92);
      color: #ffdede;
      border-color: rgba(255, 160, 160, 0.28);
    }

    #${ROOT_ID}[data-theme='dark'] .th-connectivity-button[data-state='error'] .th-connectivity-dot {
      background: #ff9d9d;
      box-shadow: 0 0 0 3px rgba(255, 157, 157, 0.14);
    }

    #${ROOT_ID}[data-theme='dark'] .th-main-subtitle,
    #${ROOT_ID}[data-theme='dark'] .th-month-subtitle,
    #${ROOT_ID}[data-theme='dark'] .th-side-subtitle,
    #${ROOT_ID}[data-theme='dark'] .th-side-section-subtitle,
    #${ROOT_ID}[data-theme='dark'] .th-item-stage,
    #${ROOT_ID}[data-theme='dark'] .th-item-time,
    #${ROOT_ID}[data-theme='dark'] .th-detail-meta,
    #${ROOT_ID}[data-theme='dark'] .th-overflow,
    #${ROOT_ID}[data-theme='dark'] .th-form-field label,
    #${ROOT_ID}[data-theme='dark'] .th-empty {
      color: #a7b4c4;
    }

    #${ROOT_ID}[data-theme='dark'] .th-item-summary,
    #${ROOT_ID}[data-theme='dark'] .th-detail-summary,
    #${ROOT_ID}[data-theme='dark'] .th-book-main-body,
    #${ROOT_ID}[data-theme='dark'] .th-book-reader-body {
      color: #dbe3ee;
    }

    #${ROOT_ID}[data-theme='dark'] .th-book-pagination {
      background: #171d25;
      border-color: #374353;
    }

    #${ROOT_ID}[data-theme='dark'] .th-book-pagination-status,
    #${ROOT_ID}[data-theme='dark'] .th-book-page-title {
      color: #f0f4fa;
    }

    #${ROOT_ID}[data-theme='dark'] .th-book-page-tab {
      background: #222b36;
      border-color: #3b4859;
      color: #dbe3ee;
    }

    #${ROOT_ID}[data-theme='dark'] .th-book-page-tab:hover {
      background: #2b3442;
    }

    #${ROOT_ID}[data-theme='dark'] .th-book-page-tab.is-active {
      background: #eef3f9;
      border-color: #ffffff;
      color: #16202c;
    }

    #${ROOT_ID}[data-theme='dark'] .th-btn:hover,
    #${ROOT_ID}[data-theme='dark'] .th-book-link:hover {
      background: #2b3442;
    }

    #${ROOT_ID}[data-theme='dark'] .th-managed-worldbook-dialog-backdrop {
      background: rgba(4, 8, 14, 0.6);
    }

    #${ROOT_ID}[data-theme='dark'] .th-managed-worldbook-dialog {
      background: rgba(24, 30, 38, 0.98);
      border-color: #364151;
      box-shadow: 0 28px 72px rgba(0, 0, 0, 0.56);
    }

    #${ROOT_ID}[data-theme='dark'] .th-managed-worldbook-dialog-title {
      color: #f5f8fc;
    }

    #${ROOT_ID}[data-theme='dark'] .th-managed-worldbook-dialog-desc,
    #${ROOT_ID}[data-theme='dark'] .th-managed-worldbook-dialog-summary-item {
      color: #c4cfdb;
    }

    #${ROOT_ID}[data-theme='dark'] .th-managed-worldbook-dialog-summary {
      background: rgba(15, 20, 27, 0.82);
      border-color: #394555;
    }

    #${ROOT_ID}[data-theme='dark'] .th-tab-button {
      background: #2b3440;
      color: #dce3ee;
      border-color: #425062;
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04), 0 8px 18px rgba(0, 0, 0, 0.24);
    }

    #${ROOT_ID}[data-theme='dark'] .th-agenda-toolbar,
    #${ROOT_ID}[data-theme='dark'] .th-agenda-toolbar input,
    #${ROOT_ID}[data-theme='dark'] .th-agenda-toolbar select {
      background: #171d25;
      color: #e3e9f2;
      border-color: #374353;
    }

    #${ROOT_ID}[data-theme='dark'] .th-agenda-toggle,
    #${ROOT_ID}[data-theme='dark'] .th-agenda-toolbar-tip {
      color: #a7b4c4;
    }

    #${ROOT_ID}[data-theme='dark'] .th-tab-button.is-active {
      background: #eef3f9;
      color: #16202c;
      border-color: #ffffff;
      box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.34), 0 10px 22px rgba(0, 0, 0, 0.2);
    }

    #${ROOT_ID}[data-theme='dark'] .th-primary-btn {
      background: #eef3f9;
      color: #16202c;
      border-color: #ffffff;
      box-shadow: 0 10px 22px rgba(0, 0, 0, 0.2);
    }

    #${ROOT_ID}[data-theme='dark'] .th-tab-add-button.is-active {
      background: #eef3f9;
      border-color: #ffffff;
      color: #16202c;
      box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.18), 0 10px 22px rgba(0, 0, 0, 0.24);
    }

    #${ROOT_ID}[data-theme='dark'] .th-fab-add {
      background: #eef3f9;
      color: #16202c;
      border-color: #ffffff;
      box-shadow: 0 20px 34px rgba(0, 0, 0, 0.4);
    }

    #${ROOT_ID}[data-theme='dark'] .th-day-cell.is-muted {
      background: #131820;
      color: #7f8fa3;
    }

    #${ROOT_ID}[data-theme='dark'] .th-day-cell.is-selected {
      background: #202833;
    }

    #${ROOT_ID}[data-theme='dark'] .th-day-cell.is-today {
      box-shadow: inset 0 0 0 2px rgba(238, 243, 249, 0.76);
    }

    #${ROOT_ID}[data-theme='dark'] .th-item-tags span {
      background: #2b3440;
      color: #dce3ee;
    }

    #${ROOT_ID}[data-theme='dark'] .th-book-reader-body blockquote {
      background: #171d25;
      color: #dbe3ee;
      border-left-color: rgba(255, 255, 255, 0.3);
    }

    #${ROOT_ID}[data-theme='dark'] .th-book-reader-body code {
      background: rgba(255, 255, 255, 0.08);
      color: #f3f6fb;
    }

    #${ROOT_ID}[data-theme='dark'] .th-book-reader-body pre {
      background: #0f141a;
      color: #eef3f9;
    }

    #${ROOT_ID}[data-theme='dark'] .th-card-actions--icon .th-icon-btn {
      background: rgba(15, 19, 24, 0.22);
      border-color: rgba(255, 255, 255, 0.14);
      box-shadow: none;
    }

    #${ROOT_ID}[data-theme='dark'] .th-card-actions--icon .th-icon-btn:hover {
      background: rgba(15, 19, 24, 0.34);
    }

    #${ROOT_ID}[data-theme='dark'] .th-card-actions--icon .th-icon-btn.is-danger {
      color: #ffb9b9;
      border-color: rgba(255, 185, 185, 0.28);
    }

    #${ROOT_ID}[data-theme='dark'] .th-chip.is-festival {
      background: #79561f;
      color: #fff1cc;
      border-color: rgba(255, 241, 204, 0.2);
    }

    #${ROOT_ID}[data-theme='dark'] .th-chip.is-user {
      background: #315db0;
      color: #f5f8ff;
      border-color: rgba(245, 248, 255, 0.18);
    }

    #${ROOT_ID}[data-theme='dark'] .th-chip.is-archived {
      background: #5b495f;
      color: #f5eaf6;
      border-color: rgba(245, 234, 246, 0.18);
    }

    #${ROOT_ID}[data-theme='dark'] .th-agenda-item.is-festival,
    #${ROOT_ID}[data-theme='dark'] .th-detail-card.is-festival {
      --th-card-accent: #79561f;
      --th-card-accent-soft: #5c4219;
      --th-card-accent-border: rgba(255, 241, 204, 0.18);
      --th-card-accent-strong: #fff1cc;
    }

    #${ROOT_ID}[data-theme='dark'] .th-agenda-item.is-active,
    #${ROOT_ID}[data-theme='dark'] .th-detail-card.is-active {
      --th-card-accent: #315db0;
      --th-card-accent-soft: #264782;
      --th-card-accent-border: rgba(245, 248, 255, 0.16);
      --th-card-accent-strong: #f5f8ff;
    }

    #${ROOT_ID}[data-theme='dark'] .th-agenda-item.is-archive,
    #${ROOT_ID}[data-theme='dark'] .th-detail-card.is-archive {
      --th-card-accent: #5b495f;
      --th-card-accent-soft: #47394a;
      --th-card-accent-border: rgba(245, 234, 246, 0.16);
      --th-card-accent-strong: #f5eaf6;
    }

    @media (max-width: 980px) {
      #${ROOT_ID} .th-calendar-panel {
        left: 0;
        top: 0;
        width: 100vw;
        width: 100dvw;
        max-width: 100vw;
        max-width: 100dvw;
        height: 100vh;
        height: 100dvh;
        min-height: 100vh;
        min-height: 100dvh;
        max-height: 100vh;
        max-height: 100dvh;
        border-radius: 0;
        padding: 0;
      }

      #${ROOT_ID} .th-calendar-shell {
        position: relative;
        display: block;
        height: 100%;
        min-height: 0;
      }
      #${ROOT_ID} .th-calendar-main,
      #${ROOT_ID} .th-calendar-side {
        border-radius: 0;
        border-left: 0;
        border-right: 0;
        min-height: 0;
      }
      #${ROOT_ID} .th-calendar-main {
        height: 100%;
        grid-template-rows: auto minmax(0, 1fr);
        border-bottom: 0;
      }
      #${ROOT_ID} .th-calendar-side {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        max-height: min(56dvh, 460px);
        grid-template-rows: auto minmax(0, 1fr);
        border-top: 1px solid rgba(155, 128, 84, 0.14);
        border-bottom: 0;
        border-radius: 20px 20px 0 0;
        background: linear-gradient(180deg, rgba(248, 241, 229, 0.98), rgba(243, 236, 222, 0.98));
        transform: translateY(calc(100% + 12px));
        opacity: 0;
        pointer-events: none;
        transition: transform 180ms ease, opacity 180ms ease;
        box-shadow: 0 -18px 36px rgba(56, 38, 20, 0.22);
        z-index: 6;
      }
      #${ROOT_ID}[data-theme='dark'] .th-calendar-side {
        border-top-color: #2a313d;
        background: #1a2028;
        box-shadow: 0 -18px 36px rgba(0, 0, 0, 0.42);
      }
      #${ROOT_ID}[data-mobile-side-open='true'] .th-calendar-side {
        transform: translateY(0);
        opacity: 1;
        pointer-events: auto;
      }
      #${ROOT_ID} .th-side-head {
        padding: 12px 14px 10px;
        border-bottom: 1px solid rgba(155, 128, 84, 0.12);
        align-items: center;
      }
      #${ROOT_ID} .th-sidebar-tabs,
      #${ROOT_ID} .th-side-subtitle {
        display: none;
      }
      #${ROOT_ID} .th-side-title {
        font-size: 15px;
      }
      #${ROOT_ID} .th-mobile-side-close {
        display: inline-flex;
      }
      #${ROOT_ID} .th-side-body {
        padding: 0 12px 88px;
      }
      #${ROOT_ID} .th-main-head {
        cursor: default;
        padding: 12px 14px 10px;
        gap: 10px;
        align-items: flex-start;
      }
      #${ROOT_ID} .th-main-head-copy {
        gap: 8px;
        align-items: flex-start;
      }
      #${ROOT_ID} .th-connectivity-button {
        max-width: calc(100vw - 120px);
        padding: 6px 10px;
        font-size: 11px;
      }
      #${ROOT_ID} .th-connectivity-text {
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      #${ROOT_ID} .th-managed-worldbook-dialog-layer {
        padding: 14px;
        align-items: flex-end;
      }
      #${ROOT_ID} .th-managed-worldbook-dialog {
        width: 100%;
        max-height: min(72dvh, 640px);
        padding: 16px;
        border-radius: 18px 18px 0 0;
      }
      #${ROOT_ID} .th-managed-worldbook-dialog-actions {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
      #${ROOT_ID} .th-managed-worldbook-dialog-btn:last-child:nth-child(3) {
        grid-column: 1 / -1;
      }
      #${ROOT_ID} .th-book-pagination-main {
        align-items: stretch;
      }
      #${ROOT_ID} .th-book-pagination-status {
        width: 100%;
        text-align: center;
      }
      #${ROOT_ID} .th-book-page-tabs {
        gap: 6px;
      }
      #${ROOT_ID} .th-book-page-tab {
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      #${ROOT_ID} .th-main-title {
        font-size: 18px;
      }
      #${ROOT_ID} .th-main-subtitle {
        display: none;
      }
      #${ROOT_ID} .th-main-actions {
        display: flex;
        margin-left: auto;
        padding-right: 42px;
      }
      #${ROOT_ID} .th-view-toggle {
        display: none;
      }
      #${ROOT_ID} .th-window-actions {
        top: 10px;
        right: 10px;
        gap: 4px;
      }
      #${ROOT_ID} .th-window-actions .th-btn {
        width: 32px;
        height: 32px;
        min-width: 32px;
        border-radius: 9px;
      }
      #${ROOT_ID} [data-role="month-grid"] {
        padding: 10px 12px 14px;
        gap: 10px;
      }
      #${ROOT_ID} .th-reminder-summary {
        padding: 8px 10px;
      }
      #${ROOT_ID} .th-month-header {
        grid-template-columns: 1fr;
        gap: 8px;
        align-items: stretch;
      }
      #${ROOT_ID} .th-month-title {
        font-size: 18px;
      }
      #${ROOT_ID} .th-month-subtitle {
        font-size: 12px;
      }
      #${ROOT_ID} .th-month-actions {
        width: 100%;
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 8px;
      }
      #${ROOT_ID} .th-month-actions .th-btn {
        min-width: 0;
        padding: 8px 6px;
        text-align: center;
      }
      #${ROOT_ID} .th-week-head > div {
        padding: 8px 2px;
        text-align: center;
        font-size: 11px;
      }
      #${ROOT_ID} .th-week-days {
        min-height: calc(38px + var(--th-week-chip-rows) * 20px + 18px);
      }
      #${ROOT_ID} .th-day-cell {
        min-height: 88px;
        padding: 7px 4px 5px;
        gap: 5px;
        justify-content: flex-start;
      }
      #${ROOT_ID} .th-day-head {
        justify-content: center;
        align-items: flex-start;
      }
      #${ROOT_ID} .th-day-number { font-size: 17px; }
      #${ROOT_ID} .th-week-chip-grid {
        top: 34px;
        grid-auto-rows: 18px;
        row-gap: 4px;
      }
      #${ROOT_ID} .th-chip {
        font-size: 10px;
        padding: 3px 4px;
        line-height: 1.24;
      }
      #${ROOT_ID} .th-week-chip-bar {
        margin: 0 4px;
      }
      #${ROOT_ID} .th-detail-card,
      #${ROOT_ID} .th-agenda-group {
        padding: 12px;
        border-radius: 14px;
      }
      #${ROOT_ID} .th-form-shell textarea {
        min-height: 88px;
      }
      #${ROOT_ID} .th-fab-add {
        display: inline-flex;
      }
    }
  `;
  hostDocument.head.appendChild(style);
}

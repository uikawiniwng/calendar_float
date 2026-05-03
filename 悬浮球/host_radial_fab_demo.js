$(errorCatched(async () => {
  const HOST_ID = 'mdpoem-radial-fab-host-demo';
  const HOST_STYLE_ID = `${HOST_ID}-style`;
  const POSITION_VAR_KEY = 'mdpoem_radial_fab_host_demo_pos';
  const HOST_GLOBAL_KEY = '__mdpoemFloatingHost__';
  const INSTANCE_KEY = '__mdpoemFloatingHostInstance__';
  const MAX_MODULES = 8;
  const VERSION = 'radial-fab-demo-0.1.0';

  let pdoc;
  let pwin;
  try {
    pdoc = parent && parent.document ? parent.document : document;
    pwin = parent && parent.window ? parent.window : window;
  } catch (error) {
    pdoc = document;
    pwin = window;
  }

  function showToast(level, message, title = 'Radial FAB Demo') {
    try {
      if (typeof toastr?.[level] === 'function') {
        toastr[level](message, title);
        return;
      }
    } catch (error) {
      console.warn('[Radial FAB Demo] toastr 不可用，改用 console 输出', error);
    }

    const prefix = title ? `[${title}] ` : '';
    const logger = level === 'error' ? console.error : level === 'warning' ? console.warn : console.log;
    logger(`${prefix}${message}`);
  }

  pwin[INSTANCE_KEY]?.destroy?.();

  const cleanupTasks = [];
  const modules = [];
  const moduleMap = new Map();

  let destroyed = false;
  let menuOpen = false;
  let dragging = false;
  let moved = false;
  let offsetX = 0;
  let offsetY = 0;
  let suppressClick = false;

  const isMobile = pwin.innerWidth <= 768;
  let pos = isMobile
    ? { x: pwin.innerWidth - 82, y: pwin.innerHeight - 104 }
    : { x: pwin.innerWidth - 104, y: pwin.innerHeight - 132 };

  try {
    const raw = getVariables({ type: 'global' })?.[POSITION_VAR_KEY];
    if (raw) {
      const saved = JSON.parse(raw);
      pos = {
        x: Math.max(10, Math.min(Number(saved.x) || pos.x, pwin.innerWidth - 70)),
        y: Math.max(10, Math.min(Number(saved.y) || pos.y, pwin.innerHeight - 70)),
      };
    }
  } catch (error) {
    console.warn('[Radial FAB Demo] 读取保存位置失败', error);
  }

  const style = pdoc.createElement('style');
  style.id = HOST_STYLE_ID;
  style.textContent = `
    #${HOST_ID} {
      position: fixed !important;
      z-index: 2147483647 !important;
      left: 0;
      top: 0;
      width: 64px;
      height: 64px;
      font-family: 'Microsoft YaHei', 'PingFang SC', sans-serif;
      user-select: none;
      -webkit-user-select: none;
      touch-action: none;
      transform: translateZ(0);
    }

    #${HOST_ID} * { box-sizing: border-box; }

    #${HOST_ID} .fab-main {
      position: absolute;
      inset: 0;
      width: 64px;
      height: 64px;
      border: 0;
      border-radius: 50%;
      background: linear-gradient(135deg, #ff384d, #e9152e 64%, #c80f24);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: grab;
      z-index: 30;
      box-shadow: 0 12px 28px rgba(210, 18, 42, 0.34), 0 6px 18px rgba(0,0,0,0.28);
      transition: transform 0.22s cubic-bezier(.19,1,.22,1), box-shadow 0.2s ease, background 0.2s ease;
      outline: none;
    }

    #${HOST_ID}.is-dragging .fab-main { cursor: grabbing; }

    #${HOST_ID}.menu-open .fab-main {
      transform: rotate(45deg) scale(1.02);
      box-shadow: 0 14px 32px rgba(210, 18, 42, 0.38), 0 0 0 10px rgba(255, 56, 77, 0.08), 0 6px 18px rgba(0,0,0,0.30);
    }

    #${HOST_ID} .fab-main:focus-visible,
    #${HOST_ID} .fab-item:focus-visible {
      box-shadow: 0 0 0 3px rgba(255,255,255,0.82), 0 0 0 7px rgba(88, 121, 255, 0.42), 0 10px 22px rgba(0,0,0,0.25);
    }

    #${HOST_ID} .fab-main-icon {
      position: relative;
      width: 22px;
      height: 22px;
      display: block;
      pointer-events: none;
    }

    #${HOST_ID} .fab-main-icon::before,
    #${HOST_ID} .fab-main-icon::after {
      content: '';
      position: absolute;
      left: 50%;
      top: 50%;
      width: 20px;
      height: 4px;
      border-radius: 999px;
      background: #fff;
      transform: translate(-50%, -50%);
      box-shadow: 0 1px 3px rgba(0,0,0,0.2);
    }

    #${HOST_ID} .fab-main-icon::after {
      transform: translate(-50%, -50%) rotate(90deg);
    }

    #${HOST_ID} .fab-menu {
      position: absolute;
      left: 32px;
      top: 32px;
      width: 0;
      height: 0;
      pointer-events: none;
      z-index: 20;
    }

    #${HOST_ID}.menu-open .fab-menu { pointer-events: auto; }

    #${HOST_ID} .fab-item {
      position: absolute;
      left: 0;
      top: 0;
      width: 40px;
      height: 40px;
      border: 0;
      border-radius: 50%;
      background: linear-gradient(135deg, #5f7dff, #4969ef);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 17px;
      line-height: 1;
      opacity: 0;
      pointer-events: none;
      transform: translate(-50%, -50%) scale(0.32);
      transition: opacity 0.18s ease, transform 0.28s cubic-bezier(.19,1,.22,1), background 0.16s ease, box-shadow 0.16s ease;
      box-shadow: 0 9px 18px rgba(49, 71, 158, 0.30), 0 3px 9px rgba(0,0,0,0.22);
      outline: none;
    }

    #${HOST_ID}.menu-open .fab-item {
      opacity: 1;
      pointer-events: auto;
      transform: translate(-50%, -50%) translate(var(--item-x), var(--item-y)) scale(1);
      transition-delay: calc(var(--item-index) * 22ms);
    }

    #${HOST_ID} .fab-item:hover,
    #${HOST_ID} .fab-item.is-active {
      background: linear-gradient(135deg, #7690ff, #5878ff);
      box-shadow: 0 11px 22px rgba(49, 71, 158, 0.36), 0 0 0 6px rgba(89, 117, 255, 0.12), 0 3px 9px rgba(0,0,0,0.24);
      transform: translate(-50%, -50%) translate(var(--item-x), var(--item-y)) scale(1.08);
    }

    #${HOST_ID} .fab-tooltip {
      position: absolute;
      left: 50%;
      top: -30px;
      transform: translateX(-50%) translateY(3px);
      min-width: max-content;
      max-width: 120px;
      padding: 4px 7px;
      border-radius: 999px;
      background: rgba(28, 31, 42, 0.9);
      color: rgba(255,255,255,0.92);
      font-size: 11px;
      font-weight: 700;
      line-height: 1.2;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.14s ease, transform 0.14s ease;
      white-space: nowrap;
      box-shadow: 0 7px 16px rgba(0,0,0,0.20);
    }

    #${HOST_ID} .fab-item:hover .fab-tooltip,
    #${HOST_ID} .fab-item:focus-visible .fab-tooltip {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }

    #${HOST_ID} .fab-empty {
      position: absolute;
      left: 78px;
      top: 14px;
      min-width: 86px;
      padding: 7px 9px;
      border-radius: 999px;
      color: rgba(255,255,255,0.8);
      background: rgba(28, 31, 42, 0.84);
      font-size: 12px;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.16s ease;
      box-shadow: 0 8px 18px rgba(0,0,0,0.20);
    }

    #${HOST_ID}.menu-open .fab-empty { opacity: 1; }

    @media (prefers-reduced-motion: reduce) {
      #${HOST_ID} .fab-main,
      #${HOST_ID} .fab-item,
      #${HOST_ID} .fab-tooltip,
      #${HOST_ID} .fab-empty { transition: none !important; animation: none !important; }
    }
  `;
  pdoc.head.appendChild(style);

  const root = pdoc.createElement('div');
  root.id = HOST_ID;
  root.style.left = `${pos.x}px`;
  root.style.top = `${pos.y}px`;
  root.innerHTML = `
    <button type="button" class="fab-main" id="${HOST_ID}-main" title="Radial FAB Host Demo" aria-label="展开模块菜单">
      <span class="fab-main-icon" aria-hidden="true"></span>
    </button>
    <div class="fab-menu" id="${HOST_ID}-menu"></div>
  `;
  (pdoc.documentElement || pdoc.body).appendChild(root);

  const mainButton = pdoc.getElementById(`${HOST_ID}-main`);
  const menu = pdoc.getElementById(`${HOST_ID}-menu`);

  function addCleanup(task) {
    cleanupTasks.push(task);
  }

  function addManagedListener(target, type, handler, options) {
    target.addEventListener(type, handler, options);
    addCleanup(() => target.removeEventListener(type, handler, options));
  }

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&' + 'amp;')
      .replace(/</g, '&' + 'lt;')
      .replace(/>/g, '&' + 'gt;')
      .replace(/"/g, '&' + 'quot;')
      .replace(/'/g, '&' + '#39;');
  }

  function getModuleIcon(module, index) {
    const icons = ['📅', '📖', '🎒', '♡', '✓', '⌖', '⚙', '✎'];
    return module.icon || icons[index % icons.length] || '•';
  }

  function getRadialArc() {
    const rect = root.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const leftSide = centerX < pwin.innerWidth / 2;
    const topSide = centerY < pwin.innerHeight / 2;

    if (leftSide && topSide) return { start: 10, spread: 105 };
    if (!leftSide && topSide) return { start: 65, spread: 105 };
    if (leftSide && !topSide) return { start: -115, spread: 105 };
    return { start: 180, spread: 105 };
  }

  function savePos() {
    try {
      insertOrAssignVariables(
        {
          [POSITION_VAR_KEY]: JSON.stringify({
            x: parseInt(root.style.left, 10) || 0,
            y: parseInt(root.style.top, 10) || 0,
          }),
        },
        { type: 'global' },
      );
    } catch (error) {
      console.warn('[Radial FAB Demo] 保存位置失败', error);
    }
  }

  function clampRootPosition() {
    const nextX = Math.max(10, Math.min(parseInt(root.style.left, 10) || 0, pwin.innerWidth - 70));
    const nextY = Math.max(10, Math.min(parseInt(root.style.top, 10) || 0, pwin.innerHeight - 70));
    root.style.left = `${nextX}px`;
    root.style.top = `${nextY}px`;
  }

  function renderMenu() {
    const count = modules.length;
    if (!count) {
      menu.innerHTML = '<div class="fab-empty">暂无模块</div>';
      return;
    }

    const arc = getRadialArc();
    const step = count === 1 ? 0 : arc.spread / (count - 1);
    const radiusBase = count > 5 ? 88 : 92;
    const radiusStep = count > 5 ? 7 : 0;

    menu.innerHTML = modules
      .map((module, index) => {
        const angle = arc.start + index * step;
        const radius = radiusBase + index * radiusStep;
        const radian = (angle * Math.PI) / 180;
        const x = Math.cos(radian) * radius;
        const y = Math.sin(radian) * radius;
        return `
          <button
            type="button"
            class="fab-item ${module.active ? 'is-active' : ''}"
            data-module-key="${escapeHtml(module.key)}"
            style="--item-x:${x.toFixed(2)}px;--item-y:${y.toFixed(2)}px;--item-index:${index};"
            title="${escapeHtml(module.name)}"
            aria-label="${escapeHtml(module.name)}"
          >
            <span aria-hidden="true">${escapeHtml(getModuleIcon(module, index))}</span>
            <span class="fab-tooltip">${escapeHtml(module.name)}</span>
          </button>
        `;
      })
      .join('');
  }

  function setMenuOpen(nextOpen) {
    menuOpen = Boolean(nextOpen);
    root.classList.toggle('menu-open', menuOpen);
    mainButton.setAttribute('aria-expanded', menuOpen ? 'true' : 'false');
    if (menuOpen) renderMenu();
  }

  function toggleMenu() {
    if (destroyed) return;
    setMenuOpen(!menuOpen);
  }

  function startDrag(clientX, clientY) {
    dragging = true;
    moved = false;
    suppressClick = false;
    const rect = root.getBoundingClientRect();
    offsetX = clientX - rect.left;
    offsetY = clientY - rect.top;
    root.classList.add('is-dragging');
  }

  function moveDrag(clientX, clientY) {
    if (!dragging) return;
    const nextX = Math.max(10, Math.min(clientX - offsetX, pwin.innerWidth - 70));
    const nextY = Math.max(10, Math.min(clientY - offsetY, pwin.innerHeight - 70));
    const currentX = parseInt(root.style.left, 10) || 0;
    const currentY = parseInt(root.style.top, 10) || 0;
    if (Math.hypot(nextX - currentX, nextY - currentY) > 3) {
      moved = true;
    }
    root.style.left = `${nextX}px`;
    root.style.top = `${nextY}px`;
    if (menuOpen) renderMenu();
  }

  function endDrag() {
    if (!dragging) return;
    dragging = false;
    root.classList.remove('is-dragging');
    clampRootPosition();
    if (moved) {
      suppressClick = true;
      savePos();
    }
  }

  async function invokeModule(key) {
    const module = moduleMap.get(key);
    if (!module) {
      showToast('warning', '模块不存在，无法执行');
      return;
    }

    modules.forEach(item => {
      item.active = item.key === key;
    });
    renderMenu();

    try {
      await module.onClick();
    } catch (error) {
      console.error(`模块点击失败: ${module.name}`, error);
      showToast('error', `模块「${module.name}」点击失败：${error?.message || '未知错误'}`);
    } finally {
      modules.forEach(item => {
        item.active = false;
      });
      renderMenu();
      setMenuOpen(false);
    }
  }

  function buildResult(ok, reason = '', module = null) {
    return {
      ok,
      reason,
      module: module ? { key: module.key, name: module.name } : null,
    };
  }

  function registerModule(module) {
    if (destroyed) return buildResult(false, 'host_destroyed');
    if (!module || typeof module !== 'object') return buildResult(false, 'module_required');

    const key = String(module.key || '').trim();
    const name = String(module.name || '').trim();
    const onClick = module.onClick;
    const icon = module.icon;

    if (!key) return buildResult(false, 'key_required');
    if (!name) return buildResult(false, 'name_required');
    if (typeof onClick !== 'function') return buildResult(false, 'onclick_required');
    if (moduleMap.has(key)) return buildResult(false, 'duplicate_key', moduleMap.get(key));
    if (modules.length >= MAX_MODULES) return buildResult(false, 'max_modules_reached');

    const normalizedModule = { key, name, icon, onClick, active: false };
    modules.push(normalizedModule);
    moduleMap.set(key, normalizedModule);
    renderMenu();
    return buildResult(true, '', normalizedModule);
  }

  function unregisterModule(key) {
    const normalizedKey = String(key || '').trim();
    const target = moduleMap.get(normalizedKey);
    if (!target) return buildResult(false, 'module_not_found');

    moduleMap.delete(normalizedKey);
    const index = modules.findIndex(item => item.key === normalizedKey);
    if (index >= 0) modules.splice(index, 1);
    renderMenu();
    return buildResult(true, '', target);
  }

  function getModules() {
    return modules.map(module => ({ key: module.key, name: module.name, icon: module.icon, onClick: module.onClick }));
  }

  function destroy() {
    if (destroyed) return;
    destroyed = true;
    while (cleanupTasks.length) {
      const task = cleanupTasks.pop();
      try {
        task?.();
      } catch (error) {
        console.warn('清理 Radial FAB Demo 失败:', error);
      }
    }
    modules.splice(0, modules.length);
    moduleMap.clear();
    pdoc.getElementById(HOST_ID)?.remove();
    pdoc.getElementById(HOST_STYLE_ID)?.remove();
    if (pwin[INSTANCE_KEY]?.destroy === destroy) delete pwin[INSTANCE_KEY];
    if (pwin[HOST_GLOBAL_KEY]?.destroy === destroy) delete pwin[HOST_GLOBAL_KEY];
  }

  const getPoint = event => {
    const touch = event.touches?.[0] ?? event.changedTouches?.[0];
    return touch ? { x: touch.clientX, y: touch.clientY } : { x: event.clientX, y: event.clientY };
  };

  const handleMainPressStart = event => {
    if (destroyed) return;
    const point = getPoint(event);
    startDrag(point.x, point.y);
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDocumentMove = event => {
    const point = getPoint(event);
    moveDrag(point.x, point.y);
  };

  const handleDocumentRelease = () => {
    endDrag();
  };

  const handleMainClick = event => {
    event.stopPropagation();
    if (suppressClick) {
      suppressClick = false;
      return;
    }
    toggleMenu();
  };

  const handleMenuClick = async event => {
    const button = event.target.closest?.('[data-module-key]');
    if (!button) return;
    event.stopPropagation();
    await invokeModule(button.getAttribute('data-module-key'));
  };

  const handleDocumentPointerAway = event => {
    if (destroyed || !menuOpen) return;
    if (root.contains(event.target)) return;
    setMenuOpen(false);
  };

  const handleKeyDown = event => {
    if (event.key === 'Escape' && menuOpen) setMenuOpen(false);
  };

  const handleResize = () => {
    clampRootPosition();
    renderMenu();
  };

  addManagedListener(mainButton, 'mousedown', handleMainPressStart);
  addManagedListener(mainButton, 'touchstart', handleMainPressStart, { passive: false });
  addManagedListener(mainButton, 'click', handleMainClick);
  addManagedListener(menu, 'click', handleMenuClick);
  addManagedListener(pdoc, 'mousemove', handleDocumentMove);
  addManagedListener(pdoc, 'touchmove', handleDocumentMove, { passive: false });
  addManagedListener(pdoc, 'mouseup', handleDocumentRelease);
  addManagedListener(pdoc, 'touchend', handleDocumentRelease);
  addManagedListener(pdoc, 'touchcancel', handleDocumentRelease);
  addManagedListener(pdoc, 'mousedown', handleDocumentPointerAway);
  addManagedListener(pdoc, 'touchstart', handleDocumentPointerAway, { passive: true });
  addManagedListener(pdoc, 'keydown', handleKeyDown);
  addManagedListener(pwin, 'resize', handleResize);
  addManagedListener(window, 'pagehide', destroy);
  addManagedListener(window, 'unload', destroy);

  const demoModules = [
    { name: '月历', icon: '📅' },
    { name: '世界书', icon: '📖' },
    { name: '背包', icon: '🎒' },
    { name: '关系', icon: '♡' },
    { name: '任务', icon: '✓' },
    { name: '地图', icon: '⌖' },
    { name: '设置', icon: '⚙' },
    { name: '日志', icon: '✎' },
  ];

  demoModules.forEach((module, index) => {
    registerModule({
      key: `demo-${index + 1}`,
      name: module.name,
      icon: module.icon,
      onClick: () => showToast('success', `你点击了「${module.name}」`, 'Demo 模块'),
    });
  });

  clampRootPosition();
  renderMenu();

  const host = {
    version: VERSION,
    get isReady() {
      return !destroyed;
    },
    registerModule,
    unregisterModule,
    getModules,
    destroy,
  };

  pwin[INSTANCE_KEY] = host;
  pwin[HOST_GLOBAL_KEY] = host;

  showToast('success', 'Radial FAB host demo 已加载：点击红色按钮展开，拖动移动位置');
}));

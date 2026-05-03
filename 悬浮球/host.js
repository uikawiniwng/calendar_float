$(errorCatched(async () => {
  const HOST_ID = 'mdpoem-floating-host-v2';
  const HOST_STYLE_ID = `${HOST_ID}-style`;
  const POSITION_VAR_KEY = 'mdpoem_floating_host_pos';
  const HOST_GLOBAL_KEY = '__mdpoemFloatingHost__';
  const INSTANCE_KEY = '__mdpoemFloatingHostInstance__';
  const MAX_MODULES = 5;
  const VERSION = '1.1.0';

  let pdoc;
  let pwin;
  try {
    pdoc = (parent && parent.document) ? parent.document : document;
    pwin = (parent && parent.window) ? parent.window : window;
  } catch (error) {
    pdoc = document;
    pwin = window;
  }

  function showToast(level, message, title = '悬浮球宿主') {
    try {
      if (typeof toastr?.[level] === 'function') {
        toastr[level](message, title);
        return;
      }
    } catch (_) {}

    const prefix = title ? `[${title}] ` : '';
    const logger = level === 'error' ? console.error : level === 'warning' ? console.warn : console.log;
    logger(`${prefix}${message}`);
  }

  const cleanupTasks = [];
  let destroyed = false;
  let drag = false;
  let moved = false;
  let offsetX = 0;
  let offsetY = 0;
  let dragMask = null;
  let activeModuleKey = '';
  let subMenuOpen = false;

  const modules = [];
  const moduleMap = new Map();

  try {
    if (pwin.panicMode) pwin.panicMode = function () {};
    if (window.panicMode) window.panicMode = function () {};
    if (pwin.$) {
      pwin.$(pdoc).off('dblclick', '.mes_window, #bg_layer, body');
      pwin.$(pdoc.body).off('dblclick');
    }
  } catch (error) {
    console.warn('屏蔽老板键时出错:', error);
  }

  const isMobile = pwin.innerWidth <= 768;
  let pos = isMobile
    ? { x: pwin.innerWidth - 60, y: pwin.innerHeight - 120 }
    : { x: 40, y: 160 };

  try {
    const raw = getVariables({ type: 'global' })?.[POSITION_VAR_KEY];
    if (raw) {
      const saved = JSON.parse(raw);
      pos = {
        x: Math.max(4, Math.min(Number(saved.x) || pos.x, pwin.innerWidth - 56)),
        y: Math.max(4, Math.min(Number(saved.y) || pos.y, pwin.innerHeight - 56)),
      };
    }
  } catch (_) {}

  const style = pdoc.createElement('style');
  style.id = HOST_STYLE_ID;
  style.textContent = `
    #${HOST_ID} {
      position: fixed !important;
      z-index: 2147483647 !important;
      width: 48px;
      height: 48px;
      font-family: 'Microsoft YaHei', 'PingFang SC', sans-serif;
      user-select: none;
      -webkit-user-select: none;
      touch-action: none;
      transform: translateZ(0);
    }

    #${HOST_ID} * {
      box-sizing: border-box;
    }

    #${HOST_ID} .orb {
      position: absolute;
      inset: 0;
      isolation: isolate;
      width: 48px;
      height: 48px;
      border-radius: 12px;
      cursor: pointer;
      z-index: 3;
      background: linear-gradient(135deg, rgba(227, 220, 255, 0.2), rgba(196, 201, 255, 0.18) 52%, rgba(157, 206, 221, 0.14));
      border: 1px solid rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(16px) saturate(120%);
      -webkit-backdrop-filter: blur(16px) saturate(120%);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.22), inset 0 1px 0 rgba(255,255,255,0.1);
      transition: transform 0.24s ease, background 0.24s ease, border-color 0.24s ease, box-shadow 0.24s ease;
      overflow: visible;
    }

    #${HOST_ID} .orb::after {
      content: '';
      position: absolute;
      inset: -10px;
      border-radius: 18px;
      pointer-events: none;
      opacity: 0;
      transform: scale(0.9);
      background:
        radial-gradient(circle at 50% 50%, rgba(248, 240, 255, 0.48) 0%, rgba(218, 196, 255, 0.38) 24%, rgba(176, 165, 255, 0.28) 44%, rgba(147, 187, 255, 0.18) 60%, rgba(147, 187, 255, 0) 76%);
      filter: blur(12px);
      transition: opacity 0.28s ease;
    }

    #${HOST_ID} .orb:hover {
      background: linear-gradient(135deg, rgba(236, 229, 255, 0.24), rgba(207, 211, 255, 0.22) 52%, rgba(167, 214, 229, 0.18));
    }

    #${HOST_ID}.submenu-open .orb {
      background: linear-gradient(135deg, rgba(227, 220, 255, 0.2), rgba(196, 201, 255, 0.18) 52%, rgba(157, 206, 221, 0.14));
      border-color: rgba(236, 229, 255, 0.24);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.22), inset 0 1px 0 rgba(255,255,255,0.1);
    }

    #${HOST_ID}.submenu-open .orb::after {
      opacity: 1;
      animation: ${HOST_ID}-gem-pulse 2.4s ease-in-out infinite;
    }

    #${HOST_ID}.submenu-open .orb-icon {
      filter:
        drop-shadow(0 0 8px rgba(235, 221, 255, 0.42))
        drop-shadow(0 0 18px rgba(173, 139, 255, 0.32))
        drop-shadow(0 0 26px rgba(126, 168, 255, 0.24))
        drop-shadow(0 2px 5px rgba(0,0,0,0.35));
    }

    #${HOST_ID} .orb-icon {
      transition: filter 0.25s ease, opacity 0.25s ease;
      filter: drop-shadow(0 2px 5px rgba(0,0,0,0.35));
      display: block;
      opacity: 1;
      position: relative;
      z-index: 2;
    }

    #${HOST_ID} .orb-glow {
      position: absolute;
      left: 50%;
      top: 50%;
      width: 48px;
      height: 48px;
      color: rgba(214, 198, 255, 0.72);
      transform: translate(-50%, -50%);
      pointer-events: none;
      z-index: 1;
      opacity: 0;
      overflow: visible;
      transition: opacity 0.25s ease;
    }

    #${HOST_ID}.submenu-open .orb-glow {
      opacity: 1;
    }

    @keyframes ${HOST_ID}-gem-pulse {
      0% {
        transform: scale(0.9);
        opacity: 0.3;
      }
      35% {
        transform: scale(1.14);
        opacity: 0.58;
      }
      65% {
        transform: scale(1.24);
        opacity: 0.4;
      }
      100% {
        transform: scale(0.96);
        opacity: 0.28;
      }
    }

    #${HOST_ID} .submenu {
      position: absolute;
      display: flex;
      flex-direction: column;
      gap: 10px;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.18s ease;
      z-index: 2;
      padding: 6px 0;
    }

    #${HOST_ID}.align-left .submenu {
      left: 58px;
      right: auto;
      transform: none;
    }

    #${HOST_ID}.align-right .submenu {
      left: auto;
      right: 58px;
      transform: none;
    }

    #${HOST_ID}.menu-down .submenu {
      top: -28px;
      bottom: auto;
    }

    #${HOST_ID}.menu-up .submenu {
      top: auto;
      bottom: -28px;
    }

    #${HOST_ID}.submenu-open .submenu {
      opacity: 1;
      pointer-events: auto;
    }

    #${HOST_ID}.submenu-open.align-left .submenu,
    #${HOST_ID}.submenu-open.align-right .submenu {
      transform: none;
    }

    #${HOST_ID} .submenu-btn {
      width: 92px;
      min-height: 38px;
      padding: 8px 10px;
      border: 1px solid rgba(236, 229, 255, 0.2);
      border-radius: 14px;
      background: linear-gradient(135deg, rgba(227, 220, 255, 0.2), rgba(196, 201, 255, 0.18) 52%, rgba(157, 206, 221, 0.14));
      color: #f7fcff;
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 0.02em;
      line-height: 1.2;
      text-align: center;
      text-shadow: 0 1px 6px rgba(0,0,0,0.28);
      box-shadow: 0 10px 24px rgba(0,0,0,0.24), inset 0 1px 0 rgba(255,255,255,0.08);
      transition: background 0.15s ease, border-color 0.15s ease;
      white-space: normal;
      word-break: break-all;
    }

    #${HOST_ID} .submenu-btn:hover {
      background: linear-gradient(135deg, rgba(236, 229, 255, 0.24), rgba(207, 211, 255, 0.22) 52%, rgba(167, 214, 229, 0.18));
      border-color: rgba(236, 229, 255, 0.28);
    }

    #${HOST_ID}.align-left.menu-down .submenu-btn:nth-child(1) { transform: rotate(-7deg); }
    #${HOST_ID}.align-left.menu-down .submenu-btn:nth-child(2) { transform: rotate(-3deg); }
    #${HOST_ID}.align-left.menu-down .submenu-btn:nth-child(3) { transform: rotate(0deg); }
    #${HOST_ID}.align-left.menu-down .submenu-btn:nth-child(4) { transform: rotate(3deg); }
    #${HOST_ID}.align-left.menu-down .submenu-btn:nth-child(5) { transform: rotate(7deg); }

    #${HOST_ID}.align-left.menu-up .submenu-btn:nth-child(1) { transform: rotate(7deg); }
    #${HOST_ID}.align-left.menu-up .submenu-btn:nth-child(2) { transform: rotate(3deg); }
    #${HOST_ID}.align-left.menu-up .submenu-btn:nth-child(3) { transform: rotate(0deg); }
    #${HOST_ID}.align-left.menu-up .submenu-btn:nth-child(4) { transform: rotate(-3deg); }
    #${HOST_ID}.align-left.menu-up .submenu-btn:nth-child(5) { transform: rotate(-7deg); }

    #${HOST_ID}.align-right.menu-down .submenu-btn:nth-child(1) { transform: rotate(7deg); }
    #${HOST_ID}.align-right.menu-down .submenu-btn:nth-child(2) { transform: rotate(3deg); }
    #${HOST_ID}.align-right.menu-down .submenu-btn:nth-child(3) { transform: rotate(0deg); }
    #${HOST_ID}.align-right.menu-down .submenu-btn:nth-child(4) { transform: rotate(-3deg); }
    #${HOST_ID}.align-right.menu-down .submenu-btn:nth-child(5) { transform: rotate(-7deg); }

    #${HOST_ID}.align-right.menu-up .submenu-btn:nth-child(1) { transform: rotate(-7deg); }
    #${HOST_ID}.align-right.menu-up .submenu-btn:nth-child(2) { transform: rotate(-3deg); }
    #${HOST_ID}.align-right.menu-up .submenu-btn:nth-child(3) { transform: rotate(0deg); }
    #${HOST_ID}.align-right.menu-up .submenu-btn:nth-child(4) { transform: rotate(3deg); }
    #${HOST_ID}.align-right.menu-up .submenu-btn:nth-child(5) { transform: rotate(7deg); }

    #${HOST_ID} .submenu-btn.is-active {
      background: linear-gradient(135deg, rgba(232, 221, 255, 0.3), rgba(199, 194, 255, 0.26) 52%, rgba(164, 212, 229, 0.2));
      border-color: rgba(214, 198, 255, 0.34);
      color: #f7f4ff;
    }

    #${HOST_ID} .submenu-empty {
      width: 92px;
      min-height: 38px;
      padding: 10px 8px;
      border-radius: 10px;
      border: 1px dashed rgba(255,255,255,0.14);
      background: rgba(18, 18, 20, 0.65);
      color: rgba(255,255,255,0.62);
      font-size: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      box-shadow: 0 8px 20px rgba(0,0,0,0.18);
    }
  `;
  pdoc.head.appendChild(style);

  const root = pdoc.createElement('div');
  root.id = HOST_ID;
  root.style.left = `${pos.x}px`;
  root.style.top = `${pos.y}px`;
  root.innerHTML = `
    <div class="orb" id="${HOST_ID}-orb" title="悬浮球宿主">
      <svg class="orb-icon" viewBox="0 0 512 512" width="24" height="24" aria-hidden="true">
        <defs>
          <linearGradient id="${HOST_ID}-gem-grad" x1="8%" y1="6%" x2="84%" y2="92%">
            <stop offset="0%" stop-color="#f1e8ff"></stop>
            <stop offset="24%" stop-color="#d8c5ff"></stop>
            <stop offset="50%" stop-color="#bfc8ff"></stop>
            <stop offset="76%" stop-color="#9fd4de"></stop>
            <stop offset="100%" stop-color="#7b90ff"></stop>
          </linearGradient>
        </defs>
        <path fill="url(#${HOST_ID}-gem-grad)" d="M310.375 16.75L89.405 75.72l58.126 50.905L282.563 90.28l2.032-.53zm17.063 7.844l-27.157 76.812l91.69 91.875l95.624-8.78zm-41.813 12.062l-8.594 33.657c-.28-15.516-38.03-17.018-107.56-4.376zm51.063 14.625l123.5 123.407l-58.844 7.563c16.2-21.37-32.277-91.112-64.656-130.97M74.75 87.72L15.594 308.405l79-31.47l37.28-139.155zm207.438 22l-133.032 35.81l-35.72 133.376l97.25 97.53l133.064-35.81l35.72-133.376zm-201.72 5.686l32.844 30.5l-30.156 118.97l-39.03 15.812c50.817-30.543 65.667-130.132 36.343-165.282zm195.876 14.78L359 213.377l-30.156 113.81l-44.688 11.97c119.527-107.872-34.816-238.375-131.5-140.875l9.875-37.405l113.814-30.688zM490.564 203l-92.877 8.53l-35.968 134.19l71.342 71.842L490.563 203zm-17.283 13.875L444.03 333.03c6.73-68.874-.03-90.85-30.655-111.5zm-371.155 77.188L20.22 326.688l161.75 161.468l17.31-96.72l-97.155-97.373zm.094 20l78.124 82.437l-7.438 61.375c-5.23-44.565-28.34-85.92-70.687-143.813zm246.124 44.687l-130.53 35.125l-17.564 98.188l221.688-59.157zm18.625 42.5l24.28 24.844l-115.22 32.72c61.28-26.446 83.34-37.418 90.94-57.564"/>
      </svg>
      <svg class="orb-glow" xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="0" fill="currentColor">
          <animate attributeName="r" calcMode="spline" dur="1.2s" keySplines=".52,.6,.25,.99" repeatCount="indefinite" values="0;11"/>
          <animate attributeName="opacity" calcMode="spline" dur="1.2s" keySplines=".52,.6,.25,.99" repeatCount="indefinite" values="1;0"/>
        </circle>
      </svg>
    </div>
    <div class="submenu" id="${HOST_ID}-submenu"></div>
  `;
  (pdoc.documentElement || pdoc.body).appendChild(root);

  const orb = pdoc.getElementById(`${HOST_ID}-orb`);
  const submenu = pdoc.getElementById(`${HOST_ID}-submenu`);

  function addCleanup(task) {
    cleanupTasks.push(task);
  }

  function addManagedListener(target, type, handler, options) {
    target.addEventListener(type, handler, options);
    addCleanup(() => target.removeEventListener(type, handler, options));
  }

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function savePos() {
    try {
      insertOrAssignVariables({
        [POSITION_VAR_KEY]: JSON.stringify({
          x: parseInt(root.style.left, 10) || 0,
          y: parseInt(root.style.top, 10) || 0,
        }),
      }, { type: 'global' });
    } catch (_) {}
  }

  function clampRootPosition() {
    const nextX = Math.max(4, Math.min(parseInt(root.style.left, 10) || 0, pwin.innerWidth - 52));
    const nextY = Math.max(4, Math.min(parseInt(root.style.top, 10) || 0, pwin.innerHeight - 52));
    root.style.left = `${nextX}px`;
    root.style.top = `${nextY}px`;
  }

  function updateFloatingDirection() {
    const orbX = parseInt(root.style.left, 10) || 0;
    const orbY = parseInt(root.style.top, 10) || 0;
    const preferLeft = orbX < pwin.innerWidth / 2;
    const estimatedHeight = Math.max(1, modules.length || 1) * 46;
    const shouldOpenUp = (pwin.innerHeight - orbY - 56) < estimatedHeight && orbY > estimatedHeight / 2;

    root.classList.toggle('align-left', preferLeft);
    root.classList.toggle('align-right', !preferLeft);
    root.classList.toggle('menu-up', shouldOpenUp);
    root.classList.toggle('menu-down', !shouldOpenUp);
  }

  function renderSubMenu() {
    updateFloatingDirection();
    root.classList.toggle('submenu-open', subMenuOpen);

    if (!modules.length) {
      submenu.innerHTML = '<div class="submenu-empty">暂无模块</div>';
      return;
    }

    submenu.innerHTML = modules.map((module) => `
      <button
        type="button"
        class="submenu-btn ${activeModuleKey === module.key ? 'is-active' : ''}"
        data-module-key="${escapeHtml(module.key)}"
        title="${escapeHtml(module.name)}"
      >${escapeHtml(module.name)}</button>
    `).join('');
  }

  function getModules() {
    return modules.map((module) => ({
      key: module.key,
      name: module.name,
      onClick: module.onClick,
    }));
  }

  function buildResult(ok, reason = '', module = null) {
    return {
      ok,
      reason,
      module: module ? { key: module.key, name: module.name } : null,
    };
  }

  function registerModule(module) {
    if (destroyed) {
      showToast('error', '宿主已销毁，无法注册模块');
      return buildResult(false, 'host_destroyed');
    }

    if (!module || typeof module !== 'object') {
      showToast('error', '注册失败：模块信息不能为空');
      return buildResult(false, 'module_required');
    }

    const key = String(module.key || '').trim();
    const name = String(module.name || '').trim();
    const onClick = module.onClick;

    if (!key) {
      showToast('error', '注册失败：模块 key 不能为空');
      return buildResult(false, 'key_required');
    }

    if (!name) {
      showToast('error', '注册失败：模块 name 不能为空');
      return buildResult(false, 'name_required');
    }

    if (typeof onClick !== 'function') {
      showToast('error', `注册失败：模块「${name}」缺少 onClick 函数`);
      return buildResult(false, 'onclick_required');
    }

    if (moduleMap.has(key)) {
      showToast('warning', `注册失败：模块「${name}」已存在`);
      return buildResult(false, 'duplicate_key', moduleMap.get(key));
    }

    if (modules.length >= MAX_MODULES) {
      showToast('warning', `注册失败：最多仅支持 ${MAX_MODULES} 个模块`);
      return buildResult(false, 'max_modules_reached');
    }

    const normalizedModule = { key, name, onClick };
    modules.push(normalizedModule);
    moduleMap.set(key, normalizedModule);
    renderSubMenu();
    showToast('success', `模块「${name}」注册成功`);
    return buildResult(true, '', normalizedModule);
  }

  function unregisterModule(key) {
    const normalizedKey = String(key || '').trim();
    if (!normalizedKey) {
      showToast('warning', '取消注册失败：模块 key 不能为空');
      return buildResult(false, 'key_required');
    }

    const target = moduleMap.get(normalizedKey);
    if (!target) {
      showToast('warning', '模块不存在，无法取消注册');
      return buildResult(false, 'module_not_found');
    }

    moduleMap.delete(normalizedKey);
    const index = modules.findIndex((item) => item.key === normalizedKey);
    if (index >= 0) {
      modules.splice(index, 1);
    }

    if (activeModuleKey === normalizedKey) {
      activeModuleKey = '';
    }

    renderSubMenu();
    showToast('success', `模块「${target.name}」已取消注册`);
    return buildResult(true, '', target);
  }

  function setSubMenuOpen(nextOpen) {
    subMenuOpen = Boolean(nextOpen);
    renderSubMenu();
  }

  function toggleSubMenu() {
    if (destroyed) return;
    setSubMenuOpen(!subMenuOpen);
  }

  async function invokeModule(key) {
    const module = moduleMap.get(key);
    if (!module) {
      showToast('warning', '模块不存在，无法执行');
      renderSubMenu();
      return;
    }

    activeModuleKey = key;
    renderSubMenu();

    try {
      await module.onClick();
    } catch (error) {
      console.error(`模块点击失败: ${module.name}`, error);
      showToast('error', `模块「${module.name}」点击失败：${error?.message || '未知错误'}`);
    } finally {
      if (activeModuleKey === key) {
        activeModuleKey = '';
      }
      renderSubMenu();
    }
  }

  function createMask() {
    try {
      dragMask = parent.document.createElement('div');
      dragMask.style.cssText = 'position:fixed;inset:0;z-index:2147483646;cursor:grabbing;background:transparent;';
      parent.document.body.appendChild(dragMask);
    } catch (_) {
      dragMask = null;
    }
  }

  function removeMask() {
    dragMask?.remove();
    dragMask = null;
  }

  function startDrag(clientX, clientY) {
    drag = true;
    moved = false;
    const rect = root.getBoundingClientRect();
    offsetX = clientX - rect.left;
    offsetY = clientY - rect.top;
    root.style.transition = 'none';
    createMask();
  }

  function moveDrag(clientX, clientY) {
    if (!drag) return;
    moved = true;
    root.style.left = `${Math.max(4, Math.min(clientX - offsetX, pwin.innerWidth - 50))}px`;
    root.style.top = `${Math.max(4, Math.min(clientY - offsetY, pwin.innerHeight - 50))}px`;
    updateFloatingDirection();
  }

  function endDrag() {
    if (!drag) return;
    drag = false;
    root.style.transition = '';
    clampRootPosition();
    updateFloatingDirection();
    if (moved) savePos();
    removeMask();
  }

  function destroy() {
    if (destroyed) return;
    destroyed = true;

    while (cleanupTasks.length) {
      const task = cleanupTasks.pop();
      try {
        task?.();
      } catch (error) {
        console.warn('清理宿主监听失败:', error);
      }
    }

    modules.splice(0, modules.length);
    moduleMap.clear();
    activeModuleKey = '';
    removeMask();
    pdoc.getElementById(HOST_ID)?.remove();
    pdoc.getElementById(HOST_STYLE_ID)?.remove();

    if (pwin[INSTANCE_KEY]?.destroy === destroy) {
      delete pwin[INSTANCE_KEY];
    }
    if (pwin[HOST_GLOBAL_KEY]?.destroy === destroy) {
      delete pwin[HOST_GLOBAL_KEY];
    }
  }

  const handleDocumentDblClickCapture = (event) => {
    if (destroyed) return;
    if (event.target === pdoc.body || event.target?.id === 'bg_layer' || event.target?.classList?.contains('mes_window')) {
      event.stopPropagation();
      event.preventDefault();
    }
  };

  const handleSubmenuClick = async (event) => {
    const btn = event.target.closest('[data-module-key]');
    if (!btn) return;
    event.stopPropagation();
    await invokeModule(btn.getAttribute('data-module-key'));
  };

  const handleOrbMouseDown = (event) => {
    startDrag(event.clientX, event.clientY);
    event.preventDefault();
  };

  const handleDocumentMouseMove = (event) => moveDrag(event.clientX, event.clientY);
  const handleDocumentMouseUp = () => endDrag();

  const handleOrbClick = () => {
    if (destroyed) return;
    if (moved) {
      moved = false;
      return;
    }
    toggleSubMenu();
  };

  const handleOrbTouchStart = (event) => {
    if (destroyed) return;
    const touch = event.touches[0];
    startDrag(touch.clientX, touch.clientY);
    event.stopPropagation();
  };

  const handleOrbTouchMove = (event) => {
    if (!drag) return;
    const touch = event.touches[0];
    moveDrag(touch.clientX, touch.clientY);
  };

  const handleOrbTouchEnd = (event) => {
    if (destroyed) return;
    const wasMoved = moved;
    endDrag();
    if (!wasMoved) {
      toggleSubMenu();
    }
    event.stopPropagation();
    event.preventDefault();
  };

  const handleResize = () => {
    if (destroyed) return;
    clampRootPosition();
    updateFloatingDirection();
    renderSubMenu();
  };

  const handleDocumentMouseDown = (event) => {
    if (destroyed || !subMenuOpen) return;
    if (root.contains(event.target)) return;
    setSubMenuOpen(false);
  };

  const handleDocumentTouchStart = (event) => {
    if (destroyed || !subMenuOpen) return;
    if (root.contains(event.target)) return;
    setSubMenuOpen(false);
  };

  const handleDocumentKeyDown = (event) => {
    if (destroyed) return;
    if (event.key !== 'Escape' || !subMenuOpen) return;
    setSubMenuOpen(false);
  };

  const handlePageHide = () => destroy();
  const handleUnload = () => destroy();

  addManagedListener(pdoc, 'dblclick', handleDocumentDblClickCapture, true);
  addManagedListener(submenu, 'click', handleSubmenuClick);
  addManagedListener(orb, 'mousedown', handleOrbMouseDown);
  addManagedListener(pdoc, 'mousemove', handleDocumentMouseMove);
  addManagedListener(pdoc, 'mouseup', handleDocumentMouseUp);
  addManagedListener(orb, 'click', handleOrbClick);
  addManagedListener(orb, 'touchstart', handleOrbTouchStart, { passive: true });
  addManagedListener(orb, 'touchmove', handleOrbTouchMove, { passive: true });
  addManagedListener(orb, 'touchend', handleOrbTouchEnd, { passive: false });
  addManagedListener(pwin, 'resize', handleResize);
  addManagedListener(pdoc, 'mousedown', handleDocumentMouseDown);
  addManagedListener(pdoc, 'touchstart', handleDocumentTouchStart, { passive: true });
  addManagedListener(pdoc, 'keydown', handleDocumentKeyDown);
  addManagedListener(window, 'pagehide', handlePageHide);
  addManagedListener(window, 'unload', handleUnload);

  addCleanup(() => {
    if (pwin[INSTANCE_KEY]?.destroy === destroy) {
      delete pwin[INSTANCE_KEY];
    }
    if (pwin[HOST_GLOBAL_KEY]?.destroy === destroy) {
      delete pwin[HOST_GLOBAL_KEY];
    }
  });

  clampRootPosition();
  renderSubMenu();

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

  showToast('success', '宿主加载成功');
}));

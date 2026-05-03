$(errorCatched(async () => {
  const HOST_ID = 'mdpoem-chinese-fan-host-demo';
  const HOST_STYLE_ID = `${HOST_ID}-style`;
  const POSITION_VAR_KEY = 'mdpoem_chinese_fan_host_demo_pos';
  const HOST_GLOBAL_KEY = '__mdpoemFloatingHost__';
  const INSTANCE_KEY = '__mdpoemFloatingHostInstance__';
  const MAX_MODULES = 8;
  const VERSION = 'fan-demo-0.1.0';

  let pdoc;
  let pwin;
  try {
    pdoc = parent && parent.document ? parent.document : document;
    pwin = parent && parent.window ? parent.window : window;
  } catch (error) {
    pdoc = document;
    pwin = window;
  }

  function showToast(level, message, title = '中国扇形 Host Demo') {
    try {
      if (typeof toastr?.[level] === 'function') {
        toastr[level](message, title);
        return;
      }
    } catch (error) {
      console.warn('[中国扇形 Host Demo] toastr 不可用，改用 console 输出', error);
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
  let fanOpen = false;
  let dragging = false;
  let moved = false;
  let offsetX = 0;
  let offsetY = 0;
  let suppressClick = false;

  const isMobile = pwin.innerWidth <= 768;
  let pos = isMobile
    ? { x: pwin.innerWidth - 76, y: pwin.innerHeight - 96 }
    : { x: pwin.innerWidth - 100, y: pwin.innerHeight - 124 };

  try {
    const raw = getVariables({ type: 'global' })?.[POSITION_VAR_KEY];
    if (raw) {
      const saved = JSON.parse(raw);
      pos = {
        x: Math.max(8, Math.min(Number(saved.x) || pos.x, pwin.innerWidth - 64)),
        y: Math.max(8, Math.min(Number(saved.y) || pos.y, pwin.innerHeight - 64)),
      };
    }
  } catch (error) {
    console.warn('[中国扇形 Host Demo] 读取保存位置失败', error);
  }

  const style = pdoc.createElement('style');
  style.id = HOST_STYLE_ID;
  style.textContent = `
    #${HOST_ID} {
      position: fixed !important;
      z-index: 2147483647 !important;
      left: 0;
      top: 0;
      width: 58px;
      height: 58px;
      font-family: 'Microsoft YaHei', 'PingFang SC', sans-serif;
      user-select: none;
      -webkit-user-select: none;
      touch-action: none;
      transform: translateZ(0);
      --fan-angle: 0deg;
    }

    #${HOST_ID} * { box-sizing: border-box; }

    #${HOST_ID} .orb {
      position: absolute;
      inset: 0;
      width: 58px;
      height: 58px;
      border: 1px solid rgba(255, 255, 255, 0.26);
      border-radius: 18px;
      background: linear-gradient(135deg, rgba(235, 226, 255, 0.3), rgba(190, 198, 255, 0.24) 52%, rgba(144, 221, 231, 0.18));
      color: #f8fbff;
      backdrop-filter: blur(18px) saturate(125%);
      -webkit-backdrop-filter: blur(18px) saturate(125%);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: grab;
      z-index: 20;
      box-shadow: 0 16px 36px rgba(0, 0, 0, 0.28), inset 0 1px 0 rgba(255,255,255,0.16);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    #${HOST_ID}.is-dragging .orb { cursor: grabbing; }

    #${HOST_ID}.fan-open .orb {
      transform: scale(1.04) rotate(8deg);
      box-shadow: 0 16px 38px rgba(0, 0, 0, 0.3), 0 0 34px rgba(174, 143, 255, 0.34), inset 0 1px 0 rgba(255,255,255,0.18);
    }

    #${HOST_ID} .orb::before {
      content: '';
      position: absolute;
      inset: -14px;
      border-radius: 26px;
      pointer-events: none;
      opacity: 0;
      background: radial-gradient(circle, rgba(236, 225, 255, 0.54), rgba(167, 151, 255, 0.22) 46%, rgba(109, 222, 238, 0) 74%);
      filter: blur(13px);
      transition: opacity 0.22s ease;
    }

    #${HOST_ID}.fan-open .orb::before { opacity: 1; }

    #${HOST_ID} .orb-icon {
      position: relative;
      z-index: 2;
      width: 29px;
      height: 29px;
      filter: drop-shadow(0 2px 6px rgba(0,0,0,0.36));
      pointer-events: none;
    }

    #${HOST_ID} .fan {
      position: absolute;
      left: 29px;
      top: 29px;
      width: 0;
      height: 0;
      pointer-events: none;
      z-index: 10;
    }

    #${HOST_ID}.fan-open .fan { pointer-events: auto; }

    #${HOST_ID} .fan-surface {
      position: absolute;
      left: -160px;
      top: -160px;
      width: 320px;
      height: 320px;
      border-radius: 50%;
      opacity: 0;
      transform: scale(0.42) rotate(var(--fan-angle));
      transform-origin: center;
      background:
        radial-gradient(circle at center, transparent 0 50px, rgba(201, 184, 255, 0.14) 52px, rgba(157, 224, 235, 0.05) 150px, transparent 154px),
        conic-gradient(from -18deg, rgba(232, 222, 255, 0), rgba(224, 211, 255, 0.22), rgba(151, 225, 233, 0.14), rgba(232, 222, 255, 0));
      filter: blur(0.2px);
      transition: opacity 0.18s ease, transform 0.28s cubic-bezier(.19,1,.22,1);
      pointer-events: none;
    }

    #${HOST_ID}.fan-open .fan-surface {
      opacity: 1;
      transform: scale(1) rotate(var(--fan-angle));
    }

    #${HOST_ID} .fan-rib {
      position: absolute;
      left: 0;
      top: 0;
      width: var(--rib-length);
      height: 1px;
      background: linear-gradient(90deg, rgba(245, 238, 255, 0.72), rgba(169, 225, 235, 0.08));
      transform-origin: left center;
      transform: rotate(var(--rib-angle)) scaleX(0.18);
      opacity: 0;
      transition: opacity 0.18s ease, transform 0.26s cubic-bezier(.19,1,.22,1);
      pointer-events: none;
    }

    #${HOST_ID}.fan-open .fan-rib {
      opacity: 0.42;
      transform: rotate(var(--rib-angle)) scaleX(1);
    }

    #${HOST_ID} .fan-btn {
      position: absolute;
      left: 0;
      top: 0;
      min-width: 74px;
      min-height: 34px;
      padding: 7px 11px;
      border-radius: 999px;
      border: 1px solid rgba(236, 229, 255, 0.22);
      background: linear-gradient(135deg, rgba(227, 220, 255, 0.28), rgba(196, 201, 255, 0.23) 52%, rgba(157, 206, 221, 0.18));
      color: #f7fcff;
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 0.02em;
      line-height: 1.15;
      text-align: center;
      text-shadow: 0 1px 6px rgba(0,0,0,0.3);
      box-shadow: 0 10px 24px rgba(0,0,0,0.24), inset 0 1px 0 rgba(255,255,255,0.10);
      opacity: 0;
      transform: translate(-50%, -50%) scale(0.5);
      transition: opacity 0.18s ease, transform 0.26s cubic-bezier(.19,1,.22,1), background 0.15s ease, border-color 0.15s ease;
      white-space: nowrap;
      pointer-events: none;
    }

    #${HOST_ID}.fan-open .fan-btn {
      opacity: 1;
      pointer-events: auto;
      transform: translate(-50%, -50%) translate(var(--item-x), var(--item-y)) scale(1);
      transition-delay: calc(var(--item-index) * 22ms);
    }

    #${HOST_ID} .fan-btn:hover,
    #${HOST_ID} .fan-btn.is-active {
      background: linear-gradient(135deg, rgba(245, 238, 255, 0.36), rgba(208, 202, 255, 0.31) 52%, rgba(173, 231, 240, 0.23));
      border-color: rgba(239, 229, 255, 0.44);
      box-shadow: 0 12px 28px rgba(0,0,0,0.28), 0 0 24px rgba(176, 151, 255, 0.28), inset 0 1px 0 rgba(255,255,255,0.14);
    }

    #${HOST_ID} .fan-empty {
      position: absolute;
      left: 72px;
      top: 12px;
      min-width: 94px;
      padding: 8px 10px;
      border-radius: 999px;
      border: 1px dashed rgba(236,229,255,0.22);
      color: rgba(246, 250, 255, 0.72);
      background: rgba(20, 22, 30, 0.68);
      font-size: 12px;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.16s ease;
    }

    #${HOST_ID}.fan-open .fan-empty { opacity: 1; }

    @media (prefers-reduced-motion: reduce) {
      #${HOST_ID} .orb,
      #${HOST_ID} .fan-surface,
      #${HOST_ID} .fan-rib,
      #${HOST_ID} .fan-btn,
      #${HOST_ID} .fan-empty { transition: none !important; animation: none !important; }
    }
  `;
  pdoc.head.appendChild(style);

  const root = pdoc.createElement('div');
  root.id = HOST_ID;
  root.style.left = `${pos.x}px`;
  root.style.top = `${pos.y}px`;
  root.innerHTML = `
    <button type="button" class="orb" id="${HOST_ID}-orb" title="中国扇形 host demo">
      <svg class="orb-icon" viewBox="0 0 512 512" aria-hidden="true">
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
    </button>
    <div class="fan" id="${HOST_ID}-fan">
      <div class="fan-surface" aria-hidden="true"></div>
      <div class="fan-ribs" id="${HOST_ID}-fan-ribs"></div>
      <div class="fan-items" id="${HOST_ID}-fan-items"></div>
    </div>
  `;
  (pdoc.documentElement || pdoc.body).appendChild(root);

  const orb = pdoc.getElementById(`${HOST_ID}-orb`);
  const fan = pdoc.getElementById(`${HOST_ID}-fan`);
  const fanRibs = pdoc.getElementById(`${HOST_ID}-fan-ribs`);
  const fanItems = pdoc.getElementById(`${HOST_ID}-fan-items`);

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

  function getFanArc() {
    const rect = root.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const leftSide = centerX < pwin.innerWidth / 2;
    const topSide = centerY < pwin.innerHeight / 2;

    if (leftSide && topSide) return { start: 4, spread: 96, surfaceAngle: 4 };
    if (!leftSide && topSide) return { start: 80, spread: 96, surfaceAngle: 80 };
    if (leftSide && !topSide) return { start: -100, spread: 96, surfaceAngle: -100 };
    return { start: 180, spread: 96, surfaceAngle: 180 };
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
      console.warn('[中国扇形 Host Demo] 保存位置失败', error);
    }
  }

  function clampRootPosition() {
    const nextX = Math.max(8, Math.min(parseInt(root.style.left, 10) || 0, pwin.innerWidth - 64));
    const nextY = Math.max(8, Math.min(parseInt(root.style.top, 10) || 0, pwin.innerHeight - 64));
    root.style.left = `${nextX}px`;
    root.style.top = `${nextY}px`;
  }

  function renderFan() {
    const arc = getFanArc();
    const count = modules.length;
    root.style.setProperty('--fan-angle', `${arc.surfaceAngle}deg`);

    if (!count) {
      fanRibs.innerHTML = '';
      fanItems.innerHTML = '<div class="fan-empty">暂无模块</div>';
      return;
    }

    const step = count === 1 ? 0 : arc.spread / (count - 1);
    const radiusBase = count > 5 ? 108 : 112;
    const radiusStep = count > 5 ? 9 : 0;

    fanRibs.innerHTML = modules
      .map((_, index) => {
        const angle = arc.start + index * step;
        const radius = radiusBase + index * radiusStep;
        return `<div class="fan-rib" style="--rib-angle:${angle}deg;--rib-length:${radius + 12}px;"></div>`;
      })
      .join('');

    fanItems.innerHTML = modules
      .map((module, index) => {
        const angle = arc.start + index * step;
        const radius = radiusBase + index * radiusStep;
        const radian = (angle * Math.PI) / 180;
        const x = Math.cos(radian) * radius;
        const y = Math.sin(radian) * radius;
        return `
          <button
            type="button"
            class="fan-btn ${module.active ? 'is-active' : ''}"
            data-module-key="${escapeHtml(module.key)}"
            style="--item-x:${x.toFixed(2)}px;--item-y:${y.toFixed(2)}px;--item-index:${index};"
            title="${escapeHtml(module.name)}"
          >${escapeHtml(module.name)}</button>
        `;
      })
      .join('');
  }

  function setFanOpen(nextOpen) {
    fanOpen = Boolean(nextOpen);
    root.classList.toggle('fan-open', fanOpen);
    if (fanOpen) renderFan();
  }

  function toggleFan() {
    if (destroyed) return;
    setFanOpen(!fanOpen);
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
    const nextX = Math.max(8, Math.min(clientX - offsetX, pwin.innerWidth - 64));
    const nextY = Math.max(8, Math.min(clientY - offsetY, pwin.innerHeight - 64));
    const currentX = parseInt(root.style.left, 10) || 0;
    const currentY = parseInt(root.style.top, 10) || 0;
    if (Math.hypot(nextX - currentX, nextY - currentY) > 3) {
      moved = true;
    }
    root.style.left = `${nextX}px`;
    root.style.top = `${nextY}px`;
    if (fanOpen) renderFan();
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
    renderFan();

    try {
      await module.onClick();
    } catch (error) {
      console.error(`模块点击失败: ${module.name}`, error);
      showToast('error', `模块「${module.name}」点击失败：${error?.message || '未知错误'}`);
    } finally {
      modules.forEach(item => {
        item.active = false;
      });
      renderFan();
      setFanOpen(false);
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

    if (!key) return buildResult(false, 'key_required');
    if (!name) return buildResult(false, 'name_required');
    if (typeof onClick !== 'function') return buildResult(false, 'onclick_required');
    if (moduleMap.has(key)) return buildResult(false, 'duplicate_key', moduleMap.get(key));
    if (modules.length >= MAX_MODULES) return buildResult(false, 'max_modules_reached');

    const normalizedModule = { key, name, onClick, active: false };
    modules.push(normalizedModule);
    moduleMap.set(key, normalizedModule);
    renderFan();
    return buildResult(true, '', normalizedModule);
  }

  function unregisterModule(key) {
    const normalizedKey = String(key || '').trim();
    const target = moduleMap.get(normalizedKey);
    if (!target) return buildResult(false, 'module_not_found');

    moduleMap.delete(normalizedKey);
    const index = modules.findIndex(item => item.key === normalizedKey);
    if (index >= 0) modules.splice(index, 1);
    renderFan();
    return buildResult(true, '', target);
  }

  function getModules() {
    return modules.map(module => ({ key: module.key, name: module.name, onClick: module.onClick }));
  }

  function destroy() {
    if (destroyed) return;
    destroyed = true;
    while (cleanupTasks.length) {
      const task = cleanupTasks.pop();
      try {
        task?.();
      } catch (error) {
        console.warn('清理中国扇形 host demo 失败:', error);
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

  const handleOrbPressStart = event => {
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

  const handleOrbClick = event => {
    event.stopPropagation();
    if (suppressClick) {
      suppressClick = false;
      return;
    }
    toggleFan();
  };

  const handleFanClick = async event => {
    const button = event.target.closest?.('[data-module-key]');
    if (!button) return;
    event.stopPropagation();
    await invokeModule(button.getAttribute('data-module-key'));
  };

  const handleDocumentPointerAway = event => {
    if (destroyed || !fanOpen) return;
    if (root.contains(event.target)) return;
    setFanOpen(false);
  };

  const handleKeyDown = event => {
    if (event.key === 'Escape' && fanOpen) setFanOpen(false);
  };

  const handleResize = () => {
    clampRootPosition();
    renderFan();
  };

  addManagedListener(orb, 'mousedown', handleOrbPressStart);
  addManagedListener(orb, 'touchstart', handleOrbPressStart, { passive: false });
  addManagedListener(orb, 'click', handleOrbClick);
  addManagedListener(fan, 'click', handleFanClick);
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

  const demoNames = ['月历', '世界书', '背包', '关系', '任务', '地图', '设置', '日志'];
  demoNames.forEach((name, index) => {
    registerModule({
      key: `demo-${index + 1}`,
      name,
      onClick: () => showToast('success', `你点击了「${name}」`, 'Demo 模块'),
    });
  });

  clampRootPosition();
  renderFan();

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

  showToast('success', '中国扇形 host demo 已加载：点击展开，拖动移动位置');
}));

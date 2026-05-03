$(
  errorCatched(async () => {
    const HOST_ID = 'mdpoem-inertia-wheel-host-demo';
    const HOST_STYLE_ID = `${HOST_ID}-style`;
    const POSITION_VAR_KEY = 'mdpoem_inertia_wheel_host_demo_pos';
    const HOST_GLOBAL_KEY = '__mdpoemFloatingHost__';
    const INSTANCE_KEY = '__mdpoemFloatingHostInstance__';
    const MAX_MODULES = 8;
    const VERSION = 'demo-0.1.0';

    let pdoc;
    let pwin;
    try {
      pdoc = parent && parent.document ? parent.document : document;
      pwin = parent && parent.window ? parent.window : window;
    } catch (error) {
      pdoc = document;
      pwin = window;
    }

    function showToast(level, message, title = '惯性轮盘 Demo') {
      try {
        if (typeof toastr?.[level] === 'function') {
          toastr[level](message, title);
          return;
        }
      } catch (error) {
        console.warn('[惯性轮盘 Demo] toastr 不可用，改用 console 输出', error);
      }

      const prefix = title ? `[${title}] ` : '';
      const logger = level === 'error' ? console.error : level === 'warning' ? console.warn : console.log;
      logger(`${prefix}${message}`);
    }

    pwin[INSTANCE_KEY]?.destroy?.();

    const cleanupTasks = [];
    const modules = [];
    const moduleMap = new Map();
    const angleSamples = [];

    let destroyed = false;
    let wheelOpen = false;
    let draggingHost = false;
    let draggingWheel = false;
    let movedHost = false;
    let movedWheel = false;
    let hostOffsetX = 0;
    let hostOffsetY = 0;
    let wheelRotation = -90;
    let wheelVelocity = 0;
    let animationFrame = 0;
    let activeModuleKey = '';
    let pressTimer = 0;
    let pressStartedAt = 0;
    let longPressReady = false;

    const isMobile = pwin.innerWidth <= 768;
    let pos = isMobile
      ? { x: pwin.innerWidth - 76, y: pwin.innerHeight - 96 }
      : { x: pwin.innerWidth - 96, y: pwin.innerHeight - 120 };

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
      console.warn('[惯性轮盘 Demo] 读取保存位置失败', error);
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
      --wheel-radius: 116px;
      --wheel-angle: -90deg;
    }

    #${HOST_ID} * { box-sizing: border-box; }

    #${HOST_ID} .orb {
      position: absolute;
      inset: 0;
      width: 58px;
      height: 58px;
      border-radius: 18px;
      cursor: grab;
      z-index: 10;
      background: linear-gradient(135deg, rgba(235, 226, 255, 0.28), rgba(190, 198, 255, 0.24) 52%, rgba(144, 221, 231, 0.18));
      border: 1px solid rgba(255, 255, 255, 0.26);
      color: #f8fbff;
      backdrop-filter: blur(18px) saturate(125%);
      -webkit-backdrop-filter: blur(18px) saturate(125%);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 16px 36px rgba(0, 0, 0, 0.28), inset 0 1px 0 rgba(255,255,255,0.16);
      transition: transform 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;
    }

    #${HOST_ID}.is-host-dragging .orb,
    #${HOST_ID}.is-wheel-dragging .orb { cursor: grabbing; }

    #${HOST_ID}.wheel-open .orb {
      transform: scale(1.03) rotate(10deg);
      box-shadow: 0 16px 38px rgba(0, 0, 0, 0.3), 0 0 34px rgba(174, 143, 255, 0.32), inset 0 1px 0 rgba(255,255,255,0.18);
    }

    #${HOST_ID} .orb::before {
      content: '';
      position: absolute;
      inset: -14px;
      border-radius: 26px;
      pointer-events: none;
      opacity: 0;
      background: radial-gradient(circle, rgba(236, 225, 255, 0.52), rgba(167, 151, 255, 0.2) 46%, rgba(109, 222, 238, 0) 74%);
      filter: blur(13px);
      transition: opacity 0.24s ease;
    }

    #${HOST_ID}.wheel-open .orb::before { opacity: 1; }

    #${HOST_ID} .orb-icon {
      position: relative;
      z-index: 2;
      width: 29px;
      height: 29px;
      filter: drop-shadow(0 2px 6px rgba(0,0,0,0.36));
      pointer-events: none;
    }

    #${HOST_ID} .wheel {
      position: absolute;
      left: 29px;
      top: 29px;
      width: 0;
      height: 0;
      pointer-events: none;
      z-index: 6;
    }

    #${HOST_ID}.wheel-open .wheel { pointer-events: auto; }

    #${HOST_ID} .wheel-arc {
      position: absolute;
      left: calc(var(--wheel-radius) * -1);
      top: calc(var(--wheel-radius) * -1);
      width: calc(var(--wheel-radius) * 2);
      height: calc(var(--wheel-radius) * 2);
      border-radius: 50%;
      opacity: 0;
      transform: scale(0.72) rotate(var(--wheel-angle));
      transform-origin: center;
      background:
        radial-gradient(circle at center, transparent 0 52px, rgba(188, 168, 255, 0.10) 53px, rgba(169, 222, 235, 0.045) 112px, transparent 118px),
        conic-gradient(from -15deg, rgba(232, 222, 255, 0), rgba(212, 194, 255, 0.18), rgba(151, 225, 233, 0.12), rgba(232, 222, 255, 0));
      filter: blur(0.2px);
      transition: opacity 0.2s ease, transform 0.28s cubic-bezier(.19,1,.22,1);
      pointer-events: none;
    }

    #${HOST_ID}.wheel-open .wheel-arc {
      opacity: 1;
      transform: scale(1) rotate(var(--wheel-angle));
    }

    #${HOST_ID} .wheel-item {
      position: absolute;
      left: 0;
      top: 0;
      width: 74px;
      min-height: 34px;
      padding: 7px 9px;
      border-radius: 999px;
      border: 1px solid rgba(236, 229, 255, 0.22);
      background: linear-gradient(135deg, rgba(227, 220, 255, 0.26), rgba(196, 201, 255, 0.22) 52%, rgba(157, 206, 221, 0.16));
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
      transform: translate(-50%, -50%) scale(0.52);
      transition: opacity 0.18s ease, transform 0.22s cubic-bezier(.19,1,.22,1), background 0.15s ease, border-color 0.15s ease;
      white-space: nowrap;
      pointer-events: none;
    }

    #${HOST_ID}.wheel-open .wheel-item {
      opacity: 1;
      pointer-events: auto;
      transform: translate(-50%, -50%) translate(var(--item-x), var(--item-y)) scale(1);
      transition-delay: calc(var(--item-index) * 18ms);
    }

    #${HOST_ID} .wheel-item:hover,
    #${HOST_ID} .wheel-item.is-active {
      background: linear-gradient(135deg, rgba(245, 238, 255, 0.34), rgba(208, 202, 255, 0.30) 52%, rgba(173, 231, 240, 0.22));
      border-color: rgba(239, 229, 255, 0.42);
      box-shadow: 0 12px 28px rgba(0,0,0,0.28), 0 0 24px rgba(176, 151, 255, 0.26), inset 0 1px 0 rgba(255,255,255,0.14);
    }

    #${HOST_ID} .wheel-tip {
      position: absolute;
      left: 50%;
      top: 70px;
      transform: translateX(-50%);
      min-width: 118px;
      padding: 7px 10px;
      border-radius: 999px;
      color: rgba(246, 250, 255, 0.72);
      background: rgba(20, 22, 30, 0.72);
      border: 1px solid rgba(236,229,255,0.14);
      font-size: 11px;
      text-align: center;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.2s ease;
      box-shadow: 0 10px 20px rgba(0,0,0,0.2);
    }

    #${HOST_ID}.wheel-open .wheel-tip { opacity: 1; }

    @media (prefers-reduced-motion: reduce) {
      #${HOST_ID} .orb,
      #${HOST_ID} .wheel-arc,
      #${HOST_ID} .wheel-item,
      #${HOST_ID} .wheel-tip { transition: none !important; animation: none !important; }
    }
  `;
    pdoc.head.appendChild(style);

    const root = pdoc.createElement('div');
    root.id = HOST_ID;
    root.style.left = `${pos.x}px`;
    root.style.top = `${pos.y}px`;
    root.innerHTML = `
    <button type="button" class="orb" id="${HOST_ID}-orb" title="惯性轮盘 host demo">
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
    <div class="wheel" id="${HOST_ID}-wheel">
      <div class="wheel-arc" aria-hidden="true"></div>
      <div class="wheel-items" id="${HOST_ID}-wheel-items"></div>
      <div class="wheel-tip">拖动轮盘施力旋转</div>
    </div>
  `;
    (pdoc.documentElement || pdoc.body).appendChild(root);

    const orb = pdoc.getElementById(`${HOST_ID}-orb`);
    const wheel = pdoc.getElementById(`${HOST_ID}-wheel`);
    const wheelItems = pdoc.getElementById(`${HOST_ID}-wheel-items`);

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

    function normalizeAngle(angle) {
      return ((angle % 360) + 360) % 360;
    }

    function shortestAngleDelta(from, to) {
      return ((to - from + 540) % 360) - 180;
    }

    function getCenter() {
      const rect = root.getBoundingClientRect();
      return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };
    }

    function getPointerAngle(clientX, clientY) {
      const center = getCenter();
      return (Math.atan2(clientY - center.y, clientX - center.x) * 180) / Math.PI;
    }

    function getPreferredArc() {
      const rect = root.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const leftSide = centerX < pwin.innerWidth / 2;
      const topSide = centerY < pwin.innerHeight / 2;
      if (leftSide && topSide) return { start: 8, spread: 112 };
      if (!leftSide && topSide) return { start: 60, spread: 112 };
      if (leftSide && !topSide) return { start: -112, spread: 112 };
      return { start: 180, spread: 112 };
    }

    function getItemAngles() {
      const count = Math.max(1, modules.length);
      const arc = getPreferredArc();
      const step = count === 1 ? 0 : arc.spread / (count - 1);
      return modules.map((_, index) => arc.start + index * step + wheelRotation);
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
        console.warn('[惯性轮盘 Demo] 保存位置失败', error);
      }
    }

    function clampRootPosition() {
      const nextX = Math.max(8, Math.min(parseInt(root.style.left, 10) || 0, pwin.innerWidth - 64));
      const nextY = Math.max(8, Math.min(parseInt(root.style.top, 10) || 0, pwin.innerHeight - 64));
      root.style.left = `${nextX}px`;
      root.style.top = `${nextY}px`;
    }

    function stopInertia() {
      if (animationFrame) {
        pwin.cancelAnimationFrame(animationFrame);
        animationFrame = 0;
      }
      wheelVelocity = 0;
    }

    function updateWheel() {
      const radius = Math.min(132, Math.max(96, Math.min(pwin.innerWidth, pwin.innerHeight) * 0.18));
      root.style.setProperty('--wheel-radius', `${radius}px`);
      root.style.setProperty('--wheel-angle', `${wheelRotation}deg`);

      const angles = getItemAngles();
      wheelItems.innerHTML = modules
        .map((module, index) => {
          const angle = angles[index];
          const radian = (angle * Math.PI) / 180;
          const x = Math.cos(radian) * radius;
          const y = Math.sin(radian) * radius;
          return `
          <button
            type="button"
            class="wheel-item ${activeModuleKey === module.key ? 'is-active' : ''}"
            data-module-key="${escapeHtml(module.key)}"
            style="--item-x:${x.toFixed(2)}px;--item-y:${y.toFixed(2)}px;--item-index:${index};"
            title="${escapeHtml(module.name)}"
          >${escapeHtml(module.name)}</button>
        `;
        })
        .join('');
    }

    function setWheelOpen(nextOpen) {
      wheelOpen = Boolean(nextOpen);
      root.classList.toggle('wheel-open', wheelOpen);
      if (wheelOpen) {
        updateWheel();
      } else {
        stopInertia();
      }
    }

    function toggleWheel() {
      if (destroyed) return;
      setWheelOpen(!wheelOpen);
    }

    function findNearestSnapRotation() {
      if (!modules.length) return wheelRotation;
      const arc = getPreferredArc();
      const count = modules.length;
      const step = count === 1 ? 0 : arc.spread / (count - 1);
      const focusAngle = arc.start + arc.spread / 2;
      let bestRotation = wheelRotation;
      let bestDistance = Infinity;

      for (let index = 0; index < count; index += 1) {
        const baseAngle = arc.start + index * step;
        const candidate =
          wheelRotation + shortestAngleDelta(normalizeAngle(baseAngle + wheelRotation), normalizeAngle(focusAngle));
        const distance = Math.abs(
          shortestAngleDelta(normalizeAngle(baseAngle + candidate), normalizeAngle(focusAngle)),
        );
        if (distance < bestDistance) {
          bestDistance = distance;
          bestRotation = candidate;
        }
      }
      return bestRotation;
    }

    function animateSnap() {
      const target = findNearestSnapRotation();
      const diff = shortestAngleDelta(wheelRotation, target);
      if (Math.abs(diff) < 0.4) {
        wheelRotation = target;
        updateWheel();
        animationFrame = 0;
        return;
      }
      wheelRotation += diff * 0.18;
      updateWheel();
      animationFrame = pwin.requestAnimationFrame(animateSnap);
    }

    function startInertia() {
      if (Math.abs(wheelVelocity) < 0.05) {
        animateSnap();
        return;
      }
      const reducedMotion = pwin.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      if (reducedMotion) {
        animateSnap();
        return;
      }

      const tick = () => {
        wheelRotation += wheelVelocity;
        wheelVelocity *= 0.93;
        updateWheel();
        if (Math.abs(wheelVelocity) < 0.06) {
          animateSnap();
          return;
        }
        animationFrame = pwin.requestAnimationFrame(tick);
      };
      animationFrame = pwin.requestAnimationFrame(tick);
    }

    function addAngleSample(angle) {
      const now = performance.now();
      angleSamples.push({ angle, time: now });
      while (angleSamples.length > 6 || (angleSamples[0] && now - angleSamples[0].time > 140)) {
        angleSamples.shift();
      }
    }

    function getReleaseVelocity() {
      if (angleSamples.length < 2) return 0;
      const first = angleSamples[0];
      const last = angleSamples[angleSamples.length - 1];
      const delta = shortestAngleDelta(first.angle, last.angle);
      const time = Math.max(16, last.time - first.time);
      return Math.max(-9, Math.min(9, (delta / time) * 16));
    }

    function startHostDrag(clientX, clientY) {
      draggingHost = true;
      movedHost = false;
      const rect = root.getBoundingClientRect();
      hostOffsetX = clientX - rect.left;
      hostOffsetY = clientY - rect.top;
      root.classList.add('is-host-dragging');
    }

    function moveHostDrag(clientX, clientY) {
      if (!draggingHost) return;
      movedHost = true;
      root.style.left = `${Math.max(8, Math.min(clientX - hostOffsetX, pwin.innerWidth - 64))}px`;
      root.style.top = `${Math.max(8, Math.min(clientY - hostOffsetY, pwin.innerHeight - 64))}px`;
      if (wheelOpen) updateWheel();
    }

    function endHostDrag() {
      if (!draggingHost) return;
      draggingHost = false;
      root.classList.remove('is-host-dragging');
      clampRootPosition();
      if (movedHost) savePos();
    }

    function startWheelDrag(clientX, clientY) {
      if (!wheelOpen) return;
      stopInertia();
      draggingWheel = true;
      movedWheel = false;
      longPressReady = false;
      angleSamples.splice(0, angleSamples.length);
      const angle = getPointerAngle(clientX, clientY);
      addAngleSample(angle);
      root.classList.add('is-wheel-dragging');
    }

    function moveWheelDrag(clientX, clientY) {
      if (!draggingWheel) return;
      const angle = getPointerAngle(clientX, clientY);
      const previous = angleSamples.length ? angleSamples[angleSamples.length - 1].angle : angle;
      const delta = shortestAngleDelta(previous, angle);
      if (Math.abs(delta) > 0.3) {
        movedWheel = true;
      }
      wheelRotation += delta;
      addAngleSample(angle);
      updateWheel();
    }

    function endWheelDrag() {
      if (!draggingWheel) return;
      draggingWheel = false;
      root.classList.remove('is-wheel-dragging');
      wheelVelocity = getReleaseVelocity();
      if (movedWheel) {
        startInertia();
      } else {
        animateSnap();
      }
    }

    async function invokeModule(key) {
      const module = moduleMap.get(key);
      if (!module) {
        showToast('warning', '模块不存在，无法执行');
        return;
      }
      activeModuleKey = key;
      updateWheel();
      try {
        await module.onClick();
      } catch (error) {
        console.error(`模块点击失败: ${module.name}`, error);
        showToast('error', `模块「${module.name}」点击失败：${error?.message || '未知错误'}`);
      } finally {
        activeModuleKey = '';
        updateWheel();
        setWheelOpen(false);
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

      const normalizedModule = { key, name, onClick };
      modules.push(normalizedModule);
      moduleMap.set(key, normalizedModule);
      updateWheel();
      return buildResult(true, '', normalizedModule);
    }

    function unregisterModule(key) {
      const normalizedKey = String(key || '').trim();
      const target = moduleMap.get(normalizedKey);
      if (!target) return buildResult(false, 'module_not_found');

      moduleMap.delete(normalizedKey);
      const index = modules.findIndex(item => item.key === normalizedKey);
      if (index >= 0) modules.splice(index, 1);
      updateWheel();
      return buildResult(true, '', target);
    }

    function getModules() {
      return modules.map(module => ({ key: module.key, name: module.name, onClick: module.onClick }));
    }

    function destroy() {
      if (destroyed) return;
      destroyed = true;
      stopInertia();
      while (cleanupTasks.length) {
        const task = cleanupTasks.pop();
        try {
          task?.();
        } catch (error) {
          console.warn('清理惯性轮盘 host demo 失败:', error);
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
      pressStartedAt = performance.now();
      longPressReady = true;
      pressTimer = pwin.setTimeout(() => {
        if (!longPressReady || draggingHost || wheelOpen) return;
        setWheelOpen(true);
        startWheelDrag(point.x, point.y);
      }, 220);
      startHostDrag(point.x, point.y);
      event.preventDefault();
      event.stopPropagation();
    };

    const handleOrbClick = event => {
      event.stopPropagation();
      if (movedHost || performance.now() - pressStartedAt > 260) {
        movedHost = false;
        return;
      }
      toggleWheel();
    };

    const handleWheelPressStart = event => {
      const button = event.target.closest?.('[data-module-key]');
      if (button) return;
      const point = getPoint(event);
      startWheelDrag(point.x, point.y);
      event.preventDefault();
      event.stopPropagation();
    };

    const handleDocumentMove = event => {
      const point = getPoint(event);
      if (draggingWheel) {
        moveWheelDrag(point.x, point.y);
        event.preventDefault();
        return;
      }
      moveHostDrag(point.x, point.y);
    };

    const handleDocumentRelease = () => {
      longPressReady = false;
      if (pressTimer) {
        pwin.clearTimeout(pressTimer);
        pressTimer = 0;
      }
      endWheelDrag();
      endHostDrag();
    };

    const handleWheelClick = async event => {
      const button = event.target.closest?.('[data-module-key]');
      if (!button) return;
      event.stopPropagation();
      if (movedWheel) {
        movedWheel = false;
        return;
      }
      await invokeModule(button.getAttribute('data-module-key'));
    };

    const handleDocumentPointerAway = event => {
      if (destroyed || !wheelOpen) return;
      if (root.contains(event.target)) return;
      setWheelOpen(false);
    };

    const handleKeyDown = event => {
      if (event.key === 'Escape' && wheelOpen) {
        setWheelOpen(false);
      }
    };

    const handleResize = () => {
      clampRootPosition();
      updateWheel();
    };

    addManagedListener(orb, 'mousedown', handleOrbPressStart);
    addManagedListener(orb, 'touchstart', handleOrbPressStart, { passive: false });
    addManagedListener(orb, 'click', handleOrbClick);
    addManagedListener(wheel, 'mousedown', handleWheelPressStart);
    addManagedListener(wheel, 'touchstart', handleWheelPressStart, { passive: false });
    addManagedListener(wheel, 'click', handleWheelClick);
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
    updateWheel();

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

    showToast('success', '惯性轮盘 host demo 已加载：点击展开，按住/拖动施力旋转');
  }),
);

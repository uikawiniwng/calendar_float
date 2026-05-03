$(errorCatched(async () => {
  const MODULE_KEY = 'your-module-key';
  const MODULE_NAME = '你的模块名';
  const INSTANCE_KEY = '__yourModuleInstance__';
  const HOST_GLOBAL_KEY = '__mdpoemFloatingHost__';

  let pdoc;
  let pwin;
  try {
    pdoc = (parent && parent.document) ? parent.document : document;
    pwin = (parent && parent.window) ? parent.window : window;
  } catch (error) {
    pdoc = document;
    pwin = window;
  }

  async function waitForHost(getHost, retries = 40, interval = 50) {
    for (let attempt = 0; attempt < retries; attempt += 1) {
      const host = getHost();
      if (host) return host;
      await new Promise((resolve) => pwin.setTimeout(resolve, interval));
    }
    return getHost() || null;
  }

  function showToast(level, message, title = MODULE_NAME) {
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

  const host = await waitForHost(() => pwin[HOST_GLOBAL_KEY]);
  if (!host || typeof host.registerModule !== 'function') {
    showToast('error', '未找到 host，模块注册失败');
    return;
  }

  if (pwin[INSTANCE_KEY]?.destroy) {
    try {
      pwin[INSTANCE_KEY].destroy({ unregister: true, silent: true });
    } catch (error) {
      console.warn('清理旧模块实例失败:', error);
    }
  }

  let destroyed = false;
  let registeredToHost = false;
  const cleanupTasks = [];

  function addCleanup(task) {
    cleanupTasks.push(task);
  }

  function addManagedListener(target, type, handler, options) {
    target.addEventListener(type, handler, options);
    addCleanup(() => target.removeEventListener(type, handler, options));
  }

  function openModule() {
    if (destroyed) return;
    showToast('success', '这里写你的模块打开逻辑');
  }

  function closeModule() {
    if (destroyed) return;
    // 这里写你的模块关闭逻辑
  }

  function destroy(options = {}) {
    if (destroyed) return;
    destroyed = true;

    while (cleanupTasks.length) {
      const task = cleanupTasks.pop();
      try {
        task?.();
      } catch (error) {
        console.warn('清理模块监听失败:', error);
      }
    }

    const { unregister = false, silent = false } = options;

    // 这里清理你自己创建的 DOM / 事件 / 定时器
    // 如果你的模块会重复注入，destroy 里要确保能完整回收旧实例

    if (unregister && registeredToHost && typeof host.unregisterModule === 'function') {
      try {
        const result = host.unregisterModule(MODULE_KEY);
        if (!silent && result?.ok) {
          showToast('info', '模块已从 host 注销');
        }
      } catch (error) {
        console.warn('注销模块失败:', error);
      }
    }

    if (pwin[INSTANCE_KEY]?.destroy === destroy) {
      delete pwin[INSTANCE_KEY];
    }
  }

  const registerResult = host.registerModule({
    key: MODULE_KEY,
    name: MODULE_NAME,
    onClick: openModule,
  });

  if (!registerResult?.ok) {
    showToast('error', `注册失败：${registerResult?.reason || '未知原因'}`);
    return;
  }

  registeredToHost = true;
  pwin[INSTANCE_KEY] = {
    openModule,
    closeModule,
    destroy,
  };

  const handlePageExit = () => destroy({ unregister: true, silent: true });
  addManagedListener(window, 'pagehide', handlePageExit);
  addManagedListener(window, 'unload', handlePageExit);
}));

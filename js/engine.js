/*
 * engine.js — Điều hướng giữa các màn hình, không cần tải lại trang.
 *
 * Mỗi màn hình được đăng ký bằng:
 *   NNBT.engine.register('id', {
 *     title(params)  → tiêu đề tab (tùy chọn),
 *     resumable      → true nếu là màn hình truyện mà nút "Tiếp tục" có thể quay về,
 *     render(node, ctx) → dựng nội dung vào `node`; có thể trả về hàm dọn dẹp,
 *   });
 *
 * ctx = { params, go, back, canGoBack, store, story, ui, reducedMotion }
 *
 * - Chuyển cảnh: mờ dần ra / vào (CSS), bỏ qua hoàn toàn khi hệ điều hành bật giảm chuyển động.
 * - Lịch sử "Quay lại" giữ trong bộ nhớ của phiên.
 * - Sau mỗi lần chuyển, focus được đặt vào tiêu đề màn hình mới cho người dùng bàn phím và trình đọc màn hình.
 */
window.NNBT = window.NNBT || {};

(function (NNBT) {
  'use strict';

  const TRANSITION_MS = 450; // khớp với --dur-screen trong css/base.css
  const screens = new Map();
  const historyStack = [];
  const motionQuery = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;

  let stage = null;
  let current = null; // { id, params, node, cleanup }
  let queue = Promise.resolve();
  let pendingKey = null; // lượt chuyển gần nhất đang chờ

  function reducedMotion() {
    return !!(motionQuery && motionQuery.matches);
  }

  // Chờ trình duyệt vẽ xong khung hình để hiệu ứng mờ vào chạy được.
  // requestAnimationFrame bị tạm dừng khi tab chạy nền, nên có hạn chờ dự phòng để không bao giờ bị kẹt.
  function nextFrame() {
    return new Promise((resolve) => {
      let done = false;
      const finish = () => { if (!done) { done = true; resolve(); } };
      window.requestAnimationFrame(() => window.requestAnimationFrame(finish));
      window.setTimeout(finish, 60);
    });
  }

  // Chờ hiệu ứng chuyển cảnh kết thúc; có hạn chờ để không bao giờ bị kẹt.
  function waitForTransition(node) {
    if (reducedMotion()) return Promise.resolve();
    return new Promise((resolve) => {
      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        node.removeEventListener('transitionend', onEnd);
        resolve();
      };
      const onEnd = (e) => { if (e.target === node) finish(); };
      node.addEventListener('transitionend', onEnd);
      window.setTimeout(finish, TRANSITION_MS + 150);
    });
  }

  function register(id, def) {
    if (screens.has(id)) throw new Error('[engine] Màn hình "' + id + '" đã được đăng ký.');
    if (!def || typeof def.render !== 'function') throw new Error('[engine] Màn hình "' + id + '" thiếu hàm render.');
    screens.set(id, def);
  }

  function init(stageEl) {
    stage = stageEl;
  }

  /**
   * Chuyển sang màn hình khác.
   * opts.replace: không ghi màn hình hiện tại vào lịch sử.
   * opts.clearHistory: xóa toàn bộ lịch sử "Quay lại".
   */
  function go(id, params, opts) {
    // Bỏ qua yêu cầu trùng với lượt đang chờ (ví dụ chạm đúp vào cùng một nút).
    const key = id + '|' + JSON.stringify(params || {}) + '|' + (opts && opts.isBack ? 'back' : '');
    if (key === pendingKey) return queue;
    pendingKey = key;

    // Khóa màn hình hiện tại ngay lập tức để không chạm nhầm trong lúc chuyển.
    if (current) current.node.inert = true;
    queue = queue
      .then(() => transition(id, params || {}, opts || {}))
      .then(() => { if (pendingKey === key) pendingKey = null; })
      .catch((err) => {
        if (pendingKey === key) pendingKey = null;
        console.error('[engine] Lỗi khi chuyển màn hình:', err);
        // Mở khóa lại màn hình đang hiển thị để người chơi không bị kẹt.
        if (current && current.node.isConnected) {
          current.node.inert = false;
          current.node.classList.remove('is-leaving', 'is-entering');
          current.node.removeAttribute('aria-hidden');
        }
        NNBT.ui.toast(NNBT.story.ui.errors.navigation, { tone: 'error' });
      });
    return queue;
  }

  function back() {
    // Chạm đúp "Quay lại" chỉ lùi một bước.
    if (pendingKey && pendingKey.slice(-5) === '|back') return queue;
    const prev = historyStack.pop();
    return go(prev ? prev.id : 'start', prev ? prev.params : {}, { isBack: true });
  }

  function canGoBack() {
    return historyStack.length > 0;
  }

  async function transition(id, params, opts) {
    if (!stage) throw new Error('[engine] Chưa gọi engine.init().');

    let def = screens.get(id);
    if (!def) {
      console.warn('[engine] Không có màn hình "' + id + '", quay về trang đầu.');
      id = 'start';
      params = {};
      def = screens.get('start');
    }

    if (opts.clearHistory) historyStack.length = 0;
    if (current && !opts.isBack && !opts.replace && !opts.clearHistory) {
      historyStack.push({ id: current.id, params: current.params });
    }

    // 1. Mờ dần màn hình cũ
    const prev = current;
    if (prev) {
      prev.node.classList.add('is-leaving');
      prev.node.setAttribute('aria-hidden', 'true');
      await waitForTransition(prev.node);
      if (prev.cleanup) {
        try { prev.cleanup(); } catch (e) { console.error('[engine] Lỗi khi dọn màn hình:', e); }
      }
      prev.node.remove();
    }

    // 2. Dựng màn hình mới
    const node = document.createElement('section');
    node.className = 'screen is-entering';
    node.dataset.screen = id;

    const ctx = {
      params,
      go,
      back,
      canGoBack,
      store: NNBT.store,
      story: NNBT.story,
      ui: NNBT.ui,
      reducedMotion
    };
    const cleanup = def.render(node, ctx);
    stage.append(node);
    stage.dataset.screen = id;
    current = { id, params, node, cleanup: typeof cleanup === 'function' ? cleanup : null };

    const screenTitle = def.title ? def.title(params) : '';
    document.title = screenTitle ? screenTitle + ' · ' + NNBT.story.title : NNBT.story.title;

    // Ghi lại tên màn hình. Màn hình truyện (resumable) còn được nhớ làm điểm "Tiếp tục",
    // trừ khi đang xem lại kỷ niệm.
    NNBT.store.update((s) => {
      s.screen = id;
      if (def.resumable && !s.replay.active) s.resumeScreen = id;
    });
    document.dispatchEvent(new CustomEvent('nnbt:screenchange', { detail: { id, params } }));

    // 3. Hiện dần màn hình mới, đưa focus về tiêu đề
    window.scrollTo(0, 0);
    await nextFrame();
    node.classList.remove('is-entering');
    focusScreen(node);
    if (screenTitle) NNBT.ui.announce(screenTitle);
    await waitForTransition(node);
  }

  function focusScreen(node) {
    const target = node.querySelector('[data-autofocus]') || node.querySelector('h1, h2');
    if (!target) return;
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    try {
      target.focus({ preventScroll: true });
    } catch (e) {
      target.focus();
    }
  }

  NNBT.engine = {
    register,
    init,
    go,
    back,
    canGoBack,
    reducedMotion,
    // Promise hoàn tất khi mọi lượt chuyển cảnh đang chờ đã xong.
    whenIdle: () => queue,
    get currentId() { return current ? current.id : null; }
  };
})(window.NNBT);

/*
 * main.js — Khởi động ứng dụng: gắn thanh trên cùng, thông báo trạng thái lưu, mở màn hình đầu tiên.
 * Luôn mở ở trang đầu; người chơi chủ động bấm "Tiếp tục" để quay lại chỗ đang đọc.
 *
 * Bảng kiểm tra trạng thái (cho người phát triển): thêm #debug vào cuối địa chỉ, ví dụ index.html#debug
 */
(function (NNBT) {
  'use strict';

  const { store, engine, ui, story } = NNBT;

  // Dự án chưa có âm thanh nào (xem ASSETS.md). Ẩn nút để không có điều khiển "bấm mà không có gì xảy ra".
  // Khi thêm âm thanh: đổi thành true và nối nút với phần phát âm thanh.
  const SOUND_AVAILABLE = false;

  function setupSoundToggle() {
    const btn = document.getElementById('btn-sound');
    const label = document.getElementById('sound-label');
    if (!SOUND_AVAILABLE) {
      btn.hidden = true;
      return;
    }

    function render(state) {
      const on = state.audio.enabled;
      btn.setAttribute('aria-pressed', String(on));
      btn.classList.toggle('is-on', on);
      label.textContent = on ? story.ui.sound.on : story.ui.sound.off;
    }

    btn.addEventListener('click', () => {
      const turningOn = !store.get().audio.enabled;
      store.update((s) => { s.audio.enabled = turningOn; });
    });

    store.subscribe(render);
    render(store.get());
  }

  function setupHomeButton() {
    const btn = document.getElementById('btn-home');
    btn.addEventListener('click', () => engine.go('start', {}, { clearHistory: true }));
    document.addEventListener('nnbt:screenchange', (e) => {
      btn.hidden = e.detail.id === 'start';
    });
  }

  function setupDebugPanel() {
    if (window.location.hash !== '#debug') return;
    // Đánh dấu các câu chữ [NHÁP – cần duyệt] trên giao diện (chỉ ở chế độ debug).
    document.body.classList.add('is-debug');
    const pre = ui.el('pre', { class: 'debug__state' });
    const panel = ui.el('details', { class: 'debug', open: true }, [
      ui.el('summary', { text: 'Trạng thái (debug)' }),
      ui.el('p', { class: 'debug__meta', text: 'localStorage: ' + (store.storageAvailable ? 'dùng được' : 'không dùng được') + ' · lúc tải: ' + store.loadStatus }),
      pre
    ]);
    const render = (s) => { pre.textContent = JSON.stringify(s, null, 2); };
    store.subscribe(render);
    render(store.get());
    document.body.append(panel);
  }

  function reportStorageStatus() {
    if (store.loadStatus === 'corrupt') ui.toast(story.ui.storage.corrupt, { tone: 'warn', duration: 6000 });
    else if (store.loadStatus === 'unavailable') ui.toast(story.ui.storage.unavailable, { tone: 'warn', duration: 6000 });
  }

  function boot() {
    engine.init(document.getElementById('stage'));
    if (NNBT.decor) NNBT.decor.init(); // trang trí nền, đổi theo chương
    setupSoundToggle();
    setupHomeButton();
    setupDebugPanel();

    // Chế độ xem lại không giữ qua lần mở trang mới.
    store.update((s) => { s.replay = { active: false, chapter: null }; }, { persist: false });

    engine.go('start', {}, { replace: true });
    reportStorageStatus();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})(window.NNBT);

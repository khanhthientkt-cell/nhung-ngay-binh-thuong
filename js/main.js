/*
 * main.js — Khởi động ứng dụng: gắn thanh trên cùng, thông báo trạng thái lưu, mở màn hình đầu tiên.
 * Luôn mở ở trang đầu; người chơi chủ động bấm "Tiếp tục" để quay lại chỗ đang đọc.
 *
 * Bảng kiểm tra trạng thái (cho người phát triển): thêm #debug vào cuối địa chỉ, ví dụ index.html#debug
 */
(function (NNBT) {
  'use strict';

  const { store, engine, ui, story } = NNBT;

  // Nút âm thanh chỉ hiện khi nhạc nền tải được (js/content/music-config.js),
  // để không có điều khiển "bấm mà không có gì xảy ra".
  function setupSoundToggle() {
    const btn = document.getElementById('btn-sound');
    const label = document.getElementById('sound-label');
    btn.hidden = true;
    const music = NNBT.music;
    if (!music || !music.configured) return;

    function render(state) {
      const on = !state.audio.muted;
      btn.setAttribute('aria-pressed', String(on));
      btn.classList.toggle('is-on', on);
      label.textContent = on ? story.ui.sound.on : story.ui.sound.off;
    }

    music.whenReady().then((ok) => {
      if (!ok) return;
      if (music.title) btn.title = story.ui.music.credit + ': ' + music.title;
      btn.addEventListener('click', () => music.toggle());
      store.subscribe(render);
      render(store.get());
      btn.hidden = false;
    });
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
    if (NNBT.music) NNBT.music.init(); // nhạc nền (nếu có tệp), không tự phát
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

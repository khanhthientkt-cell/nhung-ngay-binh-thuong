/*
 * music.js — Nhạc nền bằng video YouTube nhúng (cấu hình trong js/content/music-config.js).
 *
 * - Khung nhạc nhỏ cố định ở góc phải dưới, chứa trình phát YouTube 200×200 (YouTube không cho ẩn trình phát).
 * - Nhạc TỰ CHẠY từ cú chạm / phím bấm đầu tiên (vd nút "Bắt đầu") — trình duyệt không cho phát tiếng
 *   trước khi người xem tương tác — rồi chạy liền một mạch qua mọi màn hình, không bắt đầu lại khi đổi trang.
 * - Chỉ dừng khi người chơi tắt tiếng (audio.muted trong store) bằng nút trên thanh trên cùng.
 * - Hết bài thì phát lại từ đầu; to dần / nhỏ dần khi bật tắt; tạm dừng khi chuyển sang tab trình duyệt khác.
 * - Không tải được YouTube (mất mạng, video bị gỡ hoặc tắt nhúng) → khung nhạc và nút âm thanh tự ẩn.
 */
(function (NNBT) {
  'use strict';

  const cfg = NNBT.musicConfig || {};
  const FADE_MS = 1600;
  const VOLUME = Math.round(100 * (typeof cfg.volume === 'number' ? Math.min(1, Math.max(0, cfg.volume)) : 0.5));
  const START = typeof cfg.start === 'number' && cfg.start > 0 ? Math.floor(cfg.start) : 0; // bỏ qua đoạn mở đầu (giây)

  let player = null;
  let card = null;
  let available = false;
  let ready = null;
  let interacted = false; // đã có cú chạm / phím bấm trong lần mở trang này
  let playing = false;    // ý định hiện tại: đang phát hay đã dừng
  let volume = VOLUME;
  let fadeTimer = null;

  function loadApi() {
    return new Promise((resolve, reject) => {
      if (window.YT && window.YT.Player) { resolve(window.YT); return; }
      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (typeof prev === 'function') prev();
        resolve(window.YT);
      };
      const s = document.createElement('script');
      s.src = 'https://www.youtube.com/iframe_api';
      s.async = true;
      s.onerror = reject;
      document.head.append(s);
    });
  }

  function buildCard() {
    const { el } = NNBT.ui;
    const slot = el('div', { class: 'music-card__slot' });
    card = el('aside', { class: 'music-card', 'aria-label': NNBT.story.ui.music.credit }, [
      el('div', { class: 'music-card__head' }, [
        el('span', { class: 'music-card__disc', 'aria-hidden': 'true' }),
        el('span', { class: 'music-card__text' }, [
          el('span', { class: 'music-card__label', text: NNBT.story.ui.music.credit }),
          el('span', { class: 'music-card__title', text: cfg.title || '' })
        ])
      ]),
      el('div', { class: 'music-card__player' }, [slot]),
      cfg.credit ? el('p', { class: 'music-card__credit', text: cfg.credit }) : null
    ]);
    document.body.append(card);
    document.body.classList.add('has-music-card');
    return slot;
  }

  function removeCard() {
    if (card) card.remove();
    card = null;
    document.body.classList.remove('has-music-card');
  }

  function whenReady() {
    if (ready) return ready;
    ready = new Promise((resolve) => {
      if (!cfg.youtube) { resolve(false); return; }
      let done = false;
      const finish = (ok) => {
        if (done) return;
        done = true;
        clearTimeout(timer);
        available = ok;
        if (!ok) removeCard();
        resolve(ok);
      };
      const timer = setTimeout(() => finish(false), 20000);
      const slot = buildCard();
      loadApi().then((YT) => {
        player = new YT.Player(slot, {
          host: 'https://www.youtube-nocookie.com',
          videoId: cfg.youtube,
          width: 200,
          height: 200,
          playerVars: { playsinline: 1, rel: 0, controls: 1, start: START },
          events: {
            onReady: () => { player.setVolume(VOLUME); finish(true); },
            onError: () => {
              playing = false;
              if (done) { available = false; removeCard(); hideSoundButton(); }
              finish(false);
            },
            onStateChange: (e) => {
              // Hết bài → phát lại từ đầu (nếu vẫn đang bật nhạc).
              if (e.data === YT.PlayerState.ENDED && playing) {
                player.seekTo(START, true);
                player.playVideo();
              }
              if (card) card.classList.toggle('is-playing', e.data === YT.PlayerState.PLAYING);
            }
          }
        });
      }).catch(() => finish(false));
    });
    return ready;
  }

  function hideSoundButton() {
    const btn = document.getElementById('btn-sound');
    if (btn) btn.hidden = true;
  }

  function fadeTo(target, then) {
    clearInterval(fadeTimer);
    const from = volume;
    const t0 = Date.now();
    fadeTimer = setInterval(() => {
      const k = Math.min(1, (Date.now() - t0) / FADE_MS);
      volume = Math.round(from + (target - from) * k);
      player.setVolume(volume);
      if (k >= 1) {
        clearInterval(fadeTimer);
        fadeTimer = null;
        if (then) then();
      }
    }, 50);
  }

  function start() {
    const state = player.getPlayerState();
    // Đang phát sẵn (vd người xem tự bấm phát trong khung YouTube) thì chỉ cần đưa âm lượng về mức chuẩn.
    if (state !== window.YT.PlayerState.PLAYING) {
      volume = 0;
      player.setVolume(0);
      player.playVideo();
    }
    fadeTo(VOLUME);
  }

  function stop() {
    fadeTo(0, () => player.pauseVideo());
  }

  function sync() {
    if (!available) return;
    const should = !NNBT.store.get().audio.muted && interacted && !document.hidden;
    if (should === playing) return;
    playing = should;
    if (should) start();
    else stop();
  }

  function onInteract() {
    interacted = true;
    sync();
  }

  function toggle() {
    NNBT.store.update((s) => { s.audio.muted = !s.audio.muted; });
  }

  function init() {
    whenReady().then((ok) => {
      if (!ok) return;
      // Bắt cú chạm đầu tiên ở pha capture để nhạc phát ngay trong chính cú bấm đó.
      document.addEventListener('pointerdown', onInteract, true);
      document.addEventListener('keydown', onInteract, true);
      document.addEventListener('visibilitychange', sync);
      NNBT.store.subscribe(sync);
      // Cú bấm có thể đã xảy ra trong lúc YouTube đang tải.
      if (navigator.userActivation && navigator.userActivation.hasBeenActive) onInteract();
    });
  }

  NNBT.music = {
    init,
    whenReady,
    toggle,
    configured: !!cfg.youtube,
    title: cfg.title || '',
    isPlaying: () => !!player && !!window.YT && player.getPlayerState && player.getPlayerState() === window.YT.PlayerState.PLAYING,
    position: () => (player && player.getCurrentTime ? player.getCurrentTime() : 0)
  };
})(window.NNBT);

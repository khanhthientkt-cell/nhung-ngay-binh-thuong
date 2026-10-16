/*
 * music.js — Nhạc nền bằng video YouTube nhúng (cấu hình trong js/content/music-config.js).
 *
 * - Khung nhạc nhỏ cố định ở góc phải dưới, chứa trình phát YouTube 200×200 (YouTube không cho ẩn trình phát).
 * - Nhạc TỰ CHẠY từ cú chạm / phím bấm đầu tiên (vd nút "Bắt đầu") — trình duyệt không cho phát tiếng
 *   trước khi người xem tương tác — rồi chạy liền một mạch qua mọi màn hình, không bắt đầu lại khi đổi trang.
 * - Chỉ dừng khi người chơi tắt tiếng (audio.muted trong store) bằng nút trên thanh trên cùng.
 * - Danh sách bài (cfg.tracks): hết bài này tự sang bài sau, hết bài cuối quay lại bài đầu; mỗi bài có thể bỏ qua
 *   đoạn mở đầu (start, giây). To dần / nhỏ dần khi bật tắt; tạm dừng khi chuyển sang tab trình duyệt khác.
 * - Một bài lỗi (bị gỡ, tắt nhúng) thì bỏ qua sang bài kế; tất cả đều lỗi thì khung nhạc tự ẩn.
 * - Không tải được YouTube (mất mạng, video bị gỡ hoặc tắt nhúng) → khung nhạc và nút âm thanh tự ẩn.
 */
(function (NNBT) {
  'use strict';

  const cfg = NNBT.musicConfig || {};
  const FADE_MS = 1600;
  const VOLUME = Math.round(100 * (typeof cfg.volume === 'number' ? Math.min(1, Math.max(0, cfg.volume)) : 0.5));
  // Danh sách bài; vẫn nhận cấu hình một bài kiểu cũ (youtube/start/title/credit).
  const TRACKS = (Array.isArray(cfg.tracks) && cfg.tracks.length ? cfg.tracks : (cfg.youtube ? [cfg] : []))
    .filter((t) => t && t.youtube)
    .map((t) => ({
      id: t.youtube,
      start: typeof t.start === 'number' && t.start > 0 ? Math.floor(t.start) : 0, // bỏ qua đoạn mở đầu (giây)
      title: t.title || '',
      credit: t.credit || ''
    }));

  let player = null;
  let card = null;
  let available = false;
  let ready = null;
  let interacted = false; // đã có cú chạm / phím bấm trong lần mở trang này
  let playing = false;    // ý định hiện tại: đang phát hay đã dừng
  let volume = VOLUME;
  let fadeTimer = null;
  let current = 0;        // bài đang phát trong TRACKS
  let failures = 0;       // số bài lỗi liên tiếp (để không lặp vô hạn khi mọi bài đều lỗi)
  let titleEl = null;
  let creditEl = null;

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
          titleEl = el('span', { class: 'music-card__title', text: TRACKS[0].title })
        ])
      ]),
      el('div', { class: 'music-card__player' }, [slot]),
      creditEl = el('p', { class: 'music-card__credit', text: TRACKS[0].credit })
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
      if (!TRACKS.length) { resolve(false); return; }
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
          videoId: TRACKS[0].id,
          width: 200,
          height: 200,
          playerVars: { playsinline: 1, rel: 0, controls: 1, start: TRACKS[0].start },
          events: {
            onReady: () => { player.setVolume(VOLUME); finish(true); },
            onError: () => {
              // Bài này không phát được → thử bài kế; mọi bài đều lỗi thì ẩn khung nhạc.
              failures += 1;
              if (done && failures < TRACKS.length) { nextTrack(); return; }
              playing = false;
              if (done) { available = false; removeCard(); hideSoundButton(); }
              finish(false);
            },
            onStateChange: (e) => {
              if (e.data === YT.PlayerState.PLAYING) failures = 0;
              // Hết bài → sang bài kế (hoặc phát lại nếu chỉ có một bài), khi vẫn đang bật nhạc.
              if (e.data === YT.PlayerState.ENDED && playing) nextTrack();
              if (card) card.classList.toggle('is-playing', e.data === YT.PlayerState.PLAYING);
            }
          }
        });
      }).catch(() => finish(false));
    });
    return ready;
  }

  function nextTrack() {
    current = (current + 1) % TRACKS.length;
    const t = TRACKS[current];
    if (titleEl) titleEl.textContent = t.title;
    if (creditEl) creditEl.textContent = t.credit;
    if (TRACKS.length === 1) {
      player.seekTo(t.start, true);
      player.playVideo();
    } else {
      player.loadVideoById({ videoId: t.id, startSeconds: t.start });
    }
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
    configured: TRACKS.length > 0,
    title: TRACKS.map((t) => t.title).filter(Boolean).join(' · '),
    isPlaying: () => !!player && !!window.YT && player.getPlayerState && player.getPlayerState() === window.YT.PlayerState.PLAYING,
    position: () => (player && player.getCurrentTime ? player.getCurrentTime() : 0)
  };
})(window.NNBT);

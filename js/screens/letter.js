/*
 * letter.js — Mở đầu: Lá thư chưa gửi.
 *
 * Luồng: lá thư gấp trong phong bì trên bàn gỗ → "Mở lá thư" → mỗi lần bấm "Tiếp tục" hiện thêm một nhịp chữ
 *        → hết thư thì hiện "Đi thôi, anh!" → bản đồ hành trình.
 *
 * - Hoạt ảnh mở phong bì chỉ là CSS (đổi data-state). Nút "Tiếp tục" dùng được ngay, không phải chờ hoạt ảnh.
 * - Không dùng hẹn giờ nên chạy nền hay giảm chuyển động đều không làm kẹt luồng đọc.
 * - Đọc lần đầu: nhớ số đoạn đã hiện để "Tiếp tục câu chuyện" quay lại đúng chỗ;
 *   bấm "Đi thôi, anh!" mới đánh dấu đã đi qua phần Mở đầu.
 * - Xem lại: không ghi gì vào tiến trình.
 */
(function (NNBT) {
  'use strict';

  const PRESS_GUARD_MS = 350; // chạm đúp vào "Tiếp tục" không làm nhảy hai đoạn

  // Bàn gỗ cạnh cửa sổ, nắng sáng, phong bì. Các lớp .env-* được CSS điều khiển khi mở thư.
  function deskArt(titleId, alt) {
    return (
      '<svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMax slice" role="img" aria-labelledby="' + titleId + '">' +
        '<title id="' + titleId + '">' + alt + '</title>' +
        '<defs>' +
          '<linearGradient id="desk-wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fbe6ec"/><stop offset="1" stop-color="#f3d3dd"/></linearGradient>' +
          '<linearGradient id="desk-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fde2ea"/><stop offset="1" stop-color="#e4e3f4"/></linearGradient>' +
          '<linearGradient id="desk-beam" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff3f6" stop-opacity="0.9"/><stop offset="1" stop-color="#fff3f6" stop-opacity="0"/></linearGradient>' +
          '<linearGradient id="desk-wood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e2b3a6"/><stop offset="1" stop-color="#c99086"/></linearGradient>' +
          '<radialGradient id="desk-glow"><stop offset="0" stop-color="#ffeef3" stop-opacity="0.5"/><stop offset="1" stop-color="#ffeef3" stop-opacity="0"/></radialGradient>' +
        '</defs>' +

        // Tường
        '<rect width="400" height="300" fill="url(#desk-wall)"/>' +
        '<g filter="url(#wc-wash)" opacity="0.35">' +
          '<circle cx="330" cy="70" r="70" fill="#f6cdd8"/>' +
        '</g>' +

        // Cửa sổ: bầu trời sớm, tán lá phía ngoài, khung gỗ sơn kem
        '<g>' +
          '<rect x="58" y="22" width="150" height="138" rx="3" fill="url(#desk-sky)"/>' +
          '<g filter="url(#wc-wash)" opacity="0.6">' +
            '<circle cx="84" cy="58" r="30" fill="#b9d3a8"/>' +
            '<circle cx="186" cy="44" r="24" fill="#c9ddb4"/>' +
            '<circle cx="176" cy="132" r="20" fill="#d3e5c0"/>' +
          '</g>' +
          '<circle cx="150" cy="70" r="14" fill="#fff0f4" opacity="0.9" filter="url(#wc-wash)"/>' +
          '<rect x="58" y="22" width="150" height="138" rx="3" fill="none" stroke="#fff7f9" stroke-width="7"/>' +
          '<path d="M133 22 V160 M58 91 H208" stroke="#fff7f9" stroke-width="5"/>' +
          '<rect x="50" y="158" width="166" height="8" rx="2" fill="#fcecf1"/>' +
        '</g>' +

        // Vệt nắng từ cửa sổ xuống mặt bàn
        '<polygon class="desk-beam" points="64,30 206,30 336,236 112,244" fill="url(#desk-beam)" opacity="0.55"/>' +

        // Bàn gỗ
        '<rect x="0" y="200" width="400" height="100" fill="url(#desk-wood)"/>' +
        '<path d="M0 201 H400" stroke="#ecc3b8" stroke-width="3"/>' +
        '<g stroke="#9a6b78" stroke-opacity="0.22" fill="none" stroke-width="1.2" filter="url(#wc-line)">' +
          '<path d="M8 228 C 90 222, 160 236, 250 226 S 360 232, 396 226"/>' +
          '<path d="M0 260 C 70 254, 150 268, 230 258 S 340 264, 400 256"/>' +
          '<path d="M24 286 C 120 280, 200 292, 300 284"/>' +
        '</g>' +
        '<ellipse cx="226" cy="238" rx="130" ry="24" fill="url(#desk-glow)"/>' +

        // Phong bì (nghiêng nhẹ)
        '<g class="envelope" transform="rotate(-4 200 236)">' +
          '<ellipse cx="203" cy="268" rx="78" ry="6" fill="#7a4f63" opacity="0.22"/>' +
          '<rect x="128" y="206" width="144" height="60" rx="3" fill="#f6dfe6"/>' +
          '<path class="env-flap-open" d="M128 206 L200 166 L272 206 Z" fill="#f2d6df" stroke="#e6bcc8"/>' +
          '<g class="env-sheet">' +
            '<rect x="140" y="210" width="120" height="52" rx="2" fill="#fffafc" stroke="#f1d5de"/>' +
            '<path d="M152 222 H246 M152 231 H236 M152 240 H242" stroke="#e0b7c3" stroke-width="1.4" stroke-linecap="round"/>' +
          '</g>' +
          '<path d="M128 206 L200 244 L272 206 V266 H128 Z" fill="#fbeaf0" stroke="#ebc9d3"/>' +
          '<g class="env-flap-closed">' +
            '<path d="M128 206 L200 246 L272 206 Z" fill="#f8e4ea" stroke="#e6bcc8"/>' +
            '<circle cx="200" cy="238" r="7" fill="#c4607f"/>' +
            '<circle cx="198" cy="236" r="2.2" fill="#e58fa3" opacity="0.8"/>' +
          '</g>' +
        '</g>' +
      '</svg>'
    );
  }

  NNBT.engine.register('letter', {
    resumable: true,
    title: () => {
      const c = NNBT.story.getChapter('prologue');
      return c.label + ' — ' + c.title;
    },

    render(node, ctx) {
      const { el, button } = ctx.ui;
      const story = ctx.story;
      const t = story.ui;
      const chapter = story.getChapter('prologue');
      const steps = story.letter.steps;
      const state = ctx.store.get();
      const replaying = state.replay.active;

      // Đọc dở lần trước (chỉ khi đọc bình thường) → mở sẵn thư và hiện lại các đoạn đã đọc.
      let shown = !replaying && state.chapter === 'prologue'
        ? Math.min(Math.max(state.scene, 0), steps.length)
        : 0;
      if (!replaying && state.chapter !== 'prologue') {
        ctx.store.update((s) => { s.chapter = 'prologue'; s.scene = 0; });
      }

      let lastPress = 0;

      // ---------- Dựng khung ----------

      const figure = el('figure', { class: 'desk', html: deskArt('desk-art-title', t.letter.sceneAlt) });

      const body = el('div', { class: 'letter-paper__body', 'aria-live': 'polite' });
      const paper = el('div', { class: 'letter-paper' }, body);

      const openBtn = button({ label: story.letter.openLabel, variant: 'primary', onClick: openLetter });
      const continueBtn = button({ label: t.letter.continue, variant: 'primary', onClick: onContinue });
      const finishBtn = button({ label: story.letter.finishLabel, variant: 'primary', onClick: finish });
      const showAllBtn = replaying
        ? button({ label: t.letter.showAll.text, variant: 'quiet', onClick: () => reveal(steps.length) })
        : null;
      const backBtn = button({ label: t.nav.back, variant: 'secondary', onClick: () => ctx.back() });

      const actions = el('div', { class: 'actions letter-actions' }, [openBtn, continueBtn, finishBtn, backBtn, showAllBtn]);

      const root = el('article', { class: 'letter-screen', 'data-state': shown > 0 ? 'open' : 'closed' }, [
        figure,
        el('div', { class: 'letter-panel' }, [
          el('header', { class: 'letter-panel__head' }, [
            replaying ? el('p', { class: 'badge', text: t.chapter.replayBadge }) : null,
            el('p', { class: 'eyebrow', text: chapter.label }),
            el('h1', { class: 'page__title', text: chapter.title })
          ]),
          paper,
          actions
        ])
      ]);

      node.append(root);
      appendSteps(0, shown, false);
      syncActions();

      // ---------- Hành vi ----------

      function appendSteps(from, to, animate) {
        let first = null;
        for (let i = from; i < to; i++) {
          steps[i].forEach((text, j) => {
            const p = el('p', {
              class: [
                'letter-paper__p',
                i === 0 && j === 0 && text === story.letter.salutation ? 'letter-paper__salutation' : '',
                animate ? 'is-new' : ''
              ].filter(Boolean).join(' ')
            }, text);
            body.append(p);
            if (!first) first = p;
          });
        }
        return first;
      }

      function setDeskAlt() {
        const title = figure.querySelector('title');
        if (title) title.textContent = root.dataset.state === 'open' ? t.letter.sceneAltOpen : t.letter.sceneAlt;
      }

      function syncActions() {
        const isOpen = root.dataset.state === 'open';
        const done = shown >= steps.length;
        openBtn.hidden = isOpen;
        continueBtn.hidden = !isOpen || done;
        finishBtn.hidden = !isOpen || !done;
        if (showAllBtn) showAllBtn.hidden = !isOpen || done;
        setDeskAlt();
      }

      function persist() {
        if (replaying) return;
        ctx.store.update((s) => {
          s.chapter = 'prologue';
          s.scene = shown;
        });
      }

      function reveal(target) {
        const to = Math.min(target, steps.length);
        if (to <= shown) return;
        const firstNew = appendSteps(shown, to, !ctx.reducedMotion());
        shown = to;
        persist();
        syncActions();

        const next = shown >= steps.length ? finishBtn : continueBtn;
        next.focus({ preventScroll: true });
        // Giữ đoạn mới và nút kế tiếp trong tầm nhìn (quan trọng trên điện thoại).
        const behavior = ctx.reducedMotion() ? 'auto' : 'smooth';
        if (firstNew) firstNew.scrollIntoView({ block: 'nearest', behavior });
        actions.scrollIntoView({ block: 'nearest', behavior });
      }

      function openLetter() {
        if (root.dataset.state !== 'closed') return;
        root.dataset.state = 'open';
        reveal(1);
      }

      function onContinue() {
        const now = Date.now();
        if (now - lastPress < PRESS_GUARD_MS) return;
        lastPress = now;
        reveal(shown + 1);
      }

      function finish() {
        if (!replaying) {
          // Người chơi chủ động bấm "Đi thôi, anh!" sau khi đọc hết thư → phần Mở đầu đã đi qua.
          // Không mở khóa chương nào khác.
          ctx.store.completeChapter('prologue');
        }
        ctx.go('map');
      }
    }
  });
})(window.NNBT);

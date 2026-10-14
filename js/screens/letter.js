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
          '<linearGradient id="desk-wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4e6cd"/><stop offset="1" stop-color="#e9d2ae"/></linearGradient>' +
          '<linearGradient id="desk-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fbe7b5"/><stop offset="1" stop-color="#d6e4e0"/></linearGradient>' +
          '<linearGradient id="desk-beam" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff4d2" stop-opacity="0.9"/><stop offset="1" stop-color="#fff4d2" stop-opacity="0"/></linearGradient>' +
          '<linearGradient id="desk-wood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c48f5f"/><stop offset="1" stop-color="#966641"/></linearGradient>' +
          '<radialGradient id="desk-glow"><stop offset="0" stop-color="#fff0c8" stop-opacity="0.5"/><stop offset="1" stop-color="#fff0c8" stop-opacity="0"/></radialGradient>' +
        '</defs>' +

        // Tường
        '<rect width="400" height="300" fill="url(#desk-wall)"/>' +
        '<g filter="url(#wc-wash)" opacity="0.35">' +
          '<circle cx="330" cy="70" r="70" fill="#f1d3a4"/>' +
        '</g>' +

        // Cửa sổ: bầu trời sớm, tán lá phía ngoài, khung gỗ sơn kem
        '<g>' +
          '<rect x="58" y="22" width="150" height="138" rx="3" fill="url(#desk-sky)"/>' +
          '<g filter="url(#wc-wash)" opacity="0.6">' +
            '<circle cx="84" cy="58" r="30" fill="#a8c29a"/>' +
            '<circle cx="186" cy="44" r="24" fill="#b9d0a6"/>' +
            '<circle cx="176" cy="132" r="20" fill="#c3d6b0"/>' +
          '</g>' +
          '<circle cx="150" cy="70" r="14" fill="#fff1c4" opacity="0.9" filter="url(#wc-wash)"/>' +
          '<rect x="58" y="22" width="150" height="138" rx="3" fill="none" stroke="#fbf3e4" stroke-width="7"/>' +
          '<path d="M133 22 V160 M58 91 H208" stroke="#fbf3e4" stroke-width="5"/>' +
          '<rect x="50" y="158" width="166" height="8" rx="2" fill="#f6ead6"/>' +
        '</g>' +

        // Vệt nắng từ cửa sổ xuống mặt bàn
        '<polygon class="desk-beam" points="64,30 206,30 336,236 112,244" fill="url(#desk-beam)" opacity="0.55"/>' +

        // Bàn gỗ
        '<rect x="0" y="200" width="400" height="100" fill="url(#desk-wood)"/>' +
        '<path d="M0 201 H400" stroke="#ddb07f" stroke-width="3"/>' +
        '<g stroke="#6f4729" stroke-opacity="0.22" fill="none" stroke-width="1.2" filter="url(#wc-line)">' +
          '<path d="M8 228 C 90 222, 160 236, 250 226 S 360 232, 396 226"/>' +
          '<path d="M0 260 C 70 254, 150 268, 230 258 S 340 264, 400 256"/>' +
          '<path d="M24 286 C 120 280, 200 292, 300 284"/>' +
        '</g>' +
        '<ellipse cx="226" cy="238" rx="130" ry="24" fill="url(#desk-glow)"/>' +

        // Phong bì (nghiêng nhẹ)
        '<g class="envelope" transform="rotate(-4 200 236)">' +
          '<ellipse cx="203" cy="268" rx="78" ry="6" fill="#5a3a22" opacity="0.22"/>' +
          '<rect x="128" y="206" width="144" height="60" rx="3" fill="#ead9bc"/>' +
          '<path class="env-flap-open" d="M128 206 L200 166 L272 206 Z" fill="#e6d3b2" stroke="#d3bb94"/>' +
          '<g class="env-sheet">' +
            '<rect x="140" y="210" width="120" height="52" rx="2" fill="#fffaf0" stroke="#e3d3b6"/>' +
            '<path d="M152 222 H246 M152 231 H236 M152 240 H242" stroke="#c7b28d" stroke-width="1.4" stroke-linecap="round"/>' +
          '</g>' +
          '<path d="M128 206 L200 244 L272 206 V266 H128 Z" fill="#f4e7cf" stroke="#d9c39e"/>' +
          '<g class="env-flap-closed">' +
            '<path d="M128 206 L200 246 L272 206 Z" fill="#efe0c3" stroke="#d3bb94"/>' +
            '<circle cx="200" cy="238" r="7" fill="#b0532e"/>' +
            '<circle cx="198" cy="236" r="2.2" fill="#d98a63" opacity="0.8"/>' +
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

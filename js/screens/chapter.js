/*
 * chapter.js — Màn hình một chương, dùng chung cho Chương 1–5.
 *
 * - Chương có nội dung trong story.chapterContent → kể theo từng nhịp (tranh + chữ).
 *   Người chơi chủ động bấm "Tiếp tục" (hoặc chạm vào vật được gợi ý trong tranh) để sang nhịp sau.
 * - Chương chưa có nội dung → khung tạm như Bước 1.
 *
 * Tiến trình:
 *   - Đọc lần đầu: nhớ nhịp đang đọc (s.scene) và các nhịp đã xem (progress.seen).
 *   - Bấm "Về bản đồ" ở nhịp cuối: đánh dấu chương đã đi qua. KHÔNG mở khóa chương sau.
 *   - Xem lại: không ghi gì vào tiến trình.
 * Không có bước nào phải chờ hoạt ảnh; tranh đổi bằng CSS nên giảm chuyển động hay chạy nền đều không làm kẹt.
 */
(function (NNBT) {
  'use strict';

  const PRESS_GUARD_MS = 350; // chạm đúp không làm nhảy hai nhịp

  NNBT.engine.register('chapter', {
    resumable: true,
    title(params) {
      const c = NNBT.story.getChapter(params.chapter);
      return c ? c.label + ' — ' + c.title : '';
    },

    render(node, ctx) {
      const { el, button } = ctx.ui;
      const t = ctx.story.ui;
      const chapter = ctx.story.getChapter(ctx.params.chapter);

      if (!chapter || !ctx.store.isUnlocked(chapter.id)) {
        node.append(
          el('article', { class: 'page page--reading' }, [
            el('h1', { class: 'page__title', text: t.chapter.notUnlocked }),
            el('div', { class: 'actions' }, [
              button({ label: t.nav.back, variant: 'secondary', onClick: () => ctx.back() })
            ])
          ])
        );
        return;
      }

      const content = ctx.story.chapterContent[chapter.id];
      if (!content || !content.beats || !content.beats.length) {
        renderPlaceholder(node, ctx, chapter);
        return;
      }
      renderBeats(node, ctx, chapter, content);
    }
  });

  // ---------- Kể chuyện theo nhịp ----------

  function renderBeats(node, ctx, chapter, content) {
    const { el, button } = ctx.ui;
    const t = ctx.story.ui;
    const beats = content.beats;
    const last = beats.length - 1;
    const state = ctx.store.get();
    const replaying = state.replay.active;

    let index = 0;
    if (!replaying) {
      if (state.chapter === chapter.id) {
        index = Math.min(Math.max(state.scene, 0), last);
      } else {
        ctx.store.update((s) => { s.chapter = chapter.id; s.scene = 0; });
      }
    }
    let lastPress = 0;

    // Tranh
    const art = NNBT.art && NNBT.art[content.art];
    const figure = el('figure', { class: 'scene-figure', html: art ? art.svg('scene-art-title-' + chapter.id) : '' });
    const hotspotIcon = el('span', { class: 'hotspot__icon', 'aria-hidden': 'true' });
    const hotspot = el('button', { type: 'button', class: 'hotspot', onClick: () => advance() }, [
      el('span', { class: 'hotspot__ring', 'aria-hidden': 'true' }),
      hotspotIcon,
      el('span', { class: 'sr-only hotspot__label' })
    ]);
    figure.append(hotspot);

    // Chữ & nút
    const textBox = el('div', { class: 'story-text', 'aria-live': 'polite' });
    const hint = el('p', { class: 'story-hint' });
    const nextBtn = button({ label: t.chapter.continue, variant: 'primary', onClick: () => advance() });
    const finishBtn = button({ label: t.chapter.toMap, variant: 'primary', onClick: finish });
    const prevBtn = button({ label: t.nav.back, variant: 'secondary', onClick: previous });
    const actions = el('div', { class: 'actions story-actions' }, [nextBtn, finishBtn, prevBtn]);

    const root = el('article', { class: 'chapter-screen', dataset: { chapter: chapter.id } }, [
      figure,
      el('div', { class: 'chapter-panel' }, [
        el('header', { class: 'chapter-panel__head' }, [
          replaying ? el('p', { class: 'badge', text: t.chapter.replayBadge }) : null,
          el('p', { class: 'eyebrow', text: chapter.label }),
          el('h1', { class: 'page__title', text: chapter.title })
        ]),
        textBox,
        hint,
        actions
      ])
    ]);
    node.append(root);
    show(index, false);

    function show(i, animate) {
      const beat = beats[i];

      // Tranh: bật các lớp thuộc nhịp này. Một lớp có thể thuộc nhiều nhịp ("road walk return").
      figure.querySelectorAll('[data-layer]').forEach((layer) => {
        layer.classList.toggle('is-active', layer.dataset.layer.split(' ').indexOf(beat.scene) !== -1);
      });
      const title = figure.querySelector('title');
      if (title) title.textContent = beat.alt || '';

      // Chữ
      textBox.textContent = '';
      beat.text.forEach((p) => {
        textBox.append(el('p', {
          class: 'story-text__p' + (animate ? ' is-new' : ''),
          'data-draft': beat.draft ? 'true' : null
        }, p));
      });

      // Phương án lời kể khác đang chờ duyệt: chỉ hiện ở chế độ duyệt (#debug), người chơi không thấy.
      if (beat.alternatives && document.body.classList.contains('is-debug')) {
        beat.alternatives.forEach((alt, k) => {
          textBox.append(el('div', { class: 'story-alt', 'data-draft': alt.draft ? 'true' : null }, [
            el('p', { class: 'story-alt__label', text: 'Phương án thay thế ' + (k + 1) + ' (chưa dùng)' })
          ].concat(alt.text.map((p) => el('p', { class: 'story-alt__p' }, p)))));
        });
      }

      // Gợi ý & vật có thể chạm
      hint.hidden = !beat.hint;
      hint.textContent = beat.hint ? beat.hint.text : '';
      if (beat.hint && beat.hint.draft) hint.dataset.draft = 'true';
      else delete hint.dataset.draft;

      if (beat.hotspot) {
        hotspot.hidden = false;
        hotspot.style.left = beat.hotspot.x + '%';
        hotspot.style.top = beat.hotspot.y + '%';
        hotspot.querySelector('.hotspot__label').textContent = beat.hotspot.label;
        // Có biểu tượng → nút tròn nhìn thấy rõ (vd chiếc ô); không có → chỉ vòng sáng quanh vật trong tranh.
        const iconName = beat.hotspot.icon;
        hotspot.classList.toggle('hotspot--token', !!iconName);
        hotspotIcon.innerHTML = iconName && NNBT.icons ? NNBT.icons.icon(iconName, 'hotspot__svg') : '';
      } else {
        hotspot.hidden = true;
      }

      // Nút
      nextBtn.hidden = i >= last;
      finishBtn.hidden = i < last;
      root.dataset.beat = beat.id;

      if (!replaying) {
        ctx.store.update((s) => {
          s.chapter = chapter.id;
          s.scene = i;
          const seen = s.progress.seen[chapter.id] || (s.progress.seen[chapter.id] = []);
          if (seen.indexOf(beat.id) === -1) seen.push(beat.id);
        });
      }
    }

    function guard() {
      const now = Date.now();
      if (now - lastPress < PRESS_GUARD_MS) return false;
      lastPress = now;
      return true;
    }

    // Đưa tranh mới vào tầm nhìn nếu người chơi đã cuộn xuống để bấm nút (điện thoại).
    function revealScene() {
      const topbar = document.querySelector('.topbar');
      const offset = (topbar ? topbar.getBoundingClientRect().height : 0) + 8;
      const top = root.getBoundingClientRect().top + window.scrollY - offset;
      if (window.scrollY > top) {
        window.scrollTo({ top: Math.max(top, 0), behavior: ctx.reducedMotion() ? 'auto' : 'smooth' });
      }
    }

    function advance() {
      if (!guard() || index >= last) return;
      index += 1;
      show(index, !ctx.reducedMotion());
      (index >= last ? finishBtn : nextBtn).focus({ preventScroll: true });
      revealScene();
    }

    function previous() {
      if (!guard()) return;
      if (index === 0) {
        ctx.back();
        return;
      }
      index -= 1;
      show(index, !ctx.reducedMotion());
      prevBtn.focus({ preventScroll: true });
      revealScene();
    }

    function finish() {
      if (!guard()) return;
      if (!replaying) {
        // Đọc hết chương và chủ động bấm "Về bản đồ" → chương đã đi qua. Không mở khóa chương sau.
        ctx.store.completeChapter(chapter.id);
      }
      ctx.go('map');
    }
  }

  // ---------- Khung tạm cho chương chưa có nội dung ----------

  function renderPlaceholder(node, ctx, chapter) {
    const { el, button } = ctx.ui;
    const t = ctx.story.ui;
    const replaying = ctx.store.get().replay.active;

    node.append(
      el('article', { class: 'page page--reading' }, [
        replaying ? el('p', { class: 'badge', text: t.chapter.replayBadge }) : null,
        el('p', { class: 'eyebrow', text: chapter.label }),
        el('h1', { class: 'page__title', text: chapter.title }),
        el('p', { class: 'placeholder-note', text: ctx.story.format(t.chapter.placeholder, { step: chapter.step }) }),
        el('div', { class: 'actions' }, [
          button({ label: t.nav.back, variant: 'secondary', onClick: () => ctx.back() })
        ])
      ])
    );
  }
})(window.NNBT);

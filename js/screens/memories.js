/*
 * memories.js — Danh sách "Xem lại kỷ niệm".
 * Chương đã mở có thể bấm để xem lại (chế độ xem lại không thay đổi điểm "Tiếp tục").
 * Chương chưa mở được ghi rõ bằng chữ, không chỉ dựa vào màu sắc.
 */
(function (NNBT) {
  'use strict';

  NNBT.engine.register('memories', {
    title: () => NNBT.story.ui.memories.heading,

    render(node, ctx) {
      const { el, button } = ctx.ui;
      const t = ctx.story.ui;

      const items = ctx.story.chapters.map((chapter) => {
        const unlocked = ctx.store.isUnlocked(chapter.id);
        const statusText = unlocked ? t.memories.unlocked : t.memories.locked;
        const statusId = 'memory-status-' + chapter.id;

        const content = [
          el('span', { class: 'memory__label', text: chapter.label }),
          el('span', { class: 'memory__title', text: chapter.title }),
          el('span', { class: 'memory__status', id: statusId, text: statusText })
        ];

        const inner = unlocked
          ? el('button', {
              type: 'button',
              class: 'memory__link',
              'aria-describedby': statusId,
              onClick() {
                ctx.store.update((s) => { s.replay = { active: true, chapter: chapter.id }; });
                const screen = ctx.story.screenFor(chapter.id);
                ctx.go(screen, screen === 'chapter' ? { chapter: chapter.id } : {});
              }
            }, content)
          : el('div', { class: 'memory__locked' }, content);

        return el('li', { class: 'memory' + (unlocked ? '' : ' is-locked') }, inner);
      });

      node.append(
        el('article', { class: 'page page--reading' }, [
          el('h1', { class: 'page__title', text: t.memories.heading }),
          el('p', { class: 'page__lede', text: t.memories.intro }),
          el('ol', { class: 'memory-list' }, items),
          el('div', { class: 'actions' }, [
            button({ label: t.nav.back, variant: 'secondary', onClick: () => ctx.back() }),
            // Bản đồ chỉ mở được sau khi đã đọc xong lá thư mở đầu.
            ctx.store.isCompleted('prologue')
              ? button({ label: t.memories.openMap, variant: 'secondary', onClick: () => ctx.go('map') })
              : null
          ])
        ])
      );
    }
  });
})(window.NNBT);

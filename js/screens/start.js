/*
 * start.js — Màn hình khởi động tối giản (Bước 1).
 * Dùng để kiểm tra nền giấy, font, trạng thái và điều hướng. Chưa có nội dung kỷ niệm.
 */
(function (NNBT) {
  'use strict';

  // Minh họa trừu tượng: hai mảng màu nước (ấm & xanh dịu) chạm nhau và một con đường vàng bình minh.
  // Không mô tả kỷ niệm cụ thể nào.
  const COVER_ART =
    '<svg viewBox="0 0 320 240" role="img" aria-labelledby="cover-art-title">' +
      '<title id="cover-art-title">Hai mảng màu nước ấm và xanh dịu chạm vào nhau, phía dưới là một con đường màu vàng bình minh.</title>' +
      '<g filter="url(#wc-wash)">' +
        '<circle cx="128" cy="108" r="74" fill="var(--wash-warm)" opacity="0.62"/>' +
        '<circle cx="198" cy="122" r="66" fill="var(--wash-mist)" opacity="0.55"/>' +
        '<circle cx="272" cy="56" r="17" fill="var(--wash-dawn)" opacity="0.7"/>' +
      '</g>' +
    '</svg>';

  NNBT.engine.register('start', {
    title: () => '',
    render(node, ctx) {
      const { el, button } = ctx.ui;
      const t = ctx.story.ui;
      const state = ctx.store.get();

      // Về trang đầu thì thoát chế độ xem lại.
      if (state.replay.active) {
        ctx.store.update((s) => { s.replay = { active: false, chapter: null }; });
      }

      const started = state.progress.started;

      // Bìa: ảnh thật của hai người (polaroid) đặt trên các mảng màu nước; không có ảnh thì dùng tranh.
      function coverArt() {
        const p = ctx.story.photos && ctx.story.photos.start;
        if (!p || !NNBT.photos) return el('figure', { class: 'cover__art', html: COVER_ART });
        const fig = el('div', { class: 'cover__art cover__art--photo', html: COVER_ART });
        const svg = fig.querySelector('svg');
        svg.setAttribute('aria-hidden', 'true');
        svg.removeAttribute('role');
        fig.append(NNBT.photos.polaroid(p, { rotate: -3, lazy: false, zoom: true }));
        return fig;
      }

      const primary = button({
        label: started ? t.start.resume : t.start.begin,
        variant: 'primary',
        onClick() {
          if (!started) {
            ctx.store.update((s) => {
              s.progress.started = true;
              s.chapter = 'prologue';
              s.scene = 0;
            });
            ctx.go('letter');
            return;
          }
          // Tiếp tục: quay về màn hình truyện gần nhất (lá thư, bản đồ hoặc một chương).
          const s = ctx.store.get();
          const chapter = s.chapter || 'prologue';
          const target = s.resumeScreen || ctx.story.screenFor(chapter);
          ctx.go(target, target === 'chapter' ? { chapter } : {});
        }
      });

      const memories = button({
        label: t.start.memories,
        variant: 'secondary',
        onClick: () => ctx.go('memories')
      });

      const restart = started
        ? button({
            label: t.start.restart,
            variant: 'quiet',
            async onClick() {
              const ok = await ctx.ui.confirm(t.restartDialog);
              if (!ok) return;
              ctx.store.reset();
              ctx.go('start', {}, { clearHistory: true });
            }
          })
        : null;

      node.append(
        el('article', { class: 'page page--cover' }, [
          coverArt(),
          el('div', { class: 'cover__text' }, [
            el('p', { class: 'eyebrow', text: t.dedication }),
            el('h1', { class: 'cover__title', text: ctx.story.title }),
            el('p', { class: 'cover__tagline', text: t.tagline.text, 'data-draft': t.tagline.draft ? 'true' : null }),
            el('div', { class: 'actions actions--stack' }, [primary, memories, restart])
          ])
        ])
      );
    }
  });
})(window.NNBT);

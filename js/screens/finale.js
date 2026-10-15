/*
 * finale.js — Chương 5: Chuyến đi tiếp theo của chúng mình.
 *
 * Các bước (lưu ở s.scene khi đọc lần đầu):
 *   0 dream    — Đoạn 1 của anh: giấc mơ cầu hôn dưới bầu trời cực quang (tranh hộp nhẫn trên đồi tuyết)
 *   1 compose  — vợ viết lời nhắn (không bắt buộc) cho tấm bưu thiếp
 *   2 postcard — bưu thiếp: lời chúc của anh + lời nhắn của em (Canvas → ảnh PNG), lưu ảnh, chia sẻ (nếu máy hỗ trợ)
 *   3 letter   — lời cuối: Đoạn 2 của anh (nguyên văn) + chữ ký
 *   4 end      — album ảnh + dòng kết thúc (nguyên văn đã chốt)
 * (Anh đã chọn bỏ trang giấy trống và bước chọn chuyến đi — 15/10/2026.)
 *
 * Dữ liệu:
 *   - Lời nhắn: CHỈ giữ trong bộ nhớ của phiên (biến `session` bên dưới), không ghi vào localStorage,
 *     không gửi đi đâu. Tải lại trang là mất — tấm ảnh đã lưu là bản giữ lại.
 *   - Chương 5 chỉ được đánh dấu "Đã đi qua" khi người chơi đi từ lời cuối sang màn kết.
 *   - Xem lại: không ghi gì vào tiến trình.
 */
(function (NNBT) {
  'use strict';

  const STEPS = ['dream', 'compose', 'postcard', 'letter', 'end'];
  const PRESS_GUARD_MS = 400;

  // Chỉ tồn tại trong phiên hiện tại.
  const session = { message: '' };
  let blobUrl = null;

  function revokeBlob() {
    if (blobUrl) {
      URL.revokeObjectURL(blobUrl);
      blobUrl = null;
    }
  }

  // Giấc mơ dưới bầu trời cực quang: trời đêm, dải cực quang, đồi tuyết, hộp nhẫn nhỏ đang mở (tĩnh vật — không vẽ người)
  const DREAM_ART =
    '<svg viewBox="0 0 400 260" role="img" aria-labelledby="finale-dream-title">' +
      '<title id="finale-dream-title"></title>' +
      '<defs>' +
        '<linearGradient id="fd-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#231d3d"/><stop offset="0.6" stop-color="#4a3a66"/><stop offset="1" stop-color="#8a6a8f"/></linearGradient>' +
        '<linearGradient id="fd-aur" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#6ee6b4" stop-opacity="0"/><stop offset="0.35" stop-color="#6ee6b4" stop-opacity="0.75"/><stop offset="0.75" stop-color="#ffa0cd" stop-opacity="0.55"/><stop offset="1" stop-color="#ffa0cd" stop-opacity="0"/></linearGradient>' +
        '<linearGradient id="fd-snow" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6dce8"/><stop offset="1" stop-color="#c9a9cf"/></linearGradient>' +
        '<radialGradient id="fd-glow"><stop offset="0" stop-color="#ffe3a8" stop-opacity="0.95"/><stop offset="1" stop-color="#ffe3a8" stop-opacity="0"/></radialGradient>' +
        '<filter id="fd-blur" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="7"/></filter>' +
      '</defs>' +
      '<rect width="400" height="260" rx="8" fill="url(#fd-sky)"/>' +
      '<g fill="#f3f6ff">' +
        [[30, 30], [70, 62], [118, 24], [160, 50], [212, 18], [250, 44], [300, 26], [352, 58], [380, 20], [96, 96], [330, 100], [190, 90]]
          .map(([x, y], i) => '<circle cx="' + x + '" cy="' + y + '" r="' + (i % 3 ? 1.1 : 1.7) + '" opacity="' + (0.5 + (i % 4) * 0.12) + '"/>').join('') +
      '</g>' +
      '<g filter="url(#fd-blur)" class="dream-aurora">' +
        '<path d="M-20 110 C 80 40, 170 130, 260 70 S 380 50, 420 80" stroke="url(#fd-aur)" stroke-width="34" fill="none"/>' +
        '<path d="M-20 140 C 90 90, 190 150, 290 100 S 380 90, 420 110" stroke="url(#fd-aur)" stroke-width="20" fill="none" opacity="0.7"/>' +
      '</g>' +
      '<path d="M0 182 C 90 160, 170 166, 240 172 S 350 160, 400 168 V260 H0 Z" fill="#5d4a78"/>' +
      '<path d="M0 200 C 110 180, 260 186, 400 196 V260 H0 Z" fill="url(#fd-snow)"/>' +
      '<path d="M0 200 C 110 180, 260 186, 400 196" fill="none" stroke="#ffffff" stroke-width="1.6" opacity="0.7"/>' +
      // hai hàng dấu chân dẫn tới hộp nhẫn
      '<g fill="#7a5682" opacity="0.45">' +
        [[60, 250, 1], [86, 242, 0.92], [110, 235, 0.85], [134, 229, 0.78], [158, 224, 0.72], [180, 220, 0.66]]
          .map(([x, y, s]) => '<ellipse cx="' + x + '" cy="' + y + '" rx="' + (6 * s) + '" ry="' + (2.6 * s) + '"/><ellipse cx="' + (x + 6) + '" cy="' + (y + 9 * s) + '" rx="' + (6 * s) + '" ry="' + (2.6 * s) + '"/>').join('') +
      '</g>' +
      // hộp nhẫn đang mở
      '<circle cx="214" cy="196" r="66" fill="url(#fd-glow)" class="dream-glow"/>' +
      '<g transform="translate(214 214) scale(1.7)">' +
        '<ellipse cx="0" cy="9" rx="20" ry="4" fill="#7a5682" opacity="0.35"/>' +
        '<path d="M-15 -14 L15 -14 L13 -24 L-13 -24 Z" fill="#b34a6b"/>' +
        '<rect x="-15" y="-4" width="30" height="13" rx="3" fill="#c95c7e"/>' +
        '<rect x="-12" y="-7" width="24" height="5" rx="2" fill="#f4e6cf"/>' +
        '<path d="M-15 -4 H15" stroke="#9c3d5c" stroke-width="1"/>' +
        '<circle cx="0" cy="-9" r="5" fill="none" stroke="#e8c46a" stroke-width="2.2"/>' +
        '<path d="M-2.6 -15.5 L0 -19 L2.6 -15.5 L0 -13.5 Z" fill="#eaf6ff" stroke="#bfe1f2" stroke-width="0.6"/>' +
        '<g stroke="#fff6d6" stroke-width="1.2" stroke-linecap="round" class="dream-sparkle"><path d="M8 -24 v-5 M5.5 -26.5 h5 M-10 -20 v-4 M-12 -22 h4"/></g>' +
      '</g>' +
    '</svg>';

  NNBT.engine.register('finale', {
    resumable: true,
    title: () => {
      const c = NNBT.story.getChapter('ch5');
      return c.label + ' — ' + c.title;
    },

    render(node, ctx) {
      const { el, button } = ctx.ui;
      const story = ctx.story;
      const F = story.finale;
      const chapter = story.getChapter('ch5');

      if (!ctx.store.isUnlocked('ch5')) {
        node.append(el('article', { class: 'page page--reading' }, [
          el('h1', { class: 'page__title', text: story.ui.chapter.notUnlocked }),
          el('div', { class: 'actions' }, [button({ label: story.ui.nav.back, variant: 'secondary', onClick: () => ctx.back() })])
        ]));
        return;
      }

      const state = ctx.store.get();
      const replaying = state.replay.active;

      let step = 0;
      if (!replaying) {
        if (state.chapter === 'ch5') step = Math.min(Math.max(state.scene, 0), STEPS.length - 1);
        else ctx.store.update((s) => { s.chapter = 'ch5'; s.scene = 0; });
      }

      let lastPress = 0;
      let disposed = false;
      const root = el('article', { class: 'finale' });
      node.append(root);

      // ---------- Điều hướng giữa các bước ----------

      function guard() {
        const now = Date.now();
        if (now - lastPress < PRESS_GUARD_MS) return false;
        lastPress = now;
        return true;
      }

      function show(i, focus) {
        step = i;
        if (!replaying) {
          ctx.store.update((s) => {
            s.chapter = 'ch5';
            s.scene = i;
            const seen = s.progress.seen.ch5 || (s.progress.seen.ch5 = []);
            if (seen.indexOf(STEPS[i]) === -1) seen.push(STEPS[i]);
          });
        }
        root.textContent = '';
        root.dataset.step = STEPS[i];
        RENDER[STEPS[i]]();
        window.scrollTo(0, 0);
        if (focus !== false) {
          const h = root.querySelector('h1, h2');
          if (h) {
            h.setAttribute('tabindex', '-1');
            h.focus({ preventScroll: true });
          }
        }
      }

      function header() {
        return el('header', { class: 'finale__head' }, [
          replaying ? el('p', { class: 'badge', text: story.ui.chapter.replayBadge }) : null,
          el('p', { class: 'eyebrow', text: chapter.label }),
          el('h1', { class: 'page__title', text: chapter.title })
        ]);
      }

      // ---------- Các bước ----------

      const RENDER = {
        dream() {
          const fig = el('figure', { class: 'finale__art finale__art--dream', html: DREAM_ART });
          fig.querySelector('title').textContent = F.dream.alt;
          root.append(el('div', { class: 'page finale__page' }, [
            header(),
            fig,
            el('div', { class: 'story-text' }, F.dream.text.map((p) => el('p', { class: 'story-text__p is-new' }, p))),
            el('div', { class: 'actions' }, [
              button({ label: story.ui.chapter.continue, variant: 'primary', onClick: () => guard() && show(1) }),
              button({ label: story.ui.nav.back, variant: 'secondary', onClick: () => ctx.back() })
            ])
          ]));
        },

        compose() {
          const C = F.compose;
          const msgId = 'finale-message';
          const counter = el('span', { class: 'finale__counter', 'aria-live': 'polite' });
          const msgInput = el('textarea', {
            id: msgId, class: 'finale__input finale__textarea', rows: 5, maxlength: C.messageMax,
            'aria-describedby': msgId + '-note'
          });
          msgInput.value = session.message;
          const updateCounter = () => { counter.textContent = msgInput.value.length + ' / ' + C.messageMax; };
          msgInput.addEventListener('input', updateCounter);
          updateCounter();

          const form = el('form', { class: 'finale__form', novalidate: true }, [
            el('p', { class: 'finale__lead', text: C.lead.text }),
            el('div', { class: 'finale__field' }, [
              el('label', { for: msgId, class: 'finale__label', text: C.messageLabel.text }),
              msgInput,
              el('div', { class: 'finale__meta' }, [
                el('p', { id: msgId + '-note', class: 'finale__hint', text: C.messageNote.text }),
                counter
              ])
            ]),
            el('div', { class: 'actions' }, [
              el('button', { type: 'submit', class: 'btn btn--primary' }, C.submit.text),
              button({ label: story.ui.nav.back, variant: 'secondary', onClick: () => guard() && show(0) })
            ])
          ]);

          form.addEventListener('submit', (e) => {
            e.preventDefault();
            if (!guard()) return;
            session.message = msgInput.value.trim().slice(0, C.messageMax);
            revokeBlob();
            show(2);
          });

          root.append(el('div', { class: 'page finale__page' }, [header(), form]));
        },

        postcard() {
          const P = F.postcard;
          const status = el('p', { class: 'finale__status', role: 'status', 'aria-live': 'polite' });
          const img = el('img', { class: 'postcard__img', width: NNBT.postcard.SIZE.w, height: NNBT.postcard.SIZE.h, alt: '' });
          const frame = el('figure', { class: 'postcard', 'aria-busy': 'true' }, [
            el('div', { class: 'postcard__placeholder', 'aria-hidden': 'true' }),
            img
          ]);

          const saveBtn = button({ label: P.save.text, variant: 'primary', onClick: save });
          const shareBtn = button({ label: P.share.text, variant: 'secondary', onClick: share });
          const retryBtn = button({ label: P.retry.text, variant: 'secondary', onClick: () => generate() });
          const rewriteBtn = button({ label: P.rewrite.text, variant: 'quiet', onClick: () => guard() && show(1) });
          const nextBtn = button({ label: P.next, variant: 'secondary', onClick: () => guard() && show(3) });
          saveBtn.disabled = true;
          shareBtn.hidden = true;
          retryBtn.hidden = true;

          root.append(el('div', { class: 'finale__postcard-layout' }, [
            frame,
            el('div', { class: 'finale__side' }, [
              header(),
              status,
              el('div', { class: 'actions actions--stack' }, [saveBtn, shareBtn, retryBtn, nextBtn, rewriteBtn])
            ])
          ]));

          let currentBlob = null;
          const filename = P.filename;
          const altText = [
            'Bưu thiếp: ' + P.heading + '.',
            P.wishHeading.text + ': ' + P.wish,
            session.message ? P.messageHeading.text + ': ' + session.message : '',
            'Tranh: ' + P.alt + '.'
          ].filter(Boolean).join(' ');

          generate();

          function setStatus(p) {
            status.textContent = p.text;
          }

          function generate() {
            setStatus(P.status.preparing);
            retryBtn.hidden = true;
            saveBtn.disabled = true;
            frame.setAttribute('aria-busy', 'true');
            const canvas = document.createElement('canvas');
            NNBT.postcard.render(canvas, {
              wish: P.wish,
              message: session.message,
              texts: {
                heading: P.heading,
                wishHeading: P.wishHeading.text,
                messageHeading: P.messageHeading.text,
                footer: P.footer,
                stampDate: P.stampDate
              }
            })
              .then(() => NNBT.postcard.toBlob(canvas))
              .then((blob) => {
                if (disposed) return;
                currentBlob = blob;
                revokeBlob();
                blobUrl = URL.createObjectURL(blob);
                img.src = blobUrl;
                img.alt = altText;
                frame.classList.add('is-ready');
                frame.setAttribute('aria-busy', 'false');
                saveBtn.disabled = false;
                shareBtn.hidden = !canShareFile(blob);
                setStatus(P.status.ready);
              })
              .catch((e) => {
                if (disposed) return;
                console.error('[finale] Không tạo được ảnh bưu thiếp:', e);
                frame.setAttribute('aria-busy', 'false');
                // Nếu canvas đã vẽ được nhưng không xuất được ảnh: vẫn hiện canvas để có thể chụp màn hình.
                if (canvas.width) {
                  canvas.className = 'postcard__img';
                  canvas.setAttribute('role', 'img');
                  canvas.setAttribute('aria-label', altText);
                  img.replaceWith(canvas);
                  frame.classList.add('is-ready');
                }
                setStatus(P.status.error);
                retryBtn.hidden = false;
              });
          }

          function canShareFile(blob) {
            try {
              if (!navigator.canShare || !window.File) return false;
              const file = new File([blob], filename, { type: 'image/png' });
              return navigator.canShare({ files: [file] });
            } catch (e) {
              return false;
            }
          }

          function save() {
            if (!blobUrl || !guard()) return;
            try {
              const a = document.createElement('a');
              a.href = blobUrl;
              a.download = filename;
              a.rel = 'noopener';
              document.body.append(a);
              a.click();
              a.remove();
              setStatus(P.status.saved);
            } catch (e) {
              console.error('[finale] Không tải được ảnh:', e);
              setStatus(P.status.saved);
            }
          }

          function share() {
            if (!currentBlob || !guard()) return;
            const file = new File([currentBlob], filename, { type: 'image/png' });
            navigator.share({ files: [file], title: P.heading })
              .then(() => setStatus(P.status.shared))
              .catch((e) => {
                if (e && e.name === 'AbortError') return; // người dùng tự đóng bảng chia sẻ
                console.error('[finale] Chia sẻ không thành công:', e);
                setStatus(P.status.saved);
              });
          }
        },

        letter() {
          const L = F.letter;
          root.append(el('div', { class: 'page finale__page' }, [
            header(),
            el('div', { class: 'finale__letter' }, L.paragraphs.map((p) => el('p', { class: 'finale__letter-p' }, p))
              .concat(L.signature ? [el('p', { class: 'finale__letter-p finale__letter-signature' }, L.signature)] : [])),
            el('div', { class: 'actions' }, [
              button({
                label: story.ui.chapter.continue,
                variant: 'primary',
                onClick() {
                  if (!guard()) return;
                  // Đi hết lời cuối → Chương 5 đã đi qua (chỉ khi đọc lần đầu).
                  if (!replaying) ctx.store.completeChapter('ch5');
                  show(4);
                }
              }),
              button({ label: story.ui.nav.back, variant: 'secondary', onClick: () => guard() && show(2) })
            ])
          ]));
        },

        end() {
          const A = F.endActions;
          const ph = story.photos || {};
          // Album: tải ngay (không chờ) để màn kết không bao giờ hiện khung ảnh trống.
          const album = ['together', 'flowers', 'helmets', 'aoDai', 'kiwi', 'river']
            .map((k) => ph[k])
            .filter(Boolean);
          const tilts = [-4, 3, -2, 4, -3, 2];
          root.append(el('div', { class: 'page finale__page finale__end' }, [
            replaying ? el('p', { class: 'badge', text: story.ui.chapter.replayBadge }) : null,
            NNBT.photos && album.length
              ? el('div', { class: 'finale__album' }, album.map((p, i) =>
                  NNBT.photos.polaroid(p, { rotate: tilts[i % tilts.length], zoom: true, lazy: false })))
              : el('figure', { class: 'finale__end-art', 'aria-hidden': 'true', html: NNBT.icons.icon('aurora', 'finale__end-svg') }),
            el('h1', { class: 'finale__ending', text: F.ending }),
            el('div', { class: 'actions finale__end-actions' }, [
              button({ label: A.postcard.text, variant: 'secondary', onClick: () => guard() && show(2) }),
              button({ label: A.memories, variant: 'secondary', onClick: () => ctx.go('memories') }),
              button({ label: A.home, variant: 'quiet', onClick: () => ctx.go('start', {}, { clearHistory: true }) })
            ])
          ]));
        }
      };

      show(step, false);
      return () => { disposed = true; };
    }
  });
})(window.NNBT);

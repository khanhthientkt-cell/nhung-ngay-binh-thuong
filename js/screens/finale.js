/*
 * finale.js — Chương 5: Chuyến đi tiếp theo của chúng mình.
 *
 * Các bước (lưu ở s.scene khi đọc lần đầu):
 *   0 blank    — bản đồ mở rộng thành một trang giấy còn trống
 *   1 dream    — Đoạn 1 của anh: giấc mơ cầu hôn dưới bầu trời cực quang (tranh hộp nhẫn trên đồi tuyết)
 *   2 choose   — chọn 1 trong 4 kiểu chuyến đi; ô địa điểm (khi tự chọn); ô lời nhắn (không bắt buộc)
 *   3 postcard — vẽ bưu thiếp (Canvas → ảnh PNG), xem trước, lưu ảnh, chia sẻ (nếu máy hỗ trợ)
 *   4 letter   — lời cuối: Đoạn 2 của anh (nguyên văn) + chữ ký
 *   5 end      — dòng kết thúc (nguyên văn đã chốt)
 *
 * Dữ liệu:
 *   - Kiểu chuyến đi: lưu ở choices.trip (khi đọc lần đầu).
 *   - Địa điểm tự nhập và lời nhắn: CHỈ giữ trong bộ nhớ của phiên (biến `session` bên dưới),
 *     không ghi vào localStorage, không gửi đi đâu. Tải lại trang là mất — tấm ảnh đã lưu là bản giữ lại.
 *   - Chương 5 chỉ được đánh dấu "Đã đi qua" khi người chơi đi từ lời cuối sang dòng kết thúc.
 *   - Xem lại: không ghi gì vào tiến trình hay lựa chọn.
 */
(function (NNBT) {
  'use strict';

  const STEPS = ['blank', 'dream', 'choose', 'postcard', 'letter', 'end'];
  const PRESS_GUARD_MS = 400;

  // Chỉ tồn tại trong phiên hiện tại.
  const session = { trip: null, place: '', message: '' };
  let blobUrl = null;

  function revokeBlob() {
    if (blobUrl) {
      URL.revokeObjectURL(blobUrl);
      blobUrl = null;
    }
  }

  // Câu blank: tranh SVG nhỏ
  const BLANK_ART =
    '<svg viewBox="0 0 400 260" role="img" aria-labelledby="finale-blank-title">' +
      '<title id="finale-blank-title"></title>' +
      '<defs><radialGradient id="fn-aurora" cx="0.9" cy="0.1" r="0.6">' +
        '<stop offset="0" stop-color="#9fe0c8" stop-opacity="0.75"/><stop offset="0.5" stop-color="#a9b8f0" stop-opacity="0.3"/>' +
        '<stop offset="1" stop-color="#a9b8f0" stop-opacity="0"/></radialGradient></defs>' +
      '<rect x="18" y="16" width="364" height="228" rx="6" fill="#fffaf0" stroke="#e2d2b6" stroke-width="2"/>' +
      '<rect x="18" y="16" width="364" height="228" rx="6" fill="url(#fn-aurora)"/>' +
      '<path d="M140 16 V244 M260 16 V244" stroke="#efe3cc" stroke-width="2"/>' +
      '<g filter="url(#wc-wash)" opacity="0.6"><circle cx="70" cy="190" r="40" fill="#e7a583"/><circle cx="118" cy="120" r="30" fill="#9dbfcf"/></g>' +
      '<path d="M44 214 C 70 170, 96 190, 112 150 S 150 110, 176 120" fill="none" stroke="#9c4f2d" stroke-width="2.6" stroke-dasharray="1 9" stroke-linecap="round"/>' +
      '<g fill="#9c4f2d"><circle cx="44" cy="214" r="5"/><circle cx="74" cy="182" r="5"/><circle cx="104" cy="168" r="5"/><circle cx="124" cy="136" r="5"/><circle cx="152" cy="118" r="5"/></g>' +
      '<circle cx="176" cy="120" r="6" fill="none" stroke="#9c4f2d" stroke-width="2"/>' +
      '<path d="M190 118 C 230 108, 270 96, 330 64" fill="none" stroke="#e9b85c" stroke-width="2.4" stroke-dasharray="1 10" stroke-linecap="round" opacity="0.7"/>' +
    '</svg>';

  // Giấc mơ dưới bầu trời cực quang: trời đêm, dải cực quang, đồi tuyết, hộp nhẫn nhỏ đang mở (tĩnh vật — không vẽ người)
  const DREAM_ART =
    '<svg viewBox="0 0 400 260" role="img" aria-labelledby="finale-dream-title">' +
      '<title id="finale-dream-title"></title>' +
      '<defs>' +
        '<linearGradient id="fd-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0e1f33"/><stop offset="1" stop-color="#2a4a63"/></linearGradient>' +
        '<linearGradient id="fd-aur" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#6ee6b4" stop-opacity="0"/><stop offset="0.35" stop-color="#6ee6b4" stop-opacity="0.75"/><stop offset="0.75" stop-color="#8caaf5" stop-opacity="0.6"/><stop offset="1" stop-color="#8caaf5" stop-opacity="0"/></linearGradient>' +
        '<linearGradient id="fd-snow" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9fbccd"/><stop offset="1" stop-color="#58768e"/></linearGradient>' +
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
      '<path d="M0 182 C 90 160, 170 166, 240 172 S 350 160, 400 168 V260 H0 Z" fill="#1f3a52"/>' +
      '<path d="M0 200 C 110 180, 260 186, 400 196 V260 H0 Z" fill="url(#fd-snow)"/>' +
      '<path d="M0 200 C 110 180, 260 186, 400 196" fill="none" stroke="#d6f2e8" stroke-width="1.6" opacity="0.6"/>' +
      // hai hàng dấu chân dẫn tới hộp nhẫn
      '<g fill="#2b4760" opacity="0.55">' +
        [[60, 250, 1], [86, 242, 0.92], [110, 235, 0.85], [134, 229, 0.78], [158, 224, 0.72], [180, 220, 0.66]]
          .map(([x, y, s]) => '<ellipse cx="' + x + '" cy="' + y + '" rx="' + (6 * s) + '" ry="' + (2.6 * s) + '"/><ellipse cx="' + (x + 6) + '" cy="' + (y + 9 * s) + '" rx="' + (6 * s) + '" ry="' + (2.6 * s) + '"/>').join('') +
      '</g>' +
      // hộp nhẫn đang mở
      '<circle cx="214" cy="196" r="66" fill="url(#fd-glow)" class="dream-glow"/>' +
      '<g transform="translate(214 214) scale(1.7)">' +
        '<ellipse cx="0" cy="9" rx="20" ry="4" fill="#173047" opacity="0.5"/>' +
        '<path d="M-15 -14 L15 -14 L13 -24 L-13 -24 Z" fill="#8c2f3a"/>' +
        '<rect x="-15" y="-4" width="30" height="13" rx="3" fill="#a63a46"/>' +
        '<rect x="-12" y="-7" width="24" height="5" rx="2" fill="#f4e6cf"/>' +
        '<path d="M-15 -4 H15" stroke="#6e2430" stroke-width="1"/>' +
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
      const tripIds = F.choose.options.map((o) => o.id);

      let step = 0;
      if (!replaying) {
        if (state.chapter === 'ch5') step = Math.min(Math.max(state.scene, 0), STEPS.length - 1);
        else ctx.store.update((s) => { s.chapter = 'ch5'; s.scene = 0; });
      }
      if (!session.trip && tripIds.indexOf(state.choices.trip) !== -1) session.trip = state.choices.trip;

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

      function validChoice() {
        if (tripIds.indexOf(session.trip) === -1) return false;
        return session.trip !== 'custom' || session.place.trim().length > 0;
      }

      function show(i, focus) {
        if (i === 3 && !validChoice()) i = 2;
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

      function header(extraTitle) {
        return el('header', { class: 'finale__head' }, [
          replaying ? el('p', { class: 'badge', text: story.ui.chapter.replayBadge }) : null,
          el('p', { class: 'eyebrow', text: chapter.label }),
          extraTitle
            ? el('h1', { class: 'page__title', text: extraTitle.text, 'data-draft': extraTitle.draft ? 'true' : null })
            : el('h1', { class: 'page__title', text: chapter.title })
        ]);
      }

      function drafted(p, cls) {
        return el('p', { class: cls || '', 'data-draft': p.draft ? 'true' : null }, p.text);
      }

      // ---------- Các bước ----------

      const RENDER = {
        blank() {
          const fig = el('figure', { class: 'finale__art', html: BLANK_ART });
          fig.querySelector('title').textContent = F.blank.alt;
          root.append(el('div', { class: 'page finale__page' }, [
            header(),
            fig,
            el('div', { class: 'story-text' }, F.blank.text.paragraphs.map((p) =>
              el('p', { class: 'story-text__p is-new', 'data-draft': F.blank.text.draft ? 'true' : null }, p))),
            el('div', { class: 'actions' }, [
              button({ label: story.ui.chapter.continue, variant: 'primary', onClick: () => guard() && show(1) }), // → giấc mơ
              button({ label: story.ui.nav.back, variant: 'secondary', onClick: () => ctx.back() })
            ])
          ]));
        },

        dream() {
          const fig = el('figure', { class: 'finale__art finale__art--dream', html: DREAM_ART });
          fig.querySelector('title').textContent = F.dream.alt;
          root.append(el('div', { class: 'page finale__page' }, [
            header(),
            fig,
            el('div', { class: 'story-text' }, F.dream.text.map((p) => el('p', { class: 'story-text__p is-new' }, p))),
            el('div', { class: 'actions' }, [
              button({ label: story.ui.chapter.continue, variant: 'primary', onClick: () => guard() && show(2) }),
              button({ label: story.ui.nav.back, variant: 'secondary', onClick: () => guard() && show(0) })
            ])
          ]));
        },

        choose() {
          const C = F.choose;
          const err = el('p', { class: 'finale__error', role: 'alert' });
          const placeId = 'finale-place';
          const msgId = 'finale-message';

          const placeInput = el('input', {
            id: placeId, type: 'text', class: 'finale__input', maxlength: C.placeMax, autocomplete: 'off',
            'aria-describedby': placeId + '-hint'
          });
          placeInput.value = session.place;
          const placeWrap = el('div', { class: 'finale__field' }, [
            el('label', { for: placeId, class: 'finale__label', text: C.placeLabel.text, 'data-draft': C.placeLabel.draft ? 'true' : null }),
            placeInput,
            el('p', { id: placeId + '-hint', class: 'finale__hint', text: C.placeHint.text, 'data-draft': C.placeHint.draft ? 'true' : null })
          ]);

          const counter = el('span', { class: 'finale__counter', 'aria-live': 'polite' });
          const msgInput = el('textarea', {
            id: msgId, class: 'finale__input finale__textarea', rows: 4, maxlength: C.messageMax,
            'aria-describedby': msgId + '-note'
          });
          msgInput.value = session.message;
          const updateCounter = () => { counter.textContent = msgInput.value.length + ' / ' + C.messageMax; };
          msgInput.addEventListener('input', updateCounter);
          updateCounter();

          const options = C.options.map((o) => {
            const id = 'trip-' + o.id;
            const input = el('input', { type: 'radio', name: 'trip', id, value: o.id, class: 'trip__radio' });
            input.checked = session.trip === o.id;
            input.addEventListener('change', syncPlace);
            return el('div', { class: 'trip' }, [
              input,
              el('label', { for: id, class: 'trip__label' }, [
                el('span', { class: 'trip__icon', html: NNBT.icons.icon(o.id === 'aurora' ? 'aurora' : o.id === 'slow' ? 'cups' : o.id === 'new' ? 'spark' : 'road', 'trip__svg') }),
                el('span', { class: 'trip__text', text: o.label, 'data-draft': o.labelDraft ? 'true' : null })
              ])
            ]);
          });

          function selected() {
            const r = root.querySelector('input[name="trip"]:checked');
            return r ? r.value : null;
          }
          function syncPlace() {
            placeWrap.hidden = selected() !== 'custom';
            err.textContent = '';
          }

          const form = el('form', { class: 'finale__form', novalidate: true }, [
            el('fieldset', { class: 'finale__fieldset' }, [
              el('legend', { class: 'finale__legend', text: C.prompt.text, 'data-draft': C.prompt.draft ? 'true' : null })
            ].concat(options)),
            placeWrap,
            el('div', { class: 'finale__field' }, [
              el('label', { for: msgId, class: 'finale__label', text: C.messageLabel.text, 'data-draft': C.messageLabel.draft ? 'true' : null }),
              msgInput,
              el('div', { class: 'finale__meta' }, [
                el('p', { id: msgId + '-note', class: 'finale__hint', text: C.messageNote.text, 'data-draft': C.messageNote.draft ? 'true' : null }),
                counter
              ])
            ]),
            err,
            el('div', { class: 'actions' }, [
              el('button', { type: 'submit', class: 'btn btn--primary', 'data-draft': C.submit.draft ? 'true' : null }, C.submit.text),
              button({ label: story.ui.nav.back, variant: 'secondary', onClick: () => guard() && show(1) })
            ])
          ]);

          form.addEventListener('submit', (e) => {
            e.preventDefault();
            const trip = selected();
            if (!trip) {
              err.textContent = C.chooseRequired.text;
              const first = root.querySelector('input[name="trip"]');
              if (first) first.focus();
              return;
            }
            const place = placeInput.value.replace(/\s+/g, ' ').trim().slice(0, C.placeMax);
            if (trip === 'custom' && !place) {
              err.textContent = C.placeRequired.text;
              placeInput.focus();
              return;
            }
            if (!guard()) return;
            session.trip = trip;
            session.place = trip === 'custom' ? place : '';
            session.message = msgInput.value.trim().slice(0, C.messageMax);
            if (!replaying) ctx.store.update((s) => { s.choices.trip = trip; });
            revokeBlob();
            show(3);
          });

          root.append(el('div', { class: 'page finale__page' }, [header(), form]));
          syncPlace();
        },

        postcard() {
          const P = F.postcard;
          const option = F.choose.options.find((o) => o.id === session.trip);
          const status = el('p', { class: 'finale__status', role: 'status', 'aria-live': 'polite' });
          const img = el('img', { class: 'postcard__img', width: NNBT.postcard.SIZE.w, height: NNBT.postcard.SIZE.h, alt: '' });
          const frame = el('figure', { class: 'postcard', 'aria-busy': 'true' }, [
            el('div', { class: 'postcard__placeholder', 'aria-hidden': 'true' }),
            img
          ]);

          const saveBtn = button({ label: P.save.text, variant: 'primary', onClick: save });
          const shareBtn = button({ label: P.share.text, variant: 'secondary', onClick: share });
          const retryBtn = button({ label: P.retry.text, variant: 'secondary', onClick: () => generate() });
          const rechooseBtn = button({ label: P.rechoose.text, variant: 'quiet', onClick: () => guard() && show(2) });
          const nextBtn = button({ label: P.next, variant: 'secondary', onClick: () => guard() && show(4) });
          saveBtn.disabled = true;
          shareBtn.hidden = true;
          retryBtn.hidden = true;

          root.append(el('div', { class: 'finale__postcard-layout' }, [
            frame,
            el('div', { class: 'finale__side' }, [
              header(),
              status,
              el('div', { class: 'actions actions--stack' }, [saveBtn, shareBtn, retryBtn, nextBtn, rechooseBtn])
            ])
          ]));

          let currentBlob = null;
          const filename = P.filename;
          const altText = [
            'Bưu thiếp: ' + P.heading + '.',
            option.postcardLine.text,
            session.place ? P.placeLabel.text + ': ' + session.place + '.' : '',
            session.message ? P.messageHeading.text + ': ' + session.message : '',
            'Tranh: ' + option.alt + '.'
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
              trip: session.trip,
              tripLine: option.postcardLine.text,
              place: session.place,
              message: session.message,
              texts: {
                heading: P.heading,
                placeLabel: P.placeLabel.text,
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
                  show(5);
                }
              }),
              button({ label: story.ui.nav.back, variant: 'secondary', onClick: () => guard() && show(validChoice() ? 3 : 2) })
            ])
          ]));
        },

        end() {
          const A = F.endActions;
          root.append(el('div', { class: 'page finale__page finale__end' }, [
            replaying ? el('p', { class: 'badge', text: story.ui.chapter.replayBadge }) : null,
            (story.photos && NNBT.photos)
              ? el('div', { class: 'finale__photos' }, [
                  // Tải ngay (không chờ), để màn hình kết không bao giờ hiện khung ảnh trống
                  NNBT.photos.polaroid(story.photos.flowers, { rotate: -4, zoom: true, lazy: false }),
                  NNBT.photos.polaroid(story.photos.river, { rotate: 3, zoom: true, lazy: false })
                ])
              : el('figure', { class: 'finale__end-art', 'aria-hidden': 'true', html: NNBT.icons.icon('aurora', 'finale__end-svg') }),
            el('h1', { class: 'finale__ending', text: F.ending }),
            el('div', { class: 'actions finale__end-actions' }, [
              button({ label: A.postcard.text, variant: 'secondary', onClick: () => guard() && show(3) }),
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

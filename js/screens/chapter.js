/*
 * chapter.js — Màn hình một chương, dùng chung cho Chương 1–5.
 *
 * - Chương có nội dung trong story.chapterContent → kể theo từng nhịp (tranh + chữ).
 *   Người chơi chủ động bấm "Tiếp tục" (hoặc chạm vào vật được gợi ý trong tranh) để sang nhịp sau.
 * - Nhịp có `interact` (câu đố, câu tự gõ, chạm nhiều lần, nhấn giữ) phải xong mới hiện nút đi tiếp.
 *   Không bao giờ có thua: câu đố luôn có đáp án hiện ra, câu tự gõ sai 3 lần thì có nút xem đáp án.
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

  // ---------- So khớp câu trả lời tự gõ ("đúng khoảng 80% là được") ----------
  // Bỏ dấu, bỏ hoa/thường, bỏ dấu câu, rồi so độ giống nhau theo khoảng cách Levenshtein.
  function normalize(s) {
    return String(s).normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[đĐ]/g, 'd').toLowerCase()
      .replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();
  }
  function distance(a, b) {
    const row = Array.from({ length: b.length + 1 }, (_, j) => j);
    for (let i = 1; i <= a.length; i++) {
      let prev = row[0];
      row[0] = i;
      for (let j = 1; j <= b.length; j++) {
        const tmp = row[j];
        row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
        prev = tmp;
      }
    }
    return row[b.length];
  }
  function matches(value, answers, threshold) {
    const v = normalize(value);
    return (answers || []).some((ans) => {
      const a = normalize(ans);
      if (!a) return false;
      return 1 - distance(v, a) / Math.max(v.length, a.length) >= threshold;
    });
  }

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
    const hotspot = el('button', { type: 'button', class: 'hotspot', onClick: () => onHotspot() }, [
      el('span', { class: 'hotspot__ring', 'aria-hidden': 'true' }),
      hotspotIcon,
      el('span', { class: 'sr-only hotspot__label' })
    ]);
    // Ảnh thật (polaroid) phủ lên tranh ở những nhịp có ảnh; nút chạm luôn nằm trên cùng.
    const photoStage = NNBT.photos ? NNBT.photos.stage() : null;
    if (photoStage) figure.append(photoStage.node);
    figure.append(hotspot);

    // Chữ & nút
    const textBox = el('div', { class: 'story-text', 'aria-live': 'polite' });
    const play = el('div', { class: 'story-play' }); // câu đố / tương tác của nhịp (nếu có)
    const hint = el('p', { class: 'story-hint' });
    let done = true;          // nhịp hiện tại đã xong tương tác chưa (chưa xong thì chưa hiện nút đi tiếp)
    let taps = 0;             // số lần đã chạm ở nhịp "taps"
    let stopHold = null;      // dọn bộ đếm của nút nhấn giữ khi rời nhịp
    let holdTimer = null;     // tự sang nhịp sau khi giữ xong
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
        play,
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

      // Ảnh thật: có thì hiện polaroid và ẩn tranh khỏi trình đọc màn hình (ảnh tự có mô tả riêng).
      const svgEl = figure.querySelector('svg.scene-art');
      if (photoStage && beat.photos && beat.photos.length) {
        photoStage.show(beat.photos);
        if (svgEl) svgEl.setAttribute('aria-hidden', 'true');
      } else {
        if (photoStage) photoStage.hide();
        if (svgEl) svgEl.removeAttribute('aria-hidden');
      }

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

      // Dọn trạng thái tương tác của nhịp trước
      if (stopHold) { stopHold(); stopHold = null; }
      clearTimeout(holdTimer);
      figure.style.removeProperty('--hold');
      figure.style.removeProperty('--tap-progress');
      figure.classList.remove('is-tapped');
      play.textContent = '';
      taps = 0;
      const it = beat.interact || null;
      done = !it;
      revealTaps(it && it.type === 'taps' ? 0 : Infinity);

      if (it && it.type === 'taps') {
        placeHotspot(tapPoint(it), it.label, it.icon);
      } else if (beat.hotspot) {
        placeHotspot([beat.hotspot.x, beat.hotspot.y], beat.hotspot.label, beat.hotspot.icon);
      } else {
        hotspot.hidden = true;
      }
      if (it) renderInteract(it);

      // Nút
      updateButtons();
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

    // ---------- Tương tác trong nhịp: câu đố, câu tự gõ, chạm, nhấn giữ (không bao giờ có thua) ----------

    function updateButtons() {
      nextBtn.hidden = index >= last || !done;
      finishBtn.hidden = index < last || !done;
    }

    function complete() {
      if (done) return;
      done = true;
      updateButtons();
      const btn = index >= last ? finishBtn : nextBtn;
      btn.classList.add('is-arriving');
      btn.focus({ preventScroll: true });
    }

    function placeHotspot(point, label, iconName) {
      hotspot.hidden = false;
      hotspot.style.left = point[0] + '%';
      hotspot.style.top = point[1] + '%';
      hotspot.querySelector('.hotspot__label').textContent = label || '';
      // Có biểu tượng → nút tròn nhìn thấy rõ (vd chiếc ô); không có → chỉ vòng sáng quanh vật trong tranh.
      hotspot.classList.toggle('hotspot--token', !!iconName);
      hotspotIcon.innerHTML = iconName && NNBT.icons ? NNBT.icons.icon(iconName, 'hotspot__svg') : '';
    }

    function tapPoint(it) {
      const pts = it.points && it.points.length ? it.points : [[50, 50]];
      return pts[Math.min(taps, pts.length - 1)];
    }

    // Các chi tiết trong tranh hiện dần theo số lần chạm: [data-tap-show="k"] hiện khi đã chạm ≥ k lần.
    // Ngoài nhịp "taps" thì hiện hết.
    function revealTaps(n) {
      figure.querySelectorAll('[data-tap-show]').forEach((node) => {
        const k = Number(node.dataset.tapShow);
        node.classList.toggle('tap-hidden', k > n);
        node.classList.toggle('tap-new', k === n); // chi tiết vừa hiện thì "nảy" nhẹ
      });
    }

    function onHotspot() {
      const it = beats[index].interact;
      if (it && it.type === 'taps') {
        if (!done) tap(it);
        return;
      }
      advance();
    }

    function tap(it) {
      taps += 1;
      revealTaps(taps);
      figure.style.setProperty('--tap-progress', String(Math.min(1, taps / it.count)));
      figure.classList.remove('is-tapped');
      void figure.offsetWidth; // chạy lại hoạt ảnh rung nhẹ
      figure.classList.add('is-tapped');
      const counter = play.querySelector('.play-counter');
      if (taps >= it.count) {
        hotspot.hidden = true;
        if (counter) counter.remove();
        burst();
        complete();
      } else {
        placeHotspot(tapPoint(it), it.label, it.icon);
        if (counter) counter.textContent = ctx.story.format(t.play.tapsLeft, { n: it.count - taps });
      }
    }

    function renderInteract(it) {
      // Nhịp chỉ có tương tác (không có lời kể): câu nhắc hiện to như một câu hỏi thay vì dòng gợi ý nhỏ.
      const beat = beats[index];
      if ((it.type === 'taps' || it.type === 'hold') && !beat.text.length && beat.hint) {
        play.append(el('p', { class: 'quiz__q', text: beat.hint.text }));
        hint.hidden = true;
      }
      if (it.type === 'quiz') renderQuiz(it);
      else if (it.type === 'open') renderOpen(it);
      else if (it.type === 'hold') renderHold(it);
      else if (it.type === 'taps') {
        play.append(el('p', { class: 'play-counter', 'aria-live': 'polite', text: ctx.story.format(t.play.tapsLeft, { n: it.count }) }));
      }
    }

    function feedbackLine() {
      return el('p', { class: 'play-feedback', 'aria-live': 'polite' });
    }

    // Trái tim nhỏ bay lên khi trả lời đúng / làm xong
    function burst() {
      if (ctx.reducedMotion()) return;
      const b = el('span', { class: 'play-burst', 'aria-hidden': 'true' });
      for (let k = 0; k < 7; k++) {
        b.append(el('i', { style: '--k:' + k + ';--dx:' + ((k - 3) * 14) + 'px' }));
      }
      play.append(b);
      setTimeout(() => b.remove(), 1400);
    }

    function renderQuiz(it) {
      const letters = 'ABCDE';
      const feedback = feedbackLine();
      const list = el('div', { class: 'quiz__options', role: 'group', 'aria-label': it.question });
      const buttons = [];
      const answerBtn = it.answer ? option(it.answer, 4, true) : null;
      it.options.forEach((o, k) => list.append(option(o, k, !!it.all)));
      if (answerBtn) {
        answerBtn.hidden = true;
        list.append(answerBtn);
      }

      function option(o, k, right) {
        const btn = el('button', { type: 'button', class: 'quiz__opt' }, [
          it.all ? null : el('span', { class: 'quiz__letter', 'aria-hidden': 'true', text: letters[k] }),
          el('span', { class: 'quiz__text', text: o.text })
        ]);
        btn.addEventListener('click', () => (right ? correct(btn, o) : wrong(btn, o)));
        buttons.push(btn);
        return btn;
      }

      function wrong(btn, o) {
        if (done) return;
        btn.classList.add('is-wrong');
        btn.disabled = true;
        feedback.textContent = o.reply || t.play.wrong;
        if (answerBtn && answerBtn.hidden) {
          answerBtn.hidden = false;
          answerBtn.classList.add('is-appearing');
        }
      }

      function correct(btn, o) {
        if (done) return;
        btn.classList.add('is-right');
        buttons.forEach((b) => { if (b !== btn) b.disabled = true; });
        feedback.textContent = o.reply || it.reply || '';
        burst();
        complete();
      }

      play.append(el('div', { class: 'quiz' }, [
        el('p', { class: 'quiz__q', text: it.question }),
        list,
        feedback
      ]));
    }

    function renderOpen(it) {
      const id = 'open-' + chapter.id + '-' + index;
      const input = el('input', { id, type: 'text', class: 'open__input', autocomplete: 'off', maxlength: 80, placeholder: it.placeholder || '' });
      const submit = el('button', { type: 'submit', class: 'btn btn--primary open__submit' }, t.play.submit);
      const feedback = feedbackLine();
      const revealBtn = button({ label: t.play.reveal, variant: 'quiet', onClick: () => finishOpen(it.reveal) });
      revealBtn.hidden = true;
      let tries = 0;

      const form = el('form', { class: 'open', novalidate: true }, [
        el('label', { for: id, class: 'quiz__q', text: it.question }),
        el('div', { class: 'open__row' }, [input, submit]),
        feedback,
        revealBtn
      ]);
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (done) return;
        const value = input.value.trim();
        if (!value) { input.focus(); return; }
        if (matches(value, it.answers, it.threshold || 0.8)) {
          finishOpen(it.reply);
          input.classList.add('is-right');
          burst();
          return;
        }
        tries += 1;
        feedback.textContent = it.wrong || t.play.wrong;
        input.classList.remove('is-wrong');
        void input.offsetWidth;
        input.classList.add('is-wrong');
        if (tries >= 3) revealBtn.hidden = false;
        input.select();
      });

      function finishOpen(text) {
        if (done) return;
        feedback.textContent = text || '';
        input.readOnly = true;
        submit.disabled = true;
        revealBtn.hidden = true;
        complete();
      }

      play.append(form);
    }

    function renderHold(it) {
      const fill = el('span', { class: 'hold-btn__fill', 'aria-hidden': 'true' });
      const label = el('span', { class: 'hold-btn__label', text: it.label });
      const btn = el('button', { type: 'button', class: 'hold-btn' }, [fill, label]);
      const ms = it.ms || 1600;
      let p = 0;
      let holding = false;
      let timer = null;
      let last = 0;

      function setP(v) {
        p = Math.max(0, Math.min(1, v));
        fill.style.transform = 'scaleX(' + p + ')';
        figure.style.setProperty('--hold', p.toFixed(3));
      }
      function tick() {
        const now = Date.now();
        const dt = now - last;
        last = now;
        setP(p + (holding ? dt / ms : -dt / (ms * 0.6)));
        if (p >= 1) {
          stopTimer();
          btn.classList.add('is-done');
          btn.disabled = true;
          label.textContent = t.play.holdDone;
          burst();
          complete();
          // Giữ xong → tự sang nhịp sau (người chơi vẫn có thể bấm nút đi tiếp ngay).
          const at = index;
          holdTimer = setTimeout(() => { if (index === at) advance(); }, 900);
        } else if (!holding && p <= 0) {
          stopTimer();
        }
      }
      function startTimer() {
        if (timer) return;
        last = Date.now();
        timer = setInterval(tick, 30);
      }
      function stopTimer() {
        clearInterval(timer);
        timer = null;
      }
      function press(e) {
        if (done) return;
        if (e && e.cancelable) e.preventDefault();
        holding = true;
        btn.classList.add('is-holding');
        startTimer();
      }
      function release() {
        holding = false;
        btn.classList.remove('is-holding');
        if (!done) startTimer();
      }

      btn.addEventListener('pointerdown', (e) => {
        if (btn.setPointerCapture) { try { btn.setPointerCapture(e.pointerId); } catch (err) { /* bỏ qua */ } }
        press(e);
      });
      ['pointerup', 'pointercancel', 'lostpointercapture'].forEach((ev) => btn.addEventListener(ev, release));
      btn.addEventListener('contextmenu', (e) => e.preventDefault());
      btn.addEventListener('keydown', (e) => {
        if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) press(e);
      });
      btn.addEventListener('keyup', (e) => {
        if (e.key === ' ' || e.key === 'Enter') release();
      });

      setP(0);
      stopHold = () => { stopTimer(); holding = false; };
      play.append(el('div', { class: 'hold' }, [btn]));
    }

    function advance() {
      if (!done) return;
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

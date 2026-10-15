/*
 * map.js — Bản đồ hành trình.
 *
 * - Mỗi chương là một điểm dừng (nút thật, dùng được bằng chạm, chuột và bàn phím).
 * - Trạng thái điểm dừng được TÍNH từ tiến trình, bản đồ không tự ghi hay mở khóa gì:
 *     visited  — chương đã đi hết (vd Mở đầu sau khi bấm "Đi thôi, anh!")
 *     unlocked — đã mở nhưng chưa đi hết
 *     next     — điểm kế tiếp sau chương cuối cùng đã đi qua, nhưng CHƯA mở
 *     locked   — đang chờ
 * - Chạm vào "next" của chương đã có nội dung (ready) → mở khóa chương đó và vào đọc.
 * - Chạm vào điểm chưa mở khác → thông báo nhẹ, không làm gì khác.
 * - Hai bố cục: dọc cho điện thoại, ngang cho máy tính; tự đổi khi xoay máy / đổi cỡ cửa sổ.
 */
(function (NNBT) {
  'use strict';

  const WIDE_QUERY = '(min-width: 760px)';

  // Tọa độ điểm dừng theo % khung bản đồ: [x, y, vị trí nhãn].
  // Điện thoại: điểm so le hai bên, nhãn hướng vào giữa. Máy tính: nhãn nằm dưới điểm.
  // w/h phải cùng tỉ lệ với aspect-ratio của .map trong css/map.css.
  const LAYOUTS = {
    tall: {
      w: 300, h: 600,
      points: {
        prologue: [20, 92, 'right'], ch1: [80, 76, 'left'], ch2: [20, 60, 'right'],
        ch3: [80, 44, 'left'], ch4: [20, 28, 'right'], ch5: [80, 11, 'left']
      }
    },
    wide: {
      w: 1600, h: 900,
      points: {
        prologue: [9, 66, 'below'], ch1: [25, 30, 'below'], ch2: [42, 62, 'below'],
        ch3: [58, 27, 'below'], ch4: [75, 60, 'below'], ch5: [91, 25, 'below']
      }
    }
  };

  // Mảng màu nền theo ý nghĩa: ấm = bên nhau, xanh dịu = khoảng cách / mưa, vàng = tương lai.
  const WASHES = {
    prologue: ['var(--wash-warm)', 0.35],
    ch1: ['var(--wash-mist)', 0.5],
    ch2: ['var(--wash-warm)', 0.4],
    ch3: ['var(--wash-warm)', 0.32],
    ch4: ['var(--wash-mist)', 0.42],
    ch5: ['var(--wash-dawn)', 0.5]
  };

  // Biểu tượng điểm dừng: dùng bộ biểu tượng chung (js/components/icons.js).
  function icon(name) {
    return NNBT.icons.icon(name, 'stop__icon');
  }

  function statusOf(chapters, store) {
    const s = store.get();
    let nextAssigned = false;
    const result = {};
    chapters.forEach((c, i) => {
      if (s.progress.completed.includes(c.id)) result[c.id] = 'visited';
      else if (s.progress.unlocked.includes(c.id)) result[c.id] = 'unlocked';
      else if (!nextAssigned && i > 0 && s.progress.completed.includes(chapters[i - 1].id)) {
        result[c.id] = 'next';
        nextAssigned = true;
      } else result[c.id] = 'locked';
    });
    return result;
  }

  // Đường cong mềm qua các điểm (Catmull-Rom → Bézier), trả về từng đoạn để tô khác nhau.
  function segments(pts) {
    const out = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2] || p2;
      const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
      const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
      out.push('M' + p1.join(' ') + ' C' + c1.join(' ') + ', ' + c2.join(' ') + ', ' + p2.join(' '));
    }
    return out;
  }

  // Nền bản đồ thật, rất mờ (Natural Earth — js/art/geo.js): Việt Nam, Đài Loan, Nhật Bản và vùng biển quanh.
  function geoBackdrop(layoutName) {
    const g = NNBT.geo && NNBT.geo[layoutName];
    if (!g) return '';
    return '<g class="map__geo">' +
      '<path d="' + g.d + '" fill="#f7dde5" opacity="0.75"/>' +
      '<path d="' + g.d + '" fill="none" stroke="#d6a7b7" stroke-width="1" vector-effect="non-scaling-stroke" opacity="0.7"/>' +
      '</g>';
  }

  function terrainSvg(layout, chapters, status, mapAlt, layoutName) {
    const px = (id) => {
      const p = layout.points[id];
      return [Math.round((p[0] / 100) * layout.w), Math.round((p[1] / 100) * layout.h)];
    };
    const pts = chapters.map((c) => px(c.id));
    const r = Math.round(Math.min(layout.w, layout.h) * 0.2);

    let washes = '';
    chapters.forEach((c) => {
      const [x, y] = px(c.id);
      const [color, op] = WASHES[c.id] || ['var(--wash-warm)', 0.3];
      washes += '<ellipse cx="' + x + '" cy="' + y + '" rx="' + Math.round(r * 1.15) + '" ry="' + Math.round(r * 0.8) +
        '" fill="' + color + '" opacity="' + op + '"/>';
    });

    // Mưa nhẹ quanh điểm Chương 1
    const [rx, ry] = px('ch1');
    let rain = '';
    for (let i = 0; i < 9; i++) {
      const x = rx - r * 0.9 + ((i * 37) % 100) / 100 * r * 1.8;
      const y = ry - r * 0.7 + ((i * 53) % 100) / 100 * r * 0.9;
      const len = r * 0.12;
      rain += '<path d="M' + x.toFixed(1) + ' ' + y.toFixed(1) + ' l' + (-len * 0.3).toFixed(1) + ' ' + len.toFixed(1) + '"/>';
    }

    let path = '';
    segments(pts).forEach((d, i) => {
      const to = status[chapters[i + 1].id];
      const cls = to === 'visited' || to === 'unlocked' ? 'walked' : to === 'next' ? 'next' : 'future';
      path += '<path class="map__path map__path--' + cls + '" d="' + d + '"/>';
    });

    return (
      '<svg class="map__terrain" viewBox="0 0 ' + layout.w + ' ' + layout.h + '" preserveAspectRatio="none" role="img" aria-label="' + mapAlt + '">' +
        '<defs><filter id="map-soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="' + Math.round(Math.min(layout.w, layout.h) * 0.045) + '"/></filter></defs>' +
        '<rect width="' + layout.w + '" height="' + layout.h + '" fill="#ecebf7" opacity="0.6"/>' +
        geoBackdrop(layoutName) +
        '<g filter="url(#map-soft)" opacity="0.75">' + washes + '</g>' +
        '<g class="map__rain" stroke="var(--mist)" stroke-width="2" stroke-linecap="round" opacity="0.45">' + rain + '</g>' +
        '<g fill="none" stroke-linecap="round">' + path + '</g>' +
      '</svg>'
    );
  }

  NNBT.engine.register('map', {
    resumable: true,
    title: () => NNBT.story.ui.map.heading,

    render(node, ctx) {
      const { el, button } = ctx.ui;
      const story = ctx.story;
      const t = story.ui.map;

      // Vào bản đồ là đã rời chế độ xem lại.
      if (ctx.store.get().replay.active) {
        ctx.store.update((s) => { s.replay = { active: false, chapter: null }; });
      }

      const chapters = story.chapters;
      const wideMq = window.matchMedia ? window.matchMedia(WIDE_QUERY) : null;
      const mapBox = el('div', { class: 'map' });
      let renderedLayout = null;

      function onStop(chapter, status) {
        // Chặng tiếp theo đã có nội dung: chỉ mở khóa khi người chơi chủ động chạm vào.
        if (status === 'next' && chapter.ready) {
          ctx.store.unlockChapter(chapter.id);
          const target = story.screenFor(chapter.id);
          ctx.go(target, target === 'chapter' ? { chapter: chapter.id } : {});
          return;
        }
        if (status === 'visited' || status === 'unlocked') {
          // Mở lại một chương đã đi qua = xem lại (không đổi tiến trình).
          if (status === 'visited') {
            ctx.store.update((s) => { s.replay = { active: true, chapter: chapter.id }; });
          }
          const screen = story.screenFor(chapter.id);
          ctx.go(screen, screen === 'chapter' ? { chapter: chapter.id } : {});
          return;
        }
        ctx.ui.toast(t.lockedNotice.text);
      }

      function draw() {
        const layoutName = wideMq && wideMq.matches ? 'wide' : 'tall';
        if (layoutName === renderedLayout) return;
        renderedLayout = layoutName;
        const layout = LAYOUTS[layoutName];
        const status = statusOf(chapters, ctx.store);

        // Giữ focus nếu người dùng đang ở trên một điểm dừng khi bố cục đổi.
        const focusedId = document.activeElement && document.activeElement.dataset
          ? document.activeElement.dataset.stop : null;

        mapBox.dataset.layout = layoutName;
        mapBox.innerHTML = terrainSvg(layout, chapters, status, t.mapAlt, layoutName);

        const list = el('ol', { class: 'map__stops' }, chapters.map((c) => {
          const st = status[c.id];
          const [x, y, side] = layout.points[c.id];
          const statusId = 'stop-status-' + c.id;
          return el('li', { class: 'stop stop--' + st + ' stop--' + side, style: 'left:' + x + '%;top:' + y + '%' }, [
            el('button', {
              type: 'button',
              class: 'stop__btn',
              dataset: { stop: c.id },
              'aria-describedby': statusId,
              onClick: () => onStop(c, st)
            }, [
              el('span', { class: 'stop__marker', html: icon(c.icon) }),
              el('span', { class: 'stop__text' }, [
                el('span', { class: 'stop__label', text: c.label }),
                el('span', { class: 'stop__title', text: c.title }),
                c.place ? el('span', { class: 'stop__place', text: c.place }) : null,
                el('span', { class: 'stop__status', id: statusId, text: t.status[st].text })
              ])
            ])
          ]);
        }));
        mapBox.append(list);

        if (focusedId) {
          const again = mapBox.querySelector('[data-stop="' + focusedId + '"]');
          if (again) again.focus({ preventScroll: true });
        }
      }

      draw();
      if (wideMq) {
        if (wideMq.addEventListener) wideMq.addEventListener('change', draw);
        else if (wideMq.addListener) wideMq.addListener(draw);
      }

      node.append(
        el('article', { class: 'map-screen' }, [
          el('header', { class: 'map-screen__head' }, [
            el('h1', { class: 'page__title', text: t.heading }),
            el('p', { class: 'page__lede', text: t.hint.text, 'data-draft': t.hint.draft ? 'true' : null })
          ]),
          mapBox,
          el('div', { class: 'actions' }, [
            button({ label: story.ui.nav.back, variant: 'secondary', onClick: () => ctx.back() })
          ])
        ])
      );

      // Dọn dẹp khi rời màn hình.
      return () => {
        if (!wideMq) return;
        if (wideMq.removeEventListener) wideMq.removeEventListener('change', draw);
        else if (wideMq.removeListener) wideMq.removeListener(draw);
      };
    }
  });
})(window.NNBT);

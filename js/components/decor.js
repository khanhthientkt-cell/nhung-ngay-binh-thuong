/*
 * decor.js — Trang trí nền: nhành lá màu nước ở hai góc + hình vẽ tay nhỏ ở hai bên lề, đổi theo từng chương.
 *
 * - Chỉ để trang trí: aria-hidden, không nhận chạm/chuột, nằm sau nội dung, không chuyển động.
 * - Hình vẽ tay ở lề chỉ hiện trên màn hình rộng (xem css/decor.css) để không chồng lên chữ trên điện thoại.
 * - Chủ đề đổi theo màn hình / chương qua sự kiện 'nnbt:screenchange'.
 */
window.NNBT = window.NNBT || {};

(function (NNBT) {
  'use strict';

  // Biểu tượng (từ js/components/icons.js) cho từng chủ đề
  // 10 hình mỗi chủ đề: 5 bên trái, 5 bên phải (theo thứ tự SLOTS).
  const THEMES = {
    home:  ['letter', 'spark', 'hug', 'song', 'spark',   'song', 'letter', 'spark', 'hug', 'spark'],
    map:   ['road', 'spark', 'umbrella', 'helmet', 'spark', 'houses', 'spark', 'aurora', 'song', 'road'],
    ch1:   ['umbrella', 'spark', 'road', 'umbrella', 'spark', 'umbrella', 'spark', 'road', 'umbrella', 'spark'],
    ch2:   ['cups', 'spark', 'helmet', 'laptops', 'bed',   'helmet', 'cups', 'spark', 'bed', 'laptops'],
    ch3:   ['song', 'hug', 'spark', 'song', 'hug',         'hug', 'song', 'spark', 'song', 'hug'],
    ch4:   ['houses', 'spark', 'road', 'letter', 'spark',  'spark', 'houses', 'letter', 'road', 'spark'],
    ch5:   ['aurora', 'spark', 'road', 'letter', 'spark',  'spark', 'aurora', 'spark', 'letter', 'aurora']
  };

  // Vị trí ở hai bên lề. f: vị trí trong phần lề trống (0 = sát mép màn hình, 1 = sát nội dung, vẫn cách 12px);
  // y: vh; size: px; rotate: độ. Lề tính từ độ rộng tối đa của nội dung (64rem = 1024px).
  const CONTENT_MAX = 1024;
  const SLOTS = [
    { side: 'left',  f: 0.30, y: 16, size: 50, rotate: -12 },
    { side: 'left',  f: 0.95, y: 31, size: 30, rotate: 14 },
    { side: 'left',  f: 0.22, y: 46, size: 56, rotate: -6 },
    { side: 'left',  f: 0.85, y: 63, size: 40, rotate: 9 },
    { side: 'left',  f: 0.35, y: 79, size: 34, rotate: -14 },
    { side: 'right', f: 0.28, y: 20, size: 46, rotate: 10 },
    { side: 'right', f: 0.95, y: 36, size: 30, rotate: -12 },
    { side: 'right', f: 0.22, y: 52, size: 54, rotate: 6 },
    { side: 'right', f: 0.88, y: 68, size: 34, rotate: -8 },
    { side: 'right', f: 0.32, y: 83, size: 42, rotate: 12 }
  ];

  // Mảng màu nước mờ ở nền theo chủ đề: [màu, vị trí x%, y%, bán kính vw]
  const WASHES = {
    home: [['rgba(231,165,131,0.35)', 8, 30, 22], ['rgba(157,191,207,0.32)', 92, 70, 24], ['rgba(236,191,95,0.26)', 85, 12, 14]],
    map:  [['rgba(231,165,131,0.29)', 10, 70, 22], ['rgba(157,191,207,0.32)', 90, 30, 24], ['rgba(236,191,95,0.26)', 50, 96, 20]],
    ch1:  [['rgba(140,175,190,0.42)', 8, 40, 26], ['rgba(157,191,207,0.38)', 92, 60, 26], ['rgba(169,189,141,0.26)', 80, 10, 16]],
    ch2:  [['rgba(231,165,131,0.38)', 8, 60, 24], ['rgba(240,194,122,0.32)', 92, 30, 24], ['rgba(231,165,131,0.22)', 50, 100, 22]],
    ch3:  [['rgba(231,165,131,0.38)', 10, 35, 24], ['rgba(217,138,99,0.26)', 90, 65, 24], ['rgba(236,191,95,0.26)', 88, 12, 14]],
    ch4:  [['rgba(157,191,207,0.42)', 8, 35, 24], ['rgba(236,191,95,0.32)', 92, 70, 24], ['rgba(157,191,207,0.26)', 70, 6, 16]],
    ch5:  [['rgba(236,191,95,0.38)', 90, 30, 26], ['rgba(110,200,170,0.26)', 10, 25, 22], ['rgba(140,160,240,0.22)', 12, 80, 20]]
  };

  // Nhành lá màu nước (góc trên trái); góc dưới phải dùng cùng hình, xoay 180° và đổi màu.
  function sprig(tone) {
    const leaf = tone === 'warm' ? ['#a9bd8d', '#93ab7a'] : ['#9dbfcf', '#86aabb'];
    const bloom = tone === 'warm' ? ['#e7a583', '#f0c27a'] : ['#c9d8e6', '#ecbf5f'];
    const leaves = [
      [40, 52, 34, 13, 32], [70, 74, 30, 12, 50], [62, 34, 30, 11, 8], [98, 98, 28, 11, 58],
      [96, 58, 26, 10, 22], [128, 116, 24, 10, 64], [124, 84, 22, 9, 36], [150, 140, 20, 8, 70]
    ];
    let s = '<path d="M0 0 C 50 40, 110 90, 170 165" fill="none" stroke="' + leaf[1] + '" stroke-width="2.4" stroke-linecap="round" opacity="0.7"/>';
    s += '<g filter="url(#wc-wash)">';
    leaves.forEach(([x, y, rx, ry, rot], i) => {
      s += '<ellipse cx="' + x + '" cy="' + y + '" rx="' + rx + '" ry="' + ry + '" transform="rotate(' + rot + ' ' + x + ' ' + y + ')" fill="' + leaf[i % 2] + '" opacity="0.75"/>';
    });
    [[30, 92, bloom[0]], [118, 46, bloom[1]], [160, 104, bloom[0]]].forEach(([x, y, c]) => {
      for (let k = 0; k < 5; k++) {
        const a = (k / 5) * Math.PI * 2;
        s += '<circle cx="' + (x + Math.cos(a) * 7).toFixed(1) + '" cy="' + (y + Math.sin(a) * 7).toFixed(1) + '" r="6" fill="' + c + '" opacity="0.8"/>';
      }
    });
    s += '</g>';
    [[30, 92], [118, 46], [160, 104]].forEach(([x, y]) => {
      s += '<circle cx="' + x + '" cy="' + y + '" r="3" fill="#b98a2a" opacity="0.8"/>';
    });
    [[20, 140], [150, 30], [186, 70], [80, 150]].forEach(([x, y]) => {
      s += '<circle cx="' + x + '" cy="' + y + '" r="2.2" fill="' + bloom[1] + '" opacity="0.7"/>';
    });
    return '<svg viewBox="0 0 200 180" class="decor__sprig-svg" focusable="false">' + s + '</svg>';
  }

  function build() {
    const root = document.createElement('div');
    root.className = 'decor';
    root.setAttribute('aria-hidden', 'true');

    const tl = document.createElement('div');
    tl.className = 'decor__sprig decor__sprig--tl';
    tl.innerHTML = sprig('warm');
    const br = document.createElement('div');
    br.className = 'decor__sprig decor__sprig--br';
    br.innerHTML = sprig('mist');
    root.append(tl, br);

    // Mảng màu nền theo chủ đề (nằm dưới cùng)
    Object.keys(WASHES).forEach((theme) => {
      const wash = document.createElement('div');
      wash.className = 'decor__wash';
      wash.dataset.theme = theme;
      wash.style.background = WASHES[theme].map(([c, x, y, r]) =>
        'radial-gradient(circle ' + r + 'vw at ' + x + '% ' + y + '%, ' + c + ', transparent 70%)').join(', ');
      root.prepend(wash);
    });

    // Mỗi chủ đề một nhóm hình vẽ tay; chỉ nhóm đang dùng được hiện.
    Object.keys(THEMES).forEach((theme) => {
      const group = document.createElement('div');
      group.className = 'decor__doodles';
      group.dataset.theme = theme;
      THEMES[theme].forEach((iconName, i) => {
        const slot = SLOTS[i];
        const d = document.createElement('span');
        d.className = 'decor__doodle decor__doodle--' + (i % 2 ? 'mist' : 'warm');
        // Luôn nằm trong lề: khoảng trống khả dụng = lề − cỡ hình − 12px (100% = độ rộng vùng trang trí, không tính thanh cuộn)
        d.style[slot.side] = 'calc(max(0px, (100% - ' + CONTENT_MAX + 'px) / 2 - ' + (slot.size + 12) + 'px) * ' + slot.f + ')';
        d.style.top = slot.y + 'vh';
        d.style.width = slot.size + 'px';
        d.style.height = slot.size + 'px';
        d.style.transform = 'rotate(' + slot.rotate + 'deg)';
        d.innerHTML = NNBT.icons ? NNBT.icons.icon(iconName, 'decor__doodle-svg') : '';
        group.append(d);
      });
      root.append(group);
    });
    return root;
  }

  function themeFor(id, params) {
    if (id === 'chapter' && params && THEMES[params.chapter]) return params.chapter;
    if (id === 'finale') return 'ch5';
    if (id === 'map') return 'map';
    return 'home'; // start, letter, memories
  }

  function init() {
    const root = build();
    document.body.prepend(root);
    root.dataset.theme = 'home';
    document.addEventListener('nnbt:screenchange', (e) => {
      root.dataset.theme = themeFor(e.detail.id, e.detail.params);
    });
  }

  NNBT.decor = { init };
})(window.NNBT);

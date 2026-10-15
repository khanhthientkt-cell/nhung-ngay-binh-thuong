/*
 * decor.js — Trang trí nền (tông hồng pastel): cành hoa anh đào ở hai góc + quầng màu rất nhẹ đổi theo chương.
 *
 * - Chỉ để trang trí: aria-hidden, không nhận chạm/chuột, nằm sau nội dung, không chuyển động.
 * - Đã bỏ các hình vẽ nhỏ rải ở lề (trông rối và "quê"); giữ nền thật sạch để tranh và chữ nổi lên.
 * - Chủ đề màu đổi theo màn hình / chương qua sự kiện 'nnbt:screenchange'.
 */
window.NNBT = window.NNBT || {};

(function (NNBT) {
  'use strict';

  // Quầng màu nền theo chủ đề: [màu, vị trí x%, y%, bán kính vw]. Hồng · đào · oải hương.
  const PINK = 'rgba(255, 196, 214, 0.45)';
  const PEACH = 'rgba(255, 214, 196, 0.4)';
  const LILAC = 'rgba(214, 204, 246, 0.42)';
  const MINT = 'rgba(196, 234, 222, 0.35)';
  const WASHES = {
    home: [[PINK, 8, 25, 26], [LILAC, 92, 75, 26], [PEACH, 86, 10, 16]],
    map:  [[PINK, 10, 70, 24], [LILAC, 90, 28, 24], [PEACH, 50, 98, 20]],
    ch1:  [[LILAC, 8, 40, 28], [PINK, 92, 62, 24], [MINT, 82, 8, 16]],
    ch2:  [[PEACH, 8, 60, 26], [PINK, 92, 30, 24], [PINK, 50, 100, 22]],
    ch3:  [[PINK, 10, 35, 26], [PEACH, 90, 65, 24], [LILAC, 88, 10, 14]],
    ch4:  [[LILAC, 8, 35, 26], [PINK, 92, 70, 24], [PEACH, 70, 6, 16]],
    ch5:  [[LILAC, 90, 30, 28], [MINT, 10, 25, 22], [PINK, 12, 80, 22]]
  };

  // Một bông anh đào: 5 cánh có khía nhỏ ở đầu cánh, nhụy hồng đậm.
  function blossom(x, y, r, rot, light) {
    const petal = 'M0 0 C ' + (-r * 0.55) + ' ' + (-r * 0.35) + ', ' + (-r * 0.5) + ' ' + (-r * 0.95) + ', ' + (-r * 0.12) + ' ' + (-r) +
      ' L 0 ' + (-r * 0.86) + ' L ' + (r * 0.12) + ' ' + (-r) +
      ' C ' + (r * 0.5) + ' ' + (-r * 0.95) + ', ' + (r * 0.55) + ' ' + (-r * 0.35) + ', 0 0 Z';
    let s = '<g transform="translate(' + x + ' ' + y + ') rotate(' + rot + ')">';
    for (let k = 0; k < 5; k++) {
      s += '<path d="' + petal + '" transform="rotate(' + (k * 72) + ')" fill="' + (light ? '#fde3eb' : '#f8c9d7') + '" stroke="#eba5bb" stroke-width="0.8"/>';
    }
    s += '<circle r="' + (r * 0.22) + '" fill="#e58fa3"/>';
    for (let k = 0; k < 5; k++) {
      const a = (k * 72 + 36) * Math.PI / 180;
      s += '<circle cx="' + (Math.cos(a) * r * 0.36).toFixed(1) + '" cy="' + (Math.sin(a) * r * 0.36).toFixed(1) + '" r="1.3" fill="#c9617f"/>';
    }
    return s + '</g>';
  }

  function bud(x, y, rot) {
    return '<g transform="translate(' + x + ' ' + y + ') rotate(' + rot + ')">' +
      '<path d="M0 0 C -5 -4, -4 -12, 0 -14 C 4 -12, 5 -4, 0 0 Z" fill="#f2a9be"/>' +
      '<path d="M0 0 C -3 2, -3 5, 0 6 C 3 5, 3 2, 0 0 Z" fill="#b9cf9a"/></g>';
  }

  // Cành anh đào (góc trên trái); góc dưới phải dùng cùng hình, xoay 180°.
  function branch() {
    let s = '';
    s += '<path d="M-6 6 C 40 30, 86 52, 130 96 S 190 150, 214 176" fill="none" stroke="#9a6b78" stroke-width="4" stroke-linecap="round"/>';
    s += '<path d="M70 48 C 84 30, 100 22, 122 18" fill="none" stroke="#9a6b78" stroke-width="2.6" stroke-linecap="round"/>';
    s += '<path d="M128 94 C 148 86, 164 72, 176 54" fill="none" stroke="#9a6b78" stroke-width="2.2" stroke-linecap="round"/>';
    s += '<path d="M40 30 C 34 50, 36 66, 44 80" fill="none" stroke="#9a6b78" stroke-width="2" stroke-linecap="round"/>';
    // lá non
    [[100, 70, 40], [160, 128, 70], [58, 40, -20]].forEach(([x, y, r]) => {
      s += '<ellipse cx="' + x + '" cy="' + y + '" rx="9" ry="4" transform="rotate(' + r + ' ' + x + ' ' + y + ')" fill="#c5d9a8"/>';
    });
    s += blossom(122, 18, 15, 10) + blossom(176, 52, 13, -20, true) + blossom(44, 84, 14, 30) +
      blossom(92, 58, 11, 0, true) + blossom(150, 112, 16, 15) + blossom(208, 170, 12, -10, true);
    s += bud(30, 22, -30) + bud(138, 80, 40) + bud(196, 150, 20) + bud(70, 40, -60);
    // vài cánh hoa rơi
    [[60, 128, 20], [100, 150, -30], [196, 96, 50]].forEach(([x, y, r]) => {
      s += '<path d="M0 0 C -4 -3, -4 -9, 0 -10 C 4 -9, 4 -3, 0 0 Z" transform="translate(' + x + ' ' + y + ') rotate(' + r + ')" fill="#f8c9d7" opacity="0.85"/>';
    });
    return '<svg viewBox="-10 0 230 190" class="decor__sprig-svg" focusable="false">' + s + '</svg>';
  }

  function build() {
    const root = document.createElement('div');
    root.className = 'decor';
    root.setAttribute('aria-hidden', 'true');

    // Quầng màu nền theo chủ đề (nằm dưới cùng)
    Object.keys(WASHES).forEach((theme) => {
      const wash = document.createElement('div');
      wash.className = 'decor__wash';
      wash.dataset.theme = theme;
      wash.style.background = WASHES[theme].map(([c, x, y, r]) =>
        'radial-gradient(circle ' + r + 'vw at ' + x + '% ' + y + '%, ' + c + ', transparent 70%)').join(', ');
      root.append(wash);
    });

    const tl = document.createElement('div');
    tl.className = 'decor__sprig decor__sprig--tl';
    tl.innerHTML = branch();
    const br = document.createElement('div');
    br.className = 'decor__sprig decor__sprig--br';
    br.innerHTML = branch();
    root.append(tl, br);
    return root;
  }

  function themeFor(id, params) {
    if (id === 'chapter' && params && WASHES[params.chapter]) return params.chapter;
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

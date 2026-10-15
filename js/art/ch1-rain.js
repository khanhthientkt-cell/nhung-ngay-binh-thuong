/*
 * ch1-rain.js — Minh họa Chương 1: con phố Đà Lạt trong mưa.
 *
 * Một SVG duy nhất: nền (đồi thông mờ sương, phố ướt, cột đèn) dùng chung, các lớp [data-layer]
 * được bật/tắt theo nhịp truyện (xem js/screens/chapter.js). Mưa là lớp hoa văn trượt dọc bằng CSS.
 *
 * TRANH TĨNH VẬT — không vẽ người (theo lựa chọn của anh). CHỈ minh họa những gì đã được kể:
 *   - em, chị Liên và anh Tâm đi dưới mưa → ba hàng dấu chân gợn nước trên mặt đường ướt;
 *   - anh quay lại lấy ô rồi chạy trở ra → chiếc ô của anh lướt qua màn mưa về phía mọi người.
 * KHÔNG vẽ: ngôi nhà / mái hiên, ô của em và chị Liên, cảnh che ô chung.
 *
 * Lớp:
 *   road   — con phố mưa, chưa có ai (lời dẫn mở đầu)
 *   walk   — ba hàng dấu chân trên mặt đường ướt
 *   run    — nhấn giữ: chiếc ô lao vào từ bên trái theo độ giữ (--hold)
 *   return — chiếc ô mở lướt về phía những hàng dấu chân
 *   quiet  — con phố vắng, mưa nhẹ (đoạn suy ngẫm cuối)
 */
window.NNBT = window.NNBT || {};

(function (NNBT) {
  'use strict';

  // Hàng thông Đà Lạt: mỗi cây 3 tầng tán, cao thấp ngẫu nhiên (cố định theo seed), tô cùng một màu cho mỗi lớp xa/gần.
  function pineTree(x, base, h) {
    const w = h * 0.36;
    const p = (dx, dy) => (x + dx * w).toFixed(1) + ' ' + (base - dy * h).toFixed(1);
    return '<path d="M' + p(0, 1) + ' L' + p(-0.42, 0.68) + ' L' + p(-0.22, 0.68) + ' L' + p(-0.72, 0.36) + ' L' + p(-0.46, 0.36) +
      ' L' + p(-1, 0.04) + ' L' + p(-0.08, 0.04) + ' L' + p(-0.08, -0.06) + ' L' + p(0.08, -0.06) + ' L' + p(0.08, 0.04) + ' L' + p(1, 0.04) +
      ' L' + p(0.46, 0.36) + ' L' + p(0.72, 0.36) + ' L' + p(0.22, 0.68) + ' L' + p(0.42, 0.68) + ' Z"/>';
  }
  function pines(baseY, from, to, step, minH, maxH, fill, opacity, seed) {
    let out = '';
    let k = seed;
    for (let x = from; x <= to; x += step) {
      k = (k * 9301 + 49297) % 233280;
      const h = minH + (k / 233280) * (maxH - minH);
      out += pineTree(x + ((k % 7) - 3), baseY + (k % 5), h);
    }
    return '<g fill="' + fill + '" opacity="' + opacity + '">' + out + '</g>';
  }
  const ANH_UMBRELLA = '#6a6fa0';

  // Ba hàng dấu chân trên mặt đường ướt, nhỏ dần về phía xa, gợn nước lan ở những bước mới nhất.
  function footprints() {
    let s = '<g fill="#5e5270">';
    const trails = [[34, 296, 318, 252], [30, 284, 300, 247], [44, 274, 284, 243]];
    const rings = [];
    trails.forEach(([x0, y0, x1, y1], t) => {
      const n = 9;
      for (let i = 0; i < n; i++) {
        const k = i / (n - 1);
        const sc = 1 - k * 0.55;
        const side = (i % 2 ? 1 : -1) * 2.6 * sc;
        const x = x0 + (x1 - x0) * k;
        const y = y0 + (y1 - y0) * k + side;
        s += '<ellipse cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" rx="' + (5.2 * sc).toFixed(2) + '" ry="' + (2.1 * sc).toFixed(2) +
          '" transform="rotate(-8 ' + x.toFixed(1) + ' ' + y.toFixed(1) + ')" opacity="' + (0.62 - k * 0.3).toFixed(2) + '"/>';
        if (i >= n - 2) rings.push([x, y, sc, t]);
      }
    });
    s += '</g>';
    // Gợn nước lan (chuyển động nhẹ; tắt khi giảm chuyển động)
    s += '<g fill="none" stroke="#ffffff" stroke-width="0.9" opacity="0.9">';
    rings.forEach(([x, y, sc, t], i) => {
      s += '<ellipse class="art-ripple art-ripple--' + (i % 3) + '" cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" rx="' + (9 * sc).toFixed(1) + '" ry="' + (2.6 * sc).toFixed(1) + '"/>';
    });
    s += '</g>';
    // Vệt phản chiếu đèn đường kéo dài trên mặt nước
    s += '<g stroke="#ffd9a8" stroke-width="1.4" stroke-linecap="round" opacity="0.5"><path d="M352 250 h18 M346 258 h26 M350 266 h20 M344 276 h30"/></g>';
    return s;
  }

  // Chiếc ô mở, vẽ chi tiết: các múi vải xen màu, gân, bóng sáng, chóp, cán cong.
  function umbrella(cx, cy, r, tilt, color) {
    const id = 'c1-ucap-' + Math.round(cx);
    const dome = 'M' + (-r) + ' 0 C ' + (-r) + ' ' + (-0.78 * r) + ' ' + (-0.55 * r) + ' ' + (-0.98 * r) + ' 0 ' + (-0.99 * r) +
      ' C ' + (0.55 * r) + ' ' + (-0.98 * r) + ' ' + r + ' ' + (-0.78 * r) + ' ' + r + ' 0 Z';
    let s = '<g transform="translate(' + cx + ' ' + cy + ') rotate(' + tilt + ')">';
    s += '<defs><clipPath id="' + id + '"><path d="' + dome + '"/></clipPath>' +
      '<linearGradient id="' + id + '-g" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#9396c9"/><stop offset="0.55" stop-color="' + color + '"/><stop offset="1" stop-color="#474b7a"/></linearGradient></defs>';
    // cán (phần dưới vòm) và tay cầm cong
    s += '<path d="M0 -6 V' + (0.92 * r) + ' q0 ' + (0.16 * r) + ' ' + (-0.13 * r) + ' ' + (0.16 * r) + ' q' + (-0.12 * r) + ' 0 ' + (-0.12 * r) + ' ' + (-0.11 * r) + '" fill="none" stroke="#3a2e27" stroke-width="3.2" stroke-linecap="round"/>';
    // vòm ô: 4 múi xen màu, mép dưới uốn lượn
    s += '<g clip-path="url(#' + id + ')"><rect x="' + (-r - 2) + '" y="' + (-r - 2) + '" width="' + (2 * r + 4) + '" height="' + (r + 4) + '" fill="url(#' + id + '-g)"/>';
    for (let i = 0; i < 4; i++) {
      const x0 = -r + i * 0.5 * r;
      const x1 = x0 + 0.5 * r;
      s += '<path d="M0 ' + (-0.99 * r) + ' L' + x0 + ' 0 Q' + ((x0 + x1) / 2) + ' ' + (-0.13 * r) + ' ' + x1 + ' 0 Z" fill="' + (i % 2 ? '#ffffff' : '#000000') + '" opacity="' + (i % 2 ? 0.1 : 0.08) + '"/>';
    }
    s += '<path d="M' + (-0.62 * r) + ' ' + (-0.5 * r) + ' Q' + (-0.42 * r) + ' ' + (-0.86 * r) + ' ' + (-0.06 * r) + ' ' + (-0.93 * r) + '" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" opacity="0.28"/>';
    s += '</g>';
    // mép dưới uốn lượn (che phần thẳng của vòm)
    let edge = 'M' + (-r) + ' 0';
    for (let i = 0; i < 4; i++) {
      const x0 = -r + i * 0.5 * r;
      edge += ' Q' + (x0 + 0.25 * r) + ' ' + (-0.13 * r) + ' ' + (x0 + 0.5 * r) + ' 0';
    }
    s += '<path d="' + edge + ' L' + r + ' 4 L' + (-r) + ' 4 Z" fill="#c9d6d8" opacity="0.0"/>';
    s += '<path d="' + edge + '" fill="none" stroke="#3f4170" stroke-width="1.6" stroke-linejoin="round"/>';
    // gân ô
    s += '<g stroke="#3f4170" stroke-width="1" opacity="0.55" fill="none">';
    [-r, -0.5 * r, 0, 0.5 * r, r].forEach((x) => { s += '<path d="M0 ' + (-0.99 * r) + ' Q' + (x * 0.62) + ' ' + (-0.62 * r) + ' ' + x + ' 0"/>'; });
    s += '</g>';
    // chóp ô và đầu gân
    s += '<path d="M0 ' + (-0.99 * r) + ' V' + (-1.14 * r) + '" stroke="#3a2e27" stroke-width="2.4" stroke-linecap="round"/>';
    [-r, -0.5 * r, 0.5 * r, r].forEach((x) => { s += '<circle cx="' + x + '" cy="0" r="1.6" fill="#3f4170"/>'; });
    // giọt mưa nảy trên mặt ô
    s += '<g stroke="#f1f5f6" stroke-width="1.2" stroke-linecap="round" fill="none" opacity="0.9">' +
      '<path d="M' + (-0.5 * r) + ' ' + (-0.95 * r) + ' q-3 -5 -6 -2 M' + (0.2 * r) + ' ' + (-1.08 * r) + ' q2 -6 6 -3 M' + (0.62 * r) + ' ' + (-0.86 * r) + ' q4 -4 7 0"/></g>';
    s += '</g>';
    return s;
  }

  function svg(titleId) {
    return [
      '<svg class="scene-art" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid meet" role="img" aria-labelledby="' + titleId + '">',
      '<title id="' + titleId + '"></title>',
      '<defs>',
        '<linearGradient id="c1-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c9c2e2"/><stop offset="0.65" stop-color="#ead5e4"/><stop offset="1" stop-color="#f6e2e8"/></linearGradient>',
        '<linearGradient id="c1-road" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a497b4"/><stop offset="1" stop-color="#7f7393"/></linearGradient>',
        '<linearGradient id="c1-mist" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fbeff4" stop-opacity="0"/><stop offset="0.5" stop-color="#fbeff4" stop-opacity="0.75"/><stop offset="1" stop-color="#fbeff4" stop-opacity="0"/></linearGradient>',
        '<radialGradient id="c1-glow"><stop offset="0" stop-color="#ffd9a8" stop-opacity="0.75"/><stop offset="1" stop-color="#ffd9a8" stop-opacity="0"/></radialGradient>',
        '<pattern id="c1-rain" width="36" height="60" patternUnits="userSpaceOnUse">',
          '<path d="M6 4 l-2 11 M22 32 l-2 11 M31 14 l-2 11 M14 46 l-2 11" stroke="#f1f5f6" stroke-width="1" stroke-linecap="round" opacity="0.55"/>',
        '</pattern>',
        '<pattern id="c1-rain-far" width="24" height="40" patternUnits="userSpaceOnUse">',
          '<path d="M4 3 l-1 7 M15 22 l-1 7 M20 8 l-1 7" stroke="#f1f5f6" stroke-width="0.7" stroke-linecap="round" opacity="0.6"/>',
        '</pattern>',
      '</defs>',

      // Bầu trời chiều mưa tím hồng, đồi thông nhiều lớp mờ sương
      '<rect width="400" height="300" fill="url(#c1-sky)"/>',
      '<path d="M0 118 C 60 96, 120 104, 180 112 S 300 92, 400 100 V230 H0 Z" fill="#cfc3df"/>',
      pines(118, 6, 396, 11, 14, 24, '#b9acd2', 1, 7),
      '<rect x="0" y="100" width="400" height="40" fill="url(#c1-mist)"/>',
      '<path d="M0 146 C 80 126, 170 140, 240 134 S 350 124, 400 132 V230 H0 Z" fill="#b3a5ca"/>',
      pines(150, 2, 398, 17, 26, 40, '#9a8bb8', 1, 3),
      '<rect x="0" y="138" width="400" height="44" fill="url(#c1-mist)" opacity="0.8"/>',
      '<path d="M0 182 C 90 168, 200 180, 280 174 S 370 168, 400 172 V230 H0 Z" fill="#a596bf"/>',
      pines(186, 10, 396, 31, 34, 50, '#8a7aa9', 1, 11),

      // Vỉa hè, mặt đường ướt, vũng nước phản chiếu
      '<rect x="0" y="226" width="400" height="13" fill="#e8d5df"/>',
      '<path d="M0 239 H400" stroke="#c9b2c2" stroke-width="1.5"/>',
      '<rect x="0" y="240" width="400" height="60" fill="url(#c1-road)"/>',
      '<g opacity="0.45" stroke="#f3e6f0" stroke-width="1.2" stroke-linecap="round">',
        '<path d="M20 258 H70 M110 276 H170 M200 262 H240 M250 288 H330 M60 292 H100"/>',
      '</g>',
      '<ellipse cx="150" cy="272" rx="46" ry="5" fill="#c9bed8" opacity="0.6"/>',
      '<ellipse cx="362" cy="266" rx="8" ry="26" fill="#ffd9a8" opacity="0.4" filter="url(#wc-wash)"/>',

      // Cột đèn
      '<circle cx="362" cy="128" r="54" fill="url(#c1-glow)"/>',
      '<path d="M362 120 V233" stroke="#5b4d66" stroke-width="3"/>',
      '<path d="M362 233 h-5 a5 2 0 0 0 10 0 z" fill="#5b4d66"/>',
      '<path d="M354 118 h16 l-3 7 h-10z" fill="#5b4d66"/>',
      '<circle cx="362" cy="127" r="3.5" fill="#fff0d6"/>',
      // walk + return: ba hàng dấu chân gợn nước trên mặt đường ướt — ba người vừa đi qua dưới mưa
      '<g data-layer="walk return run" class="scene-layer">', footprints(), '</g>',

      // return: chiếc ô của anh lướt qua màn mưa về phía mọi người (không vẽ người)
      '<g data-layer="return run" class="scene-layer"><g class="hold-fly">',
        '<ellipse cx="168" cy="268" rx="46" ry="5" fill="#5e5270" opacity="0.25" filter="url(#wc-wash)"/>',
        '<g stroke="#eef3f5" stroke-width="1.6" stroke-linecap="round" fill="none" opacity="0.75">',
          '<path d="M66 166 q24 -6 40 0 M56 188 q28 -5 48 2 M72 208 q20 -4 34 1"/>',
        '</g>',
        '<g stroke="#dfe9ec" stroke-width="1.4" stroke-linecap="round" fill="none" opacity="0.85">',
          '<path d="M150 262 q-6 -9 -12 -4 M158 264 q0 -10 -6 -12 M178 263 q6 -9 12 -4 M170 265 q2 -9 8 -10"/>',
        '</g>',
        umbrella(170, 168, 60, -14, ANH_UMBRELLA),
      '</g></g>',

      // Mưa (hai lớp, trượt dọc liền mạch theo chiều cao hoa văn). Lớp "quiet" chỉ để mưa xa.
      '<g class="rain" aria-hidden="true">',
        '<rect class="rain-sheet rain-sheet--far" x="-10" y="-40" width="420" height="380" fill="url(#c1-rain-far)"/>',
        '<g data-layer="road walk return run" class="scene-layer">',
          '<rect class="rain-sheet rain-sheet--near" x="-10" y="-60" width="420" height="400" fill="url(#c1-rain)"/>',
        '</g>',
      '</g>',
      '</svg>'
    ].join('');
  }

  NNBT.art = NNBT.art || {};
  NNBT.art.ch1 = { svg };
})(window.NNBT);

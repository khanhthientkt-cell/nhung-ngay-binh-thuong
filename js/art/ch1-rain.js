/*
 * ch1-rain.js — Minh họa Chương 1: con phố Đà Lạt trong mưa.
 *
 * Một SVG duy nhất: nền (đồi thông mờ sương, phố ướt, cột đèn) dùng chung, các lớp [data-layer]
 * được bật/tắt theo nhịp truyện (xem js/screens/chapter.js). Mưa là lớp hoa văn trượt dọc bằng CSS.
 *
 * CHỈ minh họa những gì đã được kể (bản duyệt sau Bước 3A):
 *   - em, chị Liên và anh Tâm đi dưới mưa (nhìn từ phía sau, dáng đi bình thường, không thêm ô hay động tác);
 *   - anh quay lại lấy ô rồi chạy trở ra (anh cầm ô chạy về phía mọi người).
 * KHÔNG vẽ: ngôi nhà / mái hiên, ô của em và chị Liên, cảnh che ô chung.
 * Nhân vật giản dị, không vẽ khuôn mặt.
 *
 * Lớp:
 *   road   — con phố mưa, chưa có ai (lời dẫn mở đầu)
 *   walk   — ba người đi dưới mưa; anh đứng ở bên trái nhìn theo
 *   return — anh cầm ô chạy ra về phía mọi người
 *   quiet  — con phố vắng, mưa nhẹ (đoạn suy ngẫm cuối)
 */
window.NNBT = window.NNBT || {};

(function (NNBT) {
  'use strict';

  const INK = '#3c3a39';

  // Một người, gốc tọa độ ở chân (0,0), cao ~75 đơn vị. Nhìn nghiêng hoặc từ phía sau, không có mặt.
  function person(o) {
    const coat = o.coat;
    const dark = o.dark || coat;
    const hair = o.hair || '#2f2a28';
    const stroke = 'fill="none" stroke-linecap="round" stroke-linejoin="round"';
    let s = '';

    // Chân
    if (o.pose === 'run') {
      s += '<path d="M-2 -28 L-12 -5 M3 -28 L9 -13 L14 -10" stroke="' + INK + '" stroke-width="3.2" ' + stroke + '/>';
      s += '<path d="M-17 -1 q-4 -5 -8 -1 M18 -6 q4 -5 8 -1" stroke="#e4ecee" stroke-width="1.3" ' + stroke + '/>';
    } else if (o.pose === 'stand') {
      s += '<path d="M-3 -28 L-3.5 0 M3 -28 L3.5 0" stroke="' + INK + '" stroke-width="3.2" ' + stroke + '/>';
    } else {
      s += '<path d="M-3 -28 L-7 0 M3 -28 L6 -1" stroke="' + INK + '" stroke-width="3.2" ' + stroke + '/>';
    }

    // Áo khoác
    s += '<path d="M-8 -58 Q-11 -42 -10.5 -26 L10.5 -26 Q11 -42 8 -58 Q0 -62 -8 -58Z" fill="' + coat + '"/>';

    // Tay
    if (o.umbrella) {
      s += '<path d="M-7 -55 L-12 -42 M7 -55 Q11 -50 5 -48" stroke="' + dark + '" stroke-width="3.2" ' + stroke + '/>';
    } else {
      s += '<path d="M-7 -55 L-9 -38 M7 -55 L9 -38" stroke="' + dark + '" stroke-width="3.2" ' + stroke + '/>';
    }

    // Đầu và tóc
    s += '<circle cx="0" cy="-66" r="6.5" fill="' + hair + '"/>';
    if (o.hairStyle === 'long') s += '<path d="M-6.5 -67 Q-8 -55 -4.5 -50 L4.5 -50 Q8 -55 6.5 -67Z" fill="' + hair + '"/>';
    if (o.hairStyle === 'tied') s += '<circle cx="-7" cy="-68" r="3" fill="' + hair + '"/>';

    // Ô (chỉ có ở nhân vật anh, sau khi quay lại lấy ô)
    if (o.umbrella) {
      const cx = 5;
      s += '<path d="M5 -48 L' + cx + ' -91" stroke="#4a3f38" stroke-width="1.4" fill="none"/>';
      s += '<path d="M' + (cx - 25) + ' -88 Q' + cx + ' -117 ' + (cx + 25) + ' -88' +
        ' Q' + (cx + 19) + ' -91.5 ' + (cx + 12.5) + ' -88 Q' + (cx + 6) + ' -91.5 ' + cx + ' -88' +
        ' Q' + (cx - 6) + ' -91.5 ' + (cx - 12.5) + ' -88 Q' + (cx - 19) + ' -91.5 ' + (cx - 25) + ' -88Z"' +
        ' fill="' + o.umbrella + '" opacity="0.94" filter="url(#wc-line)"/>';
      s += '<path d="M' + cx + ' -103 L' + cx + ' -88 M' + (cx - 12) + ' -98 L' + (cx - 12.5) + ' -88 M' + (cx + 12) + ' -98 L' + (cx + 12.5) + ' -88"' +
        ' stroke="rgba(255,255,255,0.25)" stroke-width="0.8" fill="none"/>';
    }

    const tf = 'translate(' + o.x + ' ' + o.y + ')' + (o.lean ? ' rotate(' + o.lean + ')' : '') + ' scale(' + (o.s || 1) + ')';
    return '<g transform="' + tf + '">' + s + '</g>';
  }

  function pines(baseY, from, to, step, minH, maxH, fill, opacity, seed) {
    let out = '';
    let k = seed;
    for (let x = from; x <= to; x += step) {
      k = (k * 9301 + 49297) % 233280;
      const h = minH + (k / 233280) * (maxH - minH);
      const w = h * 0.3;
      out += '<path d="M' + x + ' ' + (baseY - h).toFixed(1) + ' L' + (x - w).toFixed(1) + ' ' + baseY + ' L' + (x + w).toFixed(1) + ' ' + baseY + 'Z"/>';
    }
    return '<g fill="' + fill + '" opacity="' + opacity + '">' + out + '</g>';
  }

  // Nhân vật
  const ANH = { coat: '#4f5d6e', dark: '#3e4a58', hair: '#26221f' };
  const EM = { coat: '#c4876a', dark: '#a56d54', hairStyle: 'long' };
  const LIEN = { coat: '#8a9a84', dark: '#6e7d69', hairStyle: 'tied' };
  const TAM = { coat: '#7b8796', dark: '#616c7a' };
  const ANH_UMBRELLA = '#4f6f7f';

  function a(base, extra) { return Object.assign({}, base, extra); }

  function svg(titleId) {
    return [
      '<svg class="scene-art" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid meet" role="img" aria-labelledby="' + titleId + '">',
      '<title id="' + titleId + '"></title>',
      '<defs>',
        '<linearGradient id="c1-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b9c8cc"/><stop offset="1" stop-color="#dfe3dc"/></linearGradient>',
        '<linearGradient id="c1-road" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8b9497"/><stop offset="1" stop-color="#6f787c"/></linearGradient>',
        '<radialGradient id="c1-glow"><stop offset="0" stop-color="#ffdc94" stop-opacity="0.6"/><stop offset="1" stop-color="#ffdc94" stop-opacity="0"/></radialGradient>',
        '<pattern id="c1-rain" width="36" height="60" patternUnits="userSpaceOnUse">',
          '<path d="M6 4 l-2 11 M22 32 l-2 11 M31 14 l-2 11 M14 46 l-2 11" stroke="#f1f5f6" stroke-width="1" stroke-linecap="round" opacity="0.55"/>',
        '</pattern>',
        '<pattern id="c1-rain-far" width="24" height="40" patternUnits="userSpaceOnUse">',
          '<path d="M4 3 l-1 7 M15 22 l-1 7 M20 8 l-1 7" stroke="#f1f5f6" stroke-width="0.7" stroke-linecap="round" opacity="0.6"/>',
        '</pattern>',
      '</defs>',

      // Bầu trời, đồi, thông mờ sương
      '<rect width="400" height="300" fill="url(#c1-sky)"/>',
      '<g filter="url(#wc-wash)">',
        '<path d="M0 132 Q70 98 140 120 T270 108 T400 104 V230 H0Z" fill="#a8bab6" opacity="0.55"/>',
        '<path d="M0 160 Q90 128 180 152 T340 140 T400 150 V230 H0Z" fill="#8ea59f" opacity="0.5"/>',
      '</g>',
      pines(124, 8, 392, 13, 12, 22, '#7d968f', 0.5, 7),
      pines(156, 4, 396, 21, 24, 36, '#66807a', 0.55, 3),

      // Vỉa hè, mặt đường ướt, vũng nước
      '<rect x="0" y="228" width="400" height="11" fill="#b6b1a5"/>',
      '<path d="M0 239 H400" stroke="#97938a" stroke-width="1.5"/>',
      '<rect x="0" y="239" width="400" height="61" fill="url(#c1-road)"/>',
      '<g opacity="0.4" stroke="#cdd6d8" stroke-width="1.2" stroke-linecap="round">',
        '<path d="M20 258 H70 M110 276 H170 M200 262 H240 M250 288 H330 M60 292 H100"/>',
      '</g>',
      '<ellipse cx="150" cy="272" rx="44" ry="5" fill="#a8b6ba" opacity="0.55"/>',
      '<ellipse cx="362" cy="266" rx="7" ry="24" fill="#ffd98a" opacity="0.32" filter="url(#wc-wash)"/>',

      // Cột đèn
      '<circle cx="362" cy="128" r="48" fill="url(#c1-glow)"/>',
      '<path d="M362 120 V233" stroke="#4d5154" stroke-width="3"/>',
      '<path d="M354 118 h16 l-3 7 h-10z" fill="#4d5154"/>',
      '<circle cx="362" cy="127" r="3.5" fill="#ffe4a8"/>',

      // walk: ba người đi dưới mưa (nhìn từ phía sau); anh đứng bên trái nhìn theo
      '<g data-layer="walk" class="scene-layer">',
        person(a(ANH, { x: 74, y: 236, s: 0.95, pose: 'stand' })),
        person(a(EM, { x: 222, y: 246, s: 0.84 })),
        person(a(LIEN, { x: 252, y: 246, s: 0.84 })),
        person(a(TAM, { x: 284, y: 247, s: 0.86 })),
      '</g>',

      // return: anh cầm ô chạy ra về phía mọi người
      '<g data-layer="return" class="scene-layer">',
        person(a(ANH, { x: 150, y: 250, s: 0.95, pose: 'run', lean: 8, umbrella: ANH_UMBRELLA })),
        person(a(EM, { x: 250, y: 246, s: 0.82 })),
        person(a(LIEN, { x: 280, y: 246, s: 0.82 })),
        person(a(TAM, { x: 312, y: 247, s: 0.84 })),
      '</g>',

      // Mưa (hai lớp, trượt dọc liền mạch theo chiều cao hoa văn). Lớp "quiet" chỉ để mưa xa.
      '<g class="rain" aria-hidden="true">',
        '<rect class="rain-sheet rain-sheet--far" x="-10" y="-40" width="420" height="380" fill="url(#c1-rain-far)"/>',
        '<g data-layer="road walk return" class="scene-layer">',
          '<rect class="rain-sheet rain-sheet--near" x="-10" y="-60" width="420" height="400" fill="url(#c1-rain)"/>',
        '</g>',
      '</g>',
      '</svg>'
    ].join('');
  }

  NNBT.art = NNBT.art || {};
  NNBT.art.ch1 = { svg };
})(window.NNBT);

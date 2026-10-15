/*
 * ch3-home.js — Minh họa Chương 3: Nơi anh được làm một đứa trẻ.
 *
 * Phòng khách buổi tối, tông ấm. Mỗi lớp [data-layer] là một nhịp truyện.
 * TRANH TĨNH VẬT — không vẽ người (theo lựa chọn của anh): hai chiếc áo len thay cho hai người.
 * CHỈ minh họa các ý trong bản mô tả, không thêm sự kiện; không viết lời bài hát.
 *
 *   grownup — phòng vắng, chiếc áo khoác và túi đồ đi làm treo trên móc cạnh cửa
 *             (hình ảnh ẩn dụ cho việc "không cần lúc nào cũng tỏ ra người lớn")
 *   hug     — trên sofa: chiếc áo len nâu đỏ (vợ) vòng hai tay áo ôm lấy chiếc áo len xanh than tròn bụng (anh);
 *             chạm để xoa bụng: áo rung rinh, nảy thêm trái tim
 *   song    — hai chiếc áo len ngồi cạnh nhau, nốt nhạc bay lên; chạm để "cắn": thêm dấu trái tim trên áo anh
 *   child   — góc sofa ấm: hai chiếc gối tựa vào nhau, tấm chăn mỏng (nhịp này hiện ảnh thật)
 *   miss    — sofa trống, ánh xanh dịu, vài nốt nhạc mờ (khoảng cách)
 *
 * Màu áo giữ như các chương trước: anh xanh than, vợ nâu đỏ nhạt.
 */
window.NNBT = window.NNBT || {};

(function (NNBT) {
  'use strict';

  const ANH = { coat: '#4f5d6e', dark: '#3e4a58', light: '#6d7c8e' };
  const EM = { coat: '#c4876a', dark: '#a56d54', light: '#d9a48a' };

  // Nốt nhạc nhỏ (vẽ, không phải chữ)
  function note(x, y, sc, cls) {
    return '<g class="' + (cls || '') + '" transform="translate(' + x + ' ' + y + ') scale(' + sc + ')">' +
      '<path d="M0 0 V-14 L9 -16 V-3" stroke="#9c4f2d" stroke-width="1.6" fill="none" stroke-linecap="round"/>' +
      '<ellipse cx="-2" cy="0.5" rx="3" ry="2.3" fill="#9c4f2d"/><ellipse cx="7" cy="-2.5" rx="3" ry="2.3" fill="#9c4f2d"/></g>';
  }

  function heart(x, y, sc, color, cls) {
    return '<path class="' + (cls || '') + '" transform="translate(' + x + ' ' + y + ') scale(' + sc + ')" d="M0 3 C -6 -2, -6 -8, -2.5 -8 C -1 -8, 0 -7, 0 -6 C 0 -7, 1 -8, 2.5 -8 C 6 -8, 6 -2, 0 3 Z" fill="' + color + '"/>';
  }

  // Dấu "cắn" hình trái tim, viền chấm như dấu răng; hiện khi đã chạm đủ `k` lần.
  function biteMark(x, y, rot, k) {
    // data-tap-show nằm ở nhóm trong (không có transform) để hoạt ảnh "nảy" không đè vị trí.
    return '<g transform="translate(' + x + ' ' + y + ') rotate(' + rot + ')"><g data-tap-show="' + k + '">' +
      '<path d="M0 6 C -9 0, -8 -7, -3.5 -7 C -1.5 -7, 0 -5.5, 0 -4.5 C 0 -5.5, 1.5 -7, 3.5 -7 C 8 -7, 9 0, 0 6 Z" fill="#e58b80" opacity="0.85"/>' +
      '<path d="M0 6 C -9 0, -8 -7, -3.5 -7 C -1.5 -7, 0 -5.5, 0 -4.5 C 0 -5.5, 1.5 -7, 3.5 -7 C 8 -7, 9 0, 0 6 Z" fill="none" stroke="#c4625a" stroke-width="1" stroke-dasharray="1.2 1.4"/>' +
      '</g></g>';
  }

  // Áo len nhìn chính diện, gốc ở giữa gấu áo. round: thân tròn ở bụng. sleeves: vẽ hai tay áo buông xuôi.
  function sweater(x, y, c, o) {
    o = o || {};
    const s = o.s || 1;
    const body = o.round
      ? 'M-24 -62 Q-36 -40 -34 -18 Q-33 -4 -26 0 L26 0 Q33 -4 34 -18 Q36 -40 24 -62 Q0 -68 -24 -62 Z'
      : 'M-22 -62 Q-28 -36 -25 0 L25 0 Q28 -36 22 -62 Q0 -68 -22 -62 Z';
    let g = '';
    if (o.sleeves !== false) {
      const w = o.round ? 36 : 28;
      g += '<path d="M-' + (w - 14) + ' -60 Q-' + (w + 6) + ' -50 -' + (w + 4) + ' -16" stroke="' + c.dark + '" stroke-width="13" fill="none" stroke-linecap="round"/>';
      g += '<path d="M' + (w - 14) + ' -60 Q' + (w + 6) + ' -50 ' + (w + 4) + ' -16" stroke="' + c.dark + '" stroke-width="13" fill="none" stroke-linecap="round"/>';
      g += '<path d="M-' + (w - 14) + ' -60 Q-' + (w + 6) + ' -50 -' + (w + 4) + ' -18" stroke="' + c.coat + '" stroke-width="10.5" fill="none" stroke-linecap="round"/>';
      g += '<path d="M' + (w - 14) + ' -60 Q' + (w + 6) + ' -50 ' + (w + 4) + ' -18" stroke="' + c.coat + '" stroke-width="10.5" fill="none" stroke-linecap="round"/>';
      g += '<path d="M-' + (w + 9) + ' -16 h10 M' + (w - 1) + ' -16 h10" stroke="' + c.dark + '" stroke-width="5" stroke-linecap="round"/>';
    }
    g += '<path d="' + body + '" fill="' + c.coat + '"/>';
    // vân len: vài đường dọc mờ
    g += '<g stroke="' + c.dark + '" stroke-width="1" opacity="0.35" fill="none">' +
      '<path d="M-12 -58 Q-14 -30 -12 -6"/><path d="M0 -60 V-6"/><path d="M12 -58 Q14 -30 12 -6"/></g>';
    if (o.round) g += '<path d="M-26 -30 Q0 -18 26 -30" stroke="' + c.light + '" stroke-width="2" fill="none" opacity="0.5"/>';
    // cổ áo và gấu áo bo len
    g += '<path d="M-11 -63 Q0 -55 11 -63" stroke="' + c.dark + '" stroke-width="4.5" fill="none" stroke-linecap="round"/>';
    g += '<rect x="' + (o.round ? -27 : -25) + '" y="-7" width="' + (o.round ? 54 : 50) + '" height="7" rx="3" fill="' + c.dark + '"/>';
    g += '<g stroke="' + c.coat + '" stroke-width="1" opacity="0.6">';
    for (let i = -22; i <= 22; i += 5) g += '<path d="M' + i + ' -6 V-1"/>';
    g += '</g>';
    return '<g transform="translate(' + x + ' ' + y + ') rotate(' + (o.rot || 0) + ') scale(' + s + ')">' + g + '</g>';
  }

  // Tay áo len ôm vòng (vẽ đè lên áo của anh), kết thúc bằng bo tay áo
  function hugSleeve(d, end, angle) {
    return '<path d="' + d + '" stroke="' + EM.dark + '" stroke-width="13" fill="none" stroke-linecap="round"/>' +
      '<path d="' + d + '" stroke="' + EM.coat + '" stroke-width="10.5" fill="none" stroke-linecap="round"/>' +
      '<rect x="-4" y="-6.5" width="8" height="13" rx="3" fill="' + EM.dark + '" transform="translate(' + end[0] + ' ' + end[1] + ') rotate(' + angle + ')"/>';
  }

  function room() {
    return [
      '<rect width="400" height="300" fill="url(#c3-wall)"/>',
      // giấy dán tường chấm nhỏ
      '<g fill="#e9b7c6" opacity="0.35">',
        '<circle cx="30" cy="30" r="1.6"/><circle cx="70" cy="60" r="1.6"/><circle cx="110" cy="28" r="1.6"/><circle cx="290" cy="34" r="1.6"/>',
        '<circle cx="330" cy="70" r="1.6"/><circle cx="370" cy="30" r="1.6"/><circle cx="50" cy="110" r="1.6"/><circle cx="360" cy="140" r="1.6"/>',
      '</g>',
      // cửa sổ lúc chạng vạng
      '<rect x="150" y="34" width="100" height="98" rx="3" fill="url(#c3-dusk)"/>',
      '<circle cx="226" cy="58" r="7" fill="#fff0e6" opacity="0.8"/>',
      '<path d="M200 34 V132 M150 83 H250" stroke="#fbe9ef" stroke-width="4"/>',
      '<rect x="150" y="34" width="100" height="98" rx="3" fill="none" stroke="#fff3f6" stroke-width="5"/>',
      '<path d="M142 134 H258" stroke="#ecc3cf" stroke-width="5" stroke-linecap="round"/>',
      // khung tranh nhỏ trên tường
      '<rect x="40" y="56" width="40" height="32" rx="2" fill="#fff3f6" stroke="#d39bab" stroke-width="3"/>',
      '<path d="M46 82 L58 68 L66 76 L72 70 L76 82 Z" fill="#a9bd8d"/>',
      // đèn cây bên phải
      '<circle cx="342" cy="120" r="78" fill="url(#c3-lamp)"/>',
      '<path d="M342 128 V252" stroke="#8a6676" stroke-width="3"/><path d="M330 254 h24" stroke="#8a6676" stroke-width="4" stroke-linecap="round"/>',
      '<path d="M326 128 h32 l-6 -24 h-20 z" fill="#fbe3c4" stroke="#e2b48a" stroke-width="1.5"/>',
      // chậu cây bên trái
      '<path d="M30 252 l4 -26 h28 l4 26 z" fill="#e58fa3"/>',
      '<g fill="#8fa77c"><ellipse cx="40" cy="206" rx="7" ry="20" transform="rotate(-20 40 206)"/><ellipse cx="56" cy="204" rx="7" ry="22" transform="rotate(18 56 204)"/><ellipse cx="48" cy="198" rx="6" ry="24"/></g>',
      // sàn + thảm
      '<rect x="0" y="236" width="400" height="64" fill="url(#c3-floor)"/>',
      '<path d="M0 237 H400" stroke="#ecc3b8" stroke-width="3"/>',
      '<ellipse cx="200" cy="272" rx="140" ry="18" fill="#f6dbe3" opacity="0.7"/>',
      '<ellipse cx="200" cy="272" rx="124" ry="13" fill="none" stroke="#e58fa3" stroke-width="2" opacity="0.4" stroke-dasharray="4 5"/>'
    ].join('');
  }

  // Sofa nhìn chính diện
  function sofa() {
    return [
      '<ellipse cx="200" cy="250" rx="122" ry="7" fill="#7a4f63" opacity="0.2"/>',
      '<path d="M112 240 v10 M288 240 v10" stroke="#8a6676" stroke-width="5" stroke-linecap="round"/>',
      '<rect x="102" y="146" width="196" height="70" rx="20" fill="#7f927e"/>',
      '<rect x="112" y="152" width="86" height="58" rx="15" fill="#97ab95"/>',
      '<rect x="202" y="152" width="86" height="58" rx="15" fill="#97ab95"/>',
      '<path d="M124 160 Q155 155 186 160 M214 160 Q245 155 276 160" stroke="#b3c4b0" stroke-width="2.5" fill="none" stroke-linecap="round" opacity="0.8"/>',
      '<rect x="98" y="204" width="204" height="38" rx="11" fill="#879a85"/>',
      '<path d="M200 206 V240" stroke="#71846f" stroke-width="1.5"/>',
      '<path d="M108 208 H292" stroke="#a3b6a0" stroke-width="2.5" stroke-linecap="round" opacity="0.8"/>',
      '<rect x="80" y="178" width="34" height="66" rx="15" fill="#7a8d79"/><path d="M86 184 Q97 179 108 184" stroke="#a3b6a0" stroke-width="2.5" fill="none" stroke-linecap="round"/>',
      '<rect x="286" y="178" width="34" height="66" rx="15" fill="#7a8d79"/><path d="M292 184 Q303 179 314 184" stroke="#a3b6a0" stroke-width="2.5" fill="none" stroke-linecap="round"/>'
    ].join('');
  }

  function cushion(x, y, rot, fill, line) {
    return '<g transform="translate(' + x + ' ' + y + ') rotate(' + rot + ')">' +
      '<path d="M-20 -18 Q0 -23 20 -18 Q25 0 20 18 Q0 23 -20 18 Q-25 0 -20 -18 Z" fill="' + fill + '"/>' +
      '<path d="M-14 -12 L14 12 M14 -12 L-14 12" stroke="' + line + '" stroke-width="1.6" opacity="0.6"/>' +
      '<circle r="2.4" fill="' + line + '"/></g>';
  }

  function svg(titleId) {
    return [
      '<svg class="scene-art" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid meet" role="img" aria-labelledby="' + titleId + '">',
      '<title id="' + titleId + '"></title>',
      '<defs>',
        '<linearGradient id="c3-wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fbe6ec"/><stop offset="1" stop-color="#f2d0db"/></linearGradient>',
        '<linearGradient id="c3-dusk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6c2cf"/><stop offset="1" stop-color="#c3b5dd"/></linearGradient>',
        '<linearGradient id="c3-floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e2b3a6"/><stop offset="1" stop-color="#c99086"/></linearGradient>',
        '<radialGradient id="c3-lamp"><stop offset="0" stop-color="#ffdf9e" stop-opacity="0.7"/><stop offset="1" stop-color="#ffdf9e" stop-opacity="0"/></radialGradient>',
      '</defs>',
      room(),

      // grownup: áo khoác và túi treo trên móc cạnh cửa
      '<g data-layer="grownup" class="scene-layer">',
        '<rect x="84" y="70" width="64" height="168" rx="2" fill="#e2b9b0"/><rect x="90" y="76" width="52" height="162" fill="#ecc9c0"/>',
        '<rect x="97" y="90" width="38" height="56" rx="2" fill="none" stroke="#d39bab" stroke-width="2"/><rect x="97" y="160" width="38" height="64" rx="2" fill="none" stroke="#d39bab" stroke-width="2"/>',
        '<circle cx="136" cy="160" r="3" fill="#fbe3c4"/>',
        '<path d="M262 92 h56" stroke="#9a6b78" stroke-width="4" stroke-linecap="round"/>',
        '<circle cx="274" cy="96" r="2.5" fill="#9a6b78"/><circle cx="304" cy="96" r="2.5" fill="#9a6b78"/>',
        // áo khoác xanh than
        '<path d="M274 98 L258 112 L260 176 L288 176 L286 112 Z" fill="' + ANH.coat + '" filter="url(#wc-line)"/>',
        '<path d="M274 98 L262 112 M274 98 L284 112" stroke="#3e4a58" stroke-width="1.5" fill="none"/>',
        '<path d="M274 104 L274 170" stroke="#3e4a58" stroke-width="1.5"/>',
        '<circle cx="277" cy="124" r="1.6" fill="#3e4a58"/><circle cx="277" cy="140" r="1.6" fill="#3e4a58"/><circle cx="277" cy="156" r="1.6" fill="#3e4a58"/>',
        // túi đồ đi làm
        '<path d="M304 98 L296 128 M304 98 L316 128" stroke="#8a6676" stroke-width="1.6" fill="none"/>',
        '<rect x="290" y="126" width="34" height="28" rx="4" fill="#a8727f"/><path d="M290 136 H324" stroke="#8a6676" stroke-width="1.5"/>',
        // đôi giày công sở đặt ngay ngắn dưới móc
        '<path d="M262 236 q2 -8 14 -8 q10 0 12 8 z M290 236 q2 -8 14 -8 q10 0 12 8 z" fill="#6a4f5c"/>',
      '</g>',

      // hug: áo len nâu đỏ (vợ) vòng tay ôm lấy chiếc áo len xanh than tròn bụng (anh)
      '<g data-layer="hug" class="scene-layer">',
        sofa(),
        sweater(180, 202, EM, { s: 1.05, sleeves: false, rot: -12 }),
        '<g class="tap-wobble">', sweater(222, 218, ANH, { round: true, s: 1.15 }), '</g>',
        hugSleeve('M156 148 Q150 184 172 198 Q196 210 216 202', [216, 202], -72),
        hugSleeve('M266 168 Q272 196 252 204 Q238 208 226 203', [226, 203], 72),
        heart(250, 128, 1.4, '#d97b6c', 'art-float art-float--1'),
        heart(268, 112, 0.95, '#e6a08f', 'art-float art-float--2'),
        // trái tim nảy ra mỗi lần xoa bụng (nhịp "belly": [data-tap-show])
        [[196, 150, 1.1], [262, 148, 1.2], [206, 116, 0.9], [240, 98, 1.3], [282, 120, 0.9]].map(([x, y, s], k) =>
          '<g data-tap-show="' + (k + 1) + '">' + heart(x, y, s, k % 2 ? '#e6a08f' : '#d97b6c') + '</g>').join(''),
      '</g>',

      // song: hai chiếc áo len ngồi cạnh nhau, nốt nhạc bay lên từ phía chiếc áo của vợ
      '<g data-layer="song" class="scene-layer">',
        sofa(),
        sweater(170, 214, EM, { s: 0.94, rot: -7 }),
        sweater(240, 214, ANH, { round: true, rot: 4 }),
        note(176, 128, 1.2, 'art-float art-float--1'),
        note(150, 106, 1, 'art-float art-float--2'),
        note(192, 92, 0.9, 'art-float art-float--3'),
        note(132, 80, 0.75, 'art-float art-float--1'),
        heart(214, 118, 1, '#d97b6c', 'art-float art-float--2'),
        // dấu "cắn" hình trái tim trên chiếc áo xanh than (nhịp "bites": [data-tap-show])
        [[228, 176, -12], [254, 168, 10], [246, 196, -4], [264, 188, 14]].map(([x, y, r], k) => biteMark(x, y, r, k + 1)).join(''),
      '</g>',

      // child: góc sofa ấm, hai chiếc gối tựa vào nhau, tấm chăn mỏng
      '<g data-layer="child" class="scene-layer">',
        sofa(),
        cushion(184, 186, -12, EM.light, EM.dark),
        cushion(216, 186, 12, ANH.light, ANH.dark),
        '<path d="M232 206 Q260 200 292 210 L296 246 Q268 240 238 246 Z" fill="#fbe9ef"/>',
        '<path d="M240 214 Q266 208 290 216 M242 226 Q266 220 292 228" stroke="#e9b7c6" stroke-width="1.5" fill="none"/>',
      '</g>',

      // miss: sofa trống, ánh xanh dịu, nốt nhạc mờ
      '<g data-layer="miss" class="scene-layer">',
        sofa(),
        cushion(150, 186, -8, EM.light, EM.dark),
        '<g opacity="0.45">', note(186, 140, 0.9), note(222, 118, 0.75), '</g>',
        '<rect width="400" height="300" fill="#5d86a8" opacity="0.36" style="mix-blend-mode:multiply"/>',
        '<rect width="400" height="300" fill="#dbe8f2" opacity="0.14"/>',
      '</g>',

      '</svg>'
    ].join('');
  }

  NNBT.art = NNBT.art || {};
  NNBT.art.ch3 = { svg };
})(window.NNBT);

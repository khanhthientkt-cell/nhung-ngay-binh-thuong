/*
 * ch3-home.js — Minh họa Chương 3: Nơi anh được làm một đứa trẻ.
 *
 * Phòng khách buổi tối, tông ấm. Mỗi lớp [data-layer] là một nhịp truyện.
 * CHỈ minh họa các ý trong bản mô tả, không thêm sự kiện; không vẽ khuôn mặt; không viết lời bài hát.
 *
 *   grownup — phòng vắng, chiếc áo khoác và túi đồ đi làm treo trên móc cạnh cửa
 *             (hình ảnh ẩn dụ cho việc "không cần lúc nào cũng tỏ ra người lớn" — DIỄN GIẢI, cần duyệt)
 *   hug     — vợ ôm lấy chiếc "bụng mỡ" của anh (nhìn nghiêng; vợ đứng sau, vòng tay qua bụng anh)
 *   song    — vợ nghêu ngao hát (các nốt nhạc bay lên), anh đứng cạnh
 *   child   — hai người ngồi cạnh nhau trên sofa, nhìn từ phía sau, dưới ánh đèn ấm
 *   miss    — sofa trống, ánh xanh dịu, vài nốt nhạc mờ (khoảng cách)
 *
 * Màu áo giữ như các chương trước: anh xanh than, vợ nâu đỏ nhạt.
 */
window.NNBT = window.NNBT || {};

(function (NNBT) {
  'use strict';

  const INK = '#3c3a39';
  const HAIR = '#2b2522';
  const ANH = { coat: '#4f5d6e', dark: '#3e4a58' };
  const EM = { coat: '#c4876a', dark: '#a56d54' };

  // Người đứng nhìn nghiêng, quay sang phải; gốc ở chân. belly: dáng bụng tròn. flip: quay sang trái.
  function standing(o) {
    const stroke = 'fill="none" stroke-linecap="round" stroke-linejoin="round"';
    let s = '';
    s += '<path d="M-3 -28 L-4 0 M3 -28 L4 0" stroke="' + INK + '" stroke-width="3.2" ' + stroke + '/>';
    s += o.belly
      ? '<path d="M-8 -58 Q-11 -42 -10.5 -26 L7 -26 Q23 -31 15 -47 Q10 -55 8 -58 Q0 -62 -8 -58Z" fill="' + o.coat + '"/>'
      : '<path d="M-8 -58 Q-11 -42 -10.5 -26 L10.5 -26 Q11 -42 8 -58 Q0 -62 -8 -58Z" fill="' + o.coat + '"/>';
    if (o.arms !== false) {
      s += '<path d="M-6 -55 L-9 -38 M6 -55 L9 -40" stroke="' + o.dark + '" stroke-width="3.2" ' + stroke + '/>';
    }
    s += '<circle cx="0" cy="-66" r="6.5" fill="' + HAIR + '"/>';
    if (o.longHair) s += '<path d="M-6.5 -67 Q-8 -55 -4.5 -50 L4.5 -50 Q8 -55 6.5 -67Z" fill="' + HAIR + '"/>';
    const tf = 'translate(' + o.x + ' ' + o.y + ') scale(' + (o.flip ? -o.s : o.s) + ' ' + o.s + ')';
    return '<g transform="' + tf + '">' + s + '</g>';
  }

  // Nốt nhạc nhỏ (vẽ, không phải chữ)
  function note(x, y, sc, cls) {
    return '<g class="' + (cls || '') + '" transform="translate(' + x + ' ' + y + ') scale(' + sc + ')">' +
      '<path d="M0 0 V-14 L9 -16 V-3" stroke="#9c4f2d" stroke-width="1.6" fill="none" stroke-linecap="round"/>' +
      '<ellipse cx="-2" cy="0.5" rx="3" ry="2.3" fill="#9c4f2d"/><ellipse cx="7" cy="-2.5" rx="3" ry="2.3" fill="#9c4f2d"/></g>';
  }

  function room() {
    return [
      '<rect width="400" height="300" fill="url(#c3-wall)"/>',
      // cửa sổ lúc chạng vạng
      '<rect x="150" y="42" width="100" height="104" rx="3" fill="url(#c3-dusk)"/>',
      '<path d="M200 42 V146 M150 94 H250" stroke="#f1dcc0" stroke-width="4"/>',
      '<rect x="150" y="42" width="100" height="104" rx="3" fill="none" stroke="#f6e7d2" stroke-width="5"/>',
      // đèn cây bên phải
      '<circle cx="338" cy="120" r="70" fill="url(#c3-lamp)"/>',
      '<path d="M338 128 V250" stroke="#5a4636" stroke-width="3"/><path d="M326 252 h24" stroke="#5a4636" stroke-width="4" stroke-linecap="round"/>',
      '<path d="M322 128 h32 l-6 -24 h-20 z" fill="#f4dcaa" stroke="#c99a62" stroke-width="1.5"/>',
      // sàn
      '<rect x="0" y="236" width="400" height="64" fill="url(#c3-floor)"/>',
      '<path d="M0 237 H400" stroke="#d2a77c" stroke-width="3"/>',
      '<ellipse cx="200" cy="268" rx="120" ry="14" fill="#c9776a" opacity="0.18" filter="url(#wc-wash)"/>'
    ].join('');
  }

  function sofaBack(withPeople) {
    let s = '';
    s += '<rect x="96" y="176" width="208" height="70" rx="16" fill="#8d9f8c"/>';
    s += '<rect x="84" y="196" width="26" height="54" rx="10" fill="#7d8f7c"/><rect x="290" y="196" width="26" height="54" rx="10" fill="#7d8f7c"/>';
    if (withPeople) {
      // vợ bên trái, anh bên phải, ngồi sát nhau
      s += '<path d="M150 186 Q150 160 176 158 Q202 160 202 186 Z" fill="' + EM.coat + '"/>';
      s += '<path d="M200 186 Q200 158 228 156 Q256 158 256 186 Z" fill="' + ANH.coat + '"/>';
      s += '<circle cx="176" cy="142" r="15" fill="' + HAIR + '"/>';
      s += '<path d="M161 144 Q160 166 168 172 L184 172 Q192 166 191 144 Z" fill="' + HAIR + '"/>';
      s += '<circle cx="226" cy="140" r="15" fill="' + HAIR + '"/>';
      // tựa lưng sofa phủ phần dưới người
      s += '<rect x="96" y="176" width="208" height="30" rx="14" fill="#8d9f8c"/>';
    }
    s += '<path d="M120 190 H280" stroke="#a3b3a1" stroke-width="2" opacity="0.7"/>';
    return s;
  }

  function svg(titleId) {
    return [
      '<svg class="scene-art" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid meet" role="img" aria-labelledby="' + titleId + '">',
      '<title id="' + titleId + '"></title>',
      '<defs>',
        '<linearGradient id="c3-wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#efd8ba"/><stop offset="1" stop-color="#e2c29c"/></linearGradient>',
        '<linearGradient id="c3-dusk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e9b98e"/><stop offset="1" stop-color="#b3a7bf"/></linearGradient>',
        '<linearGradient id="c3-floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bf9168"/><stop offset="1" stop-color="#9f7350"/></linearGradient>',
        '<radialGradient id="c3-lamp"><stop offset="0" stop-color="#ffdf9e" stop-opacity="0.7"/><stop offset="1" stop-color="#ffdf9e" stop-opacity="0"/></radialGradient>',
      '</defs>',
      room(),

      // grownup: áo khoác và túi treo trên móc cạnh cửa
      '<g data-layer="grownup" class="scene-layer">',
        '<rect x="18" y="70" width="70" height="168" rx="2" fill="#b98c63"/><rect x="24" y="76" width="58" height="162" fill="#c99d72"/>',
        '<circle cx="74" cy="160" r="2.5" fill="#f1d3a0"/>',
        '<path d="M100 92 h44" stroke="#6f4f38" stroke-width="4" stroke-linecap="round"/>',
        '<circle cx="112" cy="96" r="2.5" fill="#6f4f38"/><circle cx="134" cy="96" r="2.5" fill="#6f4f38"/>',
        // áo khoác xanh than
        '<path d="M112 98 L98 110 L100 168 L126 168 L124 110 Z" fill="' + ANH.coat + '" filter="url(#wc-line)"/>',
        '<path d="M112 98 L112 150" stroke="#3e4a58" stroke-width="1.5"/>',
        // túi đồ đi làm
        '<path d="M134 98 L128 124 M134 98 L144 124" stroke="#5a4636" stroke-width="1.6" fill="none"/>',
        '<rect x="122" y="122" width="30" height="24" rx="4" fill="#7a5a43"/>',
      '</g>',

      // hug: vợ ôm bụng anh (nhìn nghiêng)
      '<g data-layer="hug" class="scene-layer">',
        standing({ x: 186, y: 262, s: 1.6, coat: EM.coat, dark: EM.dark, longHair: true, arms: false }),
        standing({ x: 212, y: 262, s: 1.6, coat: ANH.coat, dark: ANH.dark, belly: true }),
        // vòng tay vợ ôm qua bụng anh
        '<path d="M194 172 Q214 184 232 196" stroke="' + EM.dark + '" stroke-width="5.5" fill="none" stroke-linecap="round"/>',
        '<path d="M190 184 Q212 202 233 206" stroke="' + EM.dark + '" stroke-width="5.5" fill="none" stroke-linecap="round"/>',
        '<circle cx="234" cy="197" r="3.6" fill="#d9a98a"/><circle cx="235" cy="206" r="3.6" fill="#d9a98a"/>',
      '</g>',

      // song: vợ nghêu ngao hát, anh đứng cạnh
      '<g data-layer="song" class="scene-layer">',
        standing({ x: 170, y: 262, s: 1.6, coat: EM.coat, dark: EM.dark, longHair: true }),
        standing({ x: 236, y: 262, s: 1.6, coat: ANH.coat, dark: ANH.dark, belly: true, flip: true }),
        note(186, 132, 1.1, 'art-float art-float--1'),
        note(160, 112, 0.9, 'art-float art-float--2'),
        note(196, 98, 0.8, 'art-float art-float--3'),
      '</g>',

      // child: hai người ngồi cạnh nhau trên sofa, nhìn từ phía sau
      '<g data-layer="child" class="scene-layer">',
        sofaBack(true),
      '</g>',

      // miss: sofa trống, ánh xanh dịu, nốt nhạc mờ
      '<g data-layer="miss" class="scene-layer">',
        sofaBack(false),
        '<g opacity="0.45">', note(176, 150, 0.9), note(214, 128, 0.75), '</g>',
        '<rect width="400" height="300" fill="#5d86a8" opacity="0.36" style="mix-blend-mode:multiply"/>',
        '<rect width="400" height="300" fill="#dbe8f2" opacity="0.14"/>',
      '</g>',

      '</svg>'
    ].join('');
  }

  NNBT.art = NNBT.art || {};
  NNBT.art.ch3 = { svg };
})(window.NNBT);

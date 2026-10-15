/*
 * ch4-two-places.js — Minh họa Chương 4: Hai nơi, một câu chuyện.
 *
 * Bản đồ THẬT (Natural Earth, public domain — xem js/art/geo.js): đất liền và đảo, KHÔNG vẽ biên giới,
 * không ghi tên quần đảo. Khung: 100°E–150°E, ~7°N–40,5°N, chiếu Mercator, 400×300.
 * Hai ngôi nhà sáng đèn — một ở Việt Nam, một ở Đài Loan. KHÔNG gán nhà nào là của ai;
 * vị trí ngôi nhà chỉ mang tính minh họa (không phải thành phố cụ thể).
 *
 * Lớp theo nhịp:
 *   homes  — bản đồ, hai nhà sáng đèn, đường bay có máy bay nhỏ
 *   meet   — ba con tem kỷ niệm sáng lần lượt khi chạm: máy bay (vợ đến thăm), mũ tốt nghiệp, núi Phú Sĩ
 *            (khi tem thứ ba sáng, Nhật Bản sáng nhẹ)
 *   dream  — thêm con tem "châu Âu" viền nét đứt: chuyến đi anh mong đưa vợ đến
 *   hard   — mây giông giữa hai nhà, ánh sáng dịu đi; chạm để mây tan dần (--tap-progress)
 *   learn  — mây đã tan
 *   future — hai con đường vàng từ hai nhà vươn ra theo độ nhấn giữ (--hold) rồi nhập làm một
 */
window.NNBT = window.NNBT || {};

(function (NNBT) {
  'use strict';

  // Tọa độ đã chiếu (xem geo.project('ch4', lon, lat))
  const VN_HOUSE = [60.8, 225.2];   // ~107,6°E 16°N — minh họa
  const TW_HOUSE = [168.0, 159.7];  // ~121°E 23,7°N
  const JAPAN = [300.0, 49.8];      // ~137,5°E 35,6°N
  const ARC_CTRL = [100, 140];
  const STAMPS_X = [252, 306, 360];
  const STAMP_Y = 266;
  const EUROPE_X = 198;

  function house(x, y) {
    return '<g transform="translate(' + x + ' ' + y + ')">' +
      '<circle cx="0" cy="-5" r="20" fill="url(#c4-glow)"/>' +
      '<ellipse cx="0" cy="4.5" rx="9" ry="2" fill="#7a4f63" opacity="0.18"/>' +
      '<path d="M-8 4 V-5 L0 -12 L8 -5 V4 Z" fill="#fffafb" stroke="#9a6b78" stroke-width="1.1" stroke-linejoin="round"/>' +
      '<path d="M-10.5 -4 L0 -13.5 L10.5 -4" stroke="#c4607f" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<rect x="-3" y="-3" width="6" height="5" rx="0.8" fill="#f2b84b"/>' +
      '<path d="M4.5 -9.5 V-13 H6.8 V-7.5" fill="#c4607f"/>' +
      '</g>';
  }

  // Con tem kỷ niệm: khung răng cưa + hình vẽ tay
  // Tem tắt (mờ) + tem sáng. Tem sáng hiện khi đã chạm đủ `k` lần ở nhịp "meet" ([data-tap-show]),
  // các nhịp sau thì luôn sáng. data-tap-show nằm ở nhóm ngoài (không transform) để hoạt ảnh nảy không đè vị trí.
  function stamp(x, y, inner, k) {
    const frame = '<rect x="-21" y="-21" width="42" height="42" rx="3" fill="#fff8fa" stroke="#e2b9c6" stroke-width="1.4" stroke-dasharray="3 2.4"/>';
    const off = '<g transform="translate(' + x + ' ' + y + ')" opacity="0.6">' + frame + '<g opacity="0.35">' + inner + '</g></g>';
    const on = '<g data-tap-show="' + k + '"><g transform="translate(' + x + ' ' + y + ') rotate(' + (x % 3 - 1) * 3 + ')">' +
      '<rect x="-21" y="-21" width="42" height="42" rx="3" fill="#fff6f8" stroke="#c4607f" stroke-width="1.5" stroke-dasharray="3 2.4"/>' +
      '<rect x="-16.5" y="-16.5" width="33" height="33" rx="2" fill="#fbdde6"/>' + inner + '</g></g>';
    return off + on;
  }

  // Tem "châu Âu": viền nét đứt màu vàng, như một con tem còn để dành cho chuyến đi anh mong.
  function dreamStamp(x, y) {
    return '<g transform="translate(' + x + ' ' + y + ') rotate(-4)">' +
      '<circle r="30" fill="url(#c4-glow)" opacity="0.7"/>' +
      '<rect x="-21" y="-21" width="42" height="42" rx="3" fill="#fffafc" stroke="#d6ad55" stroke-width="1.6" stroke-dasharray="4 3"/>' +
      EIFFEL +
      '<text y="16.5" text-anchor="middle" font-family="Charm, Georgia, serif" font-size="7.5" fill="#c4607f">châu Âu</text>' +
      '</g>';
  }

  const CAP = '<path d="M-11 -3 L0 -8.5 L11 -3 L0 2.5 Z" fill="#4d3d4a"/><path d="M-6.5 0 V5.5 Q0 9 6.5 5.5 V0" fill="#4d3d4a"/><path d="M11 -3 V4.5" stroke="#d6ad55" stroke-width="1.4"/>';
  const PLANE_STAMP = '<path d="M-11 2 L11 -5.5 L12 -2.8 L2 2 L4.6 8.4 L1.8 9.3 L-2.8 3.6 L-8.3 5.5 L-9.2 3.6 Z" fill="#7b7fb3"/>';
  const EIFFEL = '<path d="M0 -17 L2.2 -6 L5.5 9 H2.6 Q0 3 -2.6 9 H-5.5 L-2.2 -6 Z" fill="#8a6f7f"/><path d="M-3.2 -2 H3.2 M-4.3 3.5 H4.3" stroke="#fffafc" stroke-width="1"/>';
  const FUJI = '<path d="M-13 8 L-3.6 -6.4 Q0 -9 3.6 -6.4 L13 8 Z" fill="#9aa6d4"/><path d="M-3.6 -6.4 Q0 -9 3.6 -6.4 L5.4 -2.7 L2.7 -3.6 L0 -1.8 L-2.7 -3.6 L-5.4 -2.7 Z" fill="#fff8fa"/><circle cx="8" cy="-8" r="3.2" fill="#e07a5f"/>';

  // Kinh tuyến / vĩ tuyến mờ (mỗi 10°)
  function graticule() {
    const g = NNBT.geo;
    let s = '';
    [110, 120, 130, 140].forEach((lon) => {
      const x = g.project('ch4', lon, 20)[0].toFixed(1);
      s += '<path d="M' + x + ' 0 V300"/>';
    });
    [10, 20, 30, 40].forEach((lat) => {
      const y = g.project('ch4', 120, lat)[1].toFixed(1);
      s += '<path d="M0 ' + y + ' H400"/>';
    });
    return '<g stroke="#a9b2da" stroke-width="0.6" stroke-dasharray="2 4" opacity="0.45" fill="none">' + s + '</g>';
  }

  function compass(x, y) {
    return '<g transform="translate(' + x + ' ' + y + ')" opacity="0.8">' +
      '<circle r="17" fill="none" stroke="#b48a9a" stroke-width="0.8"/>' +
      '<circle r="13" fill="none" stroke="#b48a9a" stroke-width="0.5" stroke-dasharray="1.5 2"/>' +
      '<path d="M0 -15 L3 0 L0 15 L-3 0 Z" fill="#e2b3c2"/>' +
      '<path d="M0 -15 L3 0 L-3 0 Z" fill="#c4607f"/>' +
      '<path d="M-15 0 L0 2.4 L15 0 L0 -2.4 Z" fill="#ecd3dc"/>' +
      '<text y="-20" text-anchor="middle" font-size="7" fill="#9a6b78" font-family="Be Vietnam Pro, sans-serif" font-weight="500">B</text>' +
      '</g>';
  }

  function label(x, y, text, size) {
    return '<text x="' + x + '" y="' + y + '" font-family="Charm, Georgia, serif" font-size="' + (size || 12) +
      '" fill="#7a5566" text-anchor="middle" letter-spacing="0.6" style="paint-order:stroke" stroke="#fdf0f4" stroke-width="2.4" stroke-linejoin="round">' + text + '</text>';
  }

  function svg(titleId) {
    const land = NNBT.geo ? NNBT.geo.ch4.d : '';
    const arc = 'M' + VN_HOUSE[0] + ' ' + (VN_HOUSE[1] - 12) + ' Q ' + ARC_CTRL[0] + ' ' + ARC_CTRL[1] + ' ' + TW_HOUSE[0] + ' ' + (TW_HOUSE[1] - 12);
    // Máy bay nhỏ ở giữa đường bay, quay theo hướng bay
    const mx = 0.25 * VN_HOUSE[0] + 0.5 * ARC_CTRL[0] + 0.25 * TW_HOUSE[0];
    const my = 0.25 * (VN_HOUSE[1] - 12) + 0.5 * ARC_CTRL[1] + 0.25 * (TW_HOUSE[1] - 12);
    const ang = Math.atan2((TW_HOUSE[1] - 12) - (VN_HOUSE[1] - 12), TW_HOUSE[0] - VN_HOUSE[0]) * 180 / Math.PI;

    return [
      '<svg class="scene-art" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" role="img" aria-labelledby="' + titleId + '">',
      '<title id="' + titleId + '"></title>',
      '<defs>',
        '<linearGradient id="c4-sea" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e6e8f7"/><stop offset="1" stop-color="#d2d8f0"/></linearGradient>',
        '<linearGradient id="c4-land" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fcecf1"/><stop offset="1" stop-color="#f4d8e1"/></linearGradient>',
        '<radialGradient id="c4-glow"><stop offset="0" stop-color="#ffd98a" stop-opacity="0.9"/><stop offset="1" stop-color="#ffd98a" stop-opacity="0"/></radialGradient>',
        '<radialGradient id="c4-sun"><stop offset="0" stop-color="#ffe3a0" stop-opacity="0.95"/><stop offset="1" stop-color="#ffe3a0" stop-opacity="0"/></radialGradient>',
        '<linearGradient id="c4-road" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#e2ad4f"/><stop offset="1" stop-color="#f6d58a"/></linearGradient>',
        '<filter id="c4-halo" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="3"/></filter>',
        '<filter id="c4-grain"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="11"/>',
          '<feColorMatrix values="0 0 0 0 0.35  0 0 0 0 0.3  0 0 0 0 0.25  0 0 0 0.09 0"/></filter>',
      '</defs>',

      // Biển + lưới tọa độ + sóng
      '<rect width="400" height="300" fill="url(#c4-sea)"/>',
      graticule(),
      '<g stroke="#bcc4e4" stroke-width="0.9" fill="none" stroke-linecap="round" opacity="0.8">',
        '<path d="M222 120 q6 -3 12 0 t12 0 M250 200 q6 -3 12 0 t12 0 M330 180 q6 -3 12 0 t12 0 M120 270 q6 -3 12 0 t12 0 M350 90 q6 -3 12 0 t12 0"/>',
      '</g>',

      // Đất liền: quầng nước nông, bãi cát, đất, nét bờ biển
      '<path d="' + land + '" fill="none" stroke="#b9c1e6" stroke-width="9" opacity="0.35" filter="url(#c4-halo)"/>',
      '<path d="' + land + '" fill="none" stroke="#fff6f8" stroke-width="3.2" stroke-linejoin="round" opacity="0.9"/>',
      '<path d="' + land + '" fill="url(#c4-land)"/>',
      '<path d="' + land + '" fill="none" stroke="#b48a9a" stroke-width="0.7" stroke-linejoin="round" opacity="0.7"/>',
      '<rect width="400" height="300" filter="url(#c4-grain)" opacity="1"/>',

      // Tên nước (viết tay)
      label(30, 181, 'Việt Nam', 12),
      label(203, 172, 'Đài Loan', 11),
      label(330, 22, 'Nhật Bản', 12),
      compass(370, 132),

      // Nhật Bản sáng nhẹ khi kể chuyến đi Nhật
      '<g data-layer="meet" class="scene-layer"><g data-tap-show="3"><circle cx="' + JAPAN[0] + '" cy="' + JAPAN[1] + '" r="40" fill="url(#c4-glow)" opacity="0.85"/></g></g>',

      // Đường bay + máy bay nhỏ
      '<path d="' + arc + '" fill="none" stroke="#c4607f" stroke-width="1.5" stroke-dasharray="2 5" stroke-linecap="round" opacity="0.8"/>',
      '<g transform="translate(' + mx.toFixed(1) + ' ' + my.toFixed(1) + ') rotate(' + ang.toFixed(1) + ')">' +
        '<path d="M-7 1 L7 -1.5 L8 0 L7 1.5 L-7 -1 Z M-1 0 L-4 -6 L-1.5 -6 L3 0 L-1.5 6 L-4 6 Z M-6 0 L-8 -3 L-6.6 -3 L-4.4 0 L-6.6 3 L-8 3 Z" fill="#7b7fb3"/>' +
      '</g>',

      // Mây xám giữa hai nhà (bất đồng) — và lúc mây tan
      '<g data-layer="hard" class="scene-layer">',
        '<g class="tap-fade"><rect width="400" height="300" fill="#7a7aa8" opacity="0.26" style="mix-blend-mode:multiply"/></g>',
        '<g class="tap-fade"><g opacity="0.95"><ellipse cx="124" cy="170" rx="40" ry="5" fill="#8a85ad" opacity="0.25"/>' +
          '<g fill="#a9a4c6"><circle cx="100" cy="152" r="19"/><circle cx="122" cy="142" r="24"/><circle cx="146" cy="154" r="17"/><rect x="90" y="150" width="66" height="17" rx="8.5"/></g>' +
          '<g fill="#c4c0dc"><circle cx="104" cy="148" r="14"/><circle cx="122" cy="137" r="18"/><circle cx="142" cy="149" r="11"/></g></g>',
        '<g stroke="#9d97bc" stroke-width="1.2" stroke-linecap="round" opacity="0.7"><path d="M104 172 l-3 8 M118 174 l-3 8 M132 172 l-3 8 M146 174 l-3 8"/></g></g>',
      '</g>',
      '<g data-layer="learn" class="scene-layer">',
        '<g fill="#ebe8f6" opacity="0.85"><circle cx="72" cy="122" r="12"/><circle cx="88" cy="117" r="14"/><rect x="62" y="120" width="40" height="10" rx="5"/><circle cx="178" cy="122" r="11"/><circle cx="192" cy="117" r="13"/><rect x="168" y="120" width="36" height="10" rx="5"/></g>',
      '</g>',

      // Con đường vàng hướng về tương lai
      '<g data-layer="future" class="scene-layer">',
        '<circle cx="388" cy="196" r="64" fill="url(#c4-sun)"/>',
        '<path d="M' + VN_HOUSE[0] + ' ' + (VN_HOUSE[1] + 6) + ' Q 100 250 160 232" pathLength="1" class="hold-draw" stroke="url(#c4-road)" stroke-width="6" fill="none" stroke-linecap="round" filter="url(#wc-line)"/>',
        '<path d="M' + TW_HOUSE[0] + ' ' + (TW_HOUSE[1] + 6) + ' Q 186 206 160 232" pathLength="1" class="hold-draw" stroke="url(#c4-road)" stroke-width="6" fill="none" stroke-linecap="round" filter="url(#wc-line)"/>',
        '<path d="M160 232 Q 262 222 398 192" class="hold-reveal" stroke="url(#c4-road)" stroke-width="10" fill="none" stroke-linecap="round" filter="url(#wc-line)"/>',
      '</g>',

      // Hai ngôi nhà sáng đèn
      house(VN_HOUSE[0], VN_HOUSE[1]),
      house(TW_HOUSE[0], TW_HOUSE[1]),
      '<g data-layer="hard" class="scene-layer">',
        '<circle cx="' + VN_HOUSE[0] + '" cy="' + (VN_HOUSE[1] - 5) + '" r="15" fill="#8a85ad" opacity="0.32"/>',
        '<circle cx="' + TW_HOUSE[0] + '" cy="' + (TW_HOUSE[1] - 5) + '" r="15" fill="#8a85ad" opacity="0.32"/>',
      '</g>',

      // Ba con tem kỷ niệm gặp lại (sáng lần lượt khi chạm ở nhịp "meet") và tem châu Âu (chuyến đi anh mong)
      '<g data-layer="meet dream hard learn future" class="scene-layer">',
        stamp(STAMPS_X[0], STAMP_Y, PLANE_STAMP, 1),
        stamp(STAMPS_X[1], STAMP_Y, CAP, 2),
        stamp(STAMPS_X[2], STAMP_Y, FUJI, 3),
      '</g>',
      '<g data-layer="dream hard learn future" class="scene-layer">', dreamStamp(EUROPE_X, STAMP_Y), '</g>',

      '</svg>'
    ].join('');
  }

  NNBT.art = NNBT.art || {};
  NNBT.art.ch4 = { svg };
})(window.NNBT);

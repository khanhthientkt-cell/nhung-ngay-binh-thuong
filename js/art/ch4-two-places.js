/*
 * ch4-two-places.js — Minh họa Chương 4: Hai nơi, một câu chuyện.
 *
 * Bản đồ màu nước GIẢN LƯỢC (không chính xác về địa lý): Việt Nam, Đài Loan, Nhật Bản.
 * Hai ngôi nhà sáng đèn — một ở Việt Nam, một ở Đài Loan. KHÔNG gán nhà nào là của ai,
 * vị trí ngôi nhà trong lãnh thổ chỉ mang tính minh họa (không phải thành phố cụ thể).
 * Các kỷ niệm gặp lại là ba "con tem" ở góc dưới (không đặt lên vị trí địa lý nào, trừ Nhật Bản sáng lên ở nhịp chuyến đi Nhật).
 *
 * Lớp theo nhịp:
 *   homes      — bản đồ, hai nhà sáng đèn, đường bay chấm nối hai nơi
 *   graduation — con tem 1 sáng (mũ tốt nghiệp)
 *   flight     — con tem 2 sáng (máy bay)
 *   japan      — con tem 3 sáng (núi Phú Sĩ), Nhật Bản sáng nhẹ
 *   hard       — một đám mây xám giữa hai nhà, ánh sáng dịu đi (bất đồng, không quy lỗi)
 *   learn      — mây tan dần, đèn ấm lại
 *   future     — con đường vàng bình minh từ hai nhà nhập làm một, hướng về phía trước
 */
window.NNBT = window.NNBT || {};

(function (NNBT) {
  'use strict';

  // Đường viền giản lược (chữ S: bắc rộng, eo hẹp miền Trung, nam phình ra, mũi Cà Mau).
  const VIETNAM =
    'M78 48 L110 40 L138 50 L132 64 L120 78 L112 92 L118 108 L130 124 L142 140 L150 158 L154 178 L150 196 ' +
    'L138 212 L120 226 L100 240 L88 252 L84 240 L90 226 L98 214 L110 204 L122 188 L126 170 L120 150 ' +
    'L110 132 L98 116 L86 100 L74 84 L64 70 L68 56 Z';
  // Lục địa xung quanh (phía tây và phía bắc, kéo sang bờ biển đối diện Đài Loan)
  const MAINLAND =
    'M0 0 H400 V10 Q350 18 318 34 Q296 46 280 72 L270 82 Q256 64 232 56 Q196 50 160 52 L138 50 L110 40 L78 48 ' +
    'L68 56 L64 70 L74 84 L86 100 L98 116 L110 132 L120 150 L126 170 L122 188 L110 204 L98 214 L90 226 ' +
    'L58 230 L0 232 Z';

  const VN_HOUSE = [132, 158];
  const TW_HOUSE = [297, 112];

  function house(x, y, cls) {
    return '<g class="' + (cls || '') + '" transform="translate(' + x + ' ' + y + ')">' +
      '<circle cx="0" cy="-4" r="22" fill="url(#c4-glow)"/>' +
      '<path d="M-8 4 V-5 L0 -12 L8 -5 V4 Z" fill="#f7ecd9" stroke="#8a6a4f" stroke-width="1.2" stroke-linejoin="round"/>' +
      '<path d="M-10 -4 L0 -13 L10 -4" stroke="#9c4f2d" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<rect x="-3" y="-3" width="6" height="5" rx="0.8" fill="#f2b84b"/>' +
      '</g>';
  }

  // Con tem kỷ niệm: khung răng cưa + biểu tượng vẽ tay
  function stamp(x, y, inner, litLayers) {
    const frame = '<rect x="-23" y="-23" width="46" height="46" rx="3" fill="#fbf4e6" stroke="#c9b08c" stroke-width="1.5" stroke-dasharray="3 2.4"/>';
    const off = '<g transform="translate(' + x + ' ' + y + ')" opacity="0.55">' + frame +
      '<g opacity="0.35">' + inner + '</g></g>';
    const on = '<g data-layer="' + litLayers + '" class="scene-layer" transform="translate(' + x + ' ' + y + ')">' +
      '<rect x="-23" y="-23" width="46" height="46" rx="3" fill="#fff6e4" stroke="#b4552f" stroke-width="1.6" stroke-dasharray="3 2.4"/>' +
      '<rect x="-18" y="-18" width="36" height="36" rx="2" fill="#f6dcc0"/>' + inner + '</g>';
    return off + on;
  }

  const CAP = '<path d="M-12 -3 L0 -9 L12 -3 L0 3 Z" fill="#3c3a39"/><path d="M-7 0 V6 Q0 10 7 6 V0" fill="#3c3a39"/><path d="M12 -3 V5" stroke="#d6ad55" stroke-width="1.5"/>';
  const PLANE = '<path d="M-12 2 L12 -6 L13 -3 L2 2 L5 9 L2 10 L-3 4 L-9 6 L-10 4 Z" fill="#5f7f92"/>';
  const FUJI = '<path d="M-14 9 L-4 -7 Q0 -10 4 -7 L14 9 Z" fill="#7f9fb3"/><path d="M-4 -7 Q0 -10 4 -7 L6 -3 L3 -4 L0 -2 L-3 -4 L-6 -3 Z" fill="#fbf4e6"/><circle cx="9" cy="-9" r="3.5" fill="#e07a5f"/>';

  function svg(titleId) {
    const arc = 'M' + VN_HOUSE[0] + ' ' + (VN_HOUSE[1] - 10) + ' Q 212 30 ' + TW_HOUSE[0] + ' ' + (TW_HOUSE[1] - 12);
    return [
      '<svg class="scene-art" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid meet" role="img" aria-labelledby="' + titleId + '">',
      '<title id="' + titleId + '"></title>',
      '<defs>',
        '<linearGradient id="c4-sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d9e6e4"/><stop offset="1" stop-color="#cbdcdc"/></linearGradient>',
        '<radialGradient id="c4-glow"><stop offset="0" stop-color="#ffd98a" stop-opacity="0.85"/><stop offset="1" stop-color="#ffd98a" stop-opacity="0"/></radialGradient>',
        '<radialGradient id="c4-sun"><stop offset="0" stop-color="#ffe3a0" stop-opacity="0.95"/><stop offset="1" stop-color="#ffe3a0" stop-opacity="0"/></radialGradient>',
        '<linearGradient id="c4-road" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e9b85c"/><stop offset="1" stop-color="#f6d58a"/></linearGradient>',
      '</defs>',

      // Biển
      '<rect width="400" height="300" fill="url(#c4-sea)"/>',
      '<g stroke="#b9cfcf" stroke-width="1" fill="none" opacity="0.7">',
        '<path d="M200 170 q10 -4 20 0 t20 0 M230 210 q10 -4 20 0 t20 0 M300 180 q10 -4 20 0 t20 0 M190 250 q10 -4 20 0 t20 0"/>',
      '</g>',
      // Lục địa (mờ) và Việt Nam (đậm hơn)
      '<g filter="url(#wc-wash)">',
        '<path d="' + MAINLAND + '" fill="#ece0c8" opacity="0.85"/>',
        '<path d="' + VIETNAM + '" fill="#e8cfa6"/>',
        // Đài Loan
        '<path d="M298 92 Q309 97 306 113 Q302 129 293 134 Q286 121 288 107 Q290 95 298 92 Z" fill="#e8cfa6"/>',
        // Nhật Bản (giản lược)
        '<path d="M396 16 Q384 40 369 58 Q357 72 346 84 Q353 87 363 77 Q380 61 398 38 Z" fill="#ece0c8"/>',
        '<path d="M340 90 Q348 88 350 96 Q344 102 338 98 Z" fill="#ece0c8"/>',
      '</g>',
      '<path d="' + VIETNAM + '" fill="none" stroke="#c9a57a" stroke-width="1.2" stroke-linejoin="round" opacity="0.7" filter="url(#wc-line)"/>',

      // Nhật Bản sáng nhẹ khi kể chuyến đi Nhật
      '<g data-layer="japan" class="scene-layer">',
        '<circle cx="368" cy="60" r="34" fill="url(#c4-glow)" opacity="0.8"/>',
      '</g>',

      // Đường bay chấm nối hai nơi
      '<path d="' + arc + '" fill="none" stroke="#9c4f2d" stroke-width="1.6" stroke-dasharray="2 6" stroke-linecap="round" opacity="0.7"/>',

      // Mây xám giữa hai nhà (bất đồng) — và lúc mây tan
      '<g data-layer="hard" class="scene-layer">',
        '<rect width="400" height="300" fill="#5d7a92" opacity="0.28" style="mix-blend-mode:multiply"/>',
        '<g filter="url(#wc-wash)" fill="#9eabb6" opacity="0.9"><circle cx="196" cy="72" r="22"/><circle cx="220" cy="62" r="26"/><circle cx="246" cy="74" r="20"/><rect x="186" y="70" width="72" height="20" rx="10"/></g>',
        '<g stroke="#8797a4" stroke-width="1.2" stroke-linecap="round" opacity="0.7"><path d="M200 98 l-3 9 M214 100 l-3 9 M228 98 l-3 9 M242 100 l-3 9"/></g>',
      '</g>',
      '<g data-layer="learn" class="scene-layer">',
        '<g filter="url(#wc-wash)" fill="#c3ccd3" opacity="0.55"><circle cx="160" cy="50" r="16"/><circle cx="178" cy="44" r="18"/><circle cx="276" cy="52" r="15"/><circle cx="292" cy="46" r="17"/></g>',
      '</g>',

      // Con đường vàng hướng về tương lai
      '<g data-layer="future" class="scene-layer">',
        '<circle cx="386" cy="174" r="66" fill="url(#c4-sun)"/>',
        '<path d="M' + VN_HOUSE[0] + ' ' + (VN_HOUSE[1] + 6) + ' Q 170 190 236 194" stroke="url(#c4-road)" stroke-width="7" fill="none" stroke-linecap="round" filter="url(#wc-line)"/>',
        '<path d="M' + TW_HOUSE[0] + ' ' + (TW_HOUSE[1] + 6) + ' Q 294 168 236 194" stroke="url(#c4-road)" stroke-width="7" fill="none" stroke-linecap="round" filter="url(#wc-line)"/>',
        '<path d="M236 194 Q 310 202 398 172" stroke="url(#c4-road)" stroke-width="11" fill="none" stroke-linecap="round" filter="url(#wc-line)"/>',
      '</g>',

      // Hai ngôi nhà sáng đèn
      house(VN_HOUSE[0], VN_HOUSE[1]),
      house(TW_HOUSE[0], TW_HOUSE[1]),
      // Đèn dịu đi khi có mây
      '<g data-layer="hard" class="scene-layer">',
        '<circle cx="' + VN_HOUSE[0] + '" cy="' + (VN_HOUSE[1] - 4) + '" r="16" fill="#6f8496" opacity="0.35"/>',
        '<circle cx="' + TW_HOUSE[0] + '" cy="' + (TW_HOUSE[1] - 4) + '" r="16" fill="#6f8496" opacity="0.35"/>',
      '</g>',

      // Ba con tem kỷ niệm gặp lại (ẩn ở nhịp đầu, ở góc dưới bên phải)
      '<g data-layer="graduation flight japan hard learn future" class="scene-layer">',
        stamp(222, 262, CAP, 'graduation flight japan hard learn future'),
        stamp(282, 262, PLANE, 'flight japan hard learn future'),
        stamp(342, 262, FUJI, 'japan hard learn future'),
      '</g>',

      '</svg>'
    ].join('');
  }

  NNBT.art = NNBT.art || {};
  NNBT.art.ch4 = { svg };
})(window.NNBT);

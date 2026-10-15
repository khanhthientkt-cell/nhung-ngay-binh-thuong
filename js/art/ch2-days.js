/*
 * ch2-days.js — Minh họa Chương 2: Những ngày chẳng có gì đặc biệt.
 *
 * TRANH TĨNH VẬT — không vẽ người (theo lựa chọn của anh): mỗi cảnh kể chuyện qua đồ vật.
 * Một SVG, mỗi lớp [data-layer] là một cảnh trọn vẹn (có nền riêng), bật/tắt theo nhịp truyện.
 *
 *   objects — trên bàn: hai chiếc laptop gập, mũ bảo hiểm, hai chiếc ly
 *   ride    — xe tay ga đỗ trước dãy nhà phố buổi sáng, hai chiếc mũ bảo hiểm (đi làm / đón về)
 *   cafe    — mặt bàn quán cà phê nhìn từ trên xuống: hai laptop mở cạnh nhau, hai ly cà phê
 *   bedwork — hai chiếc laptop mở sáng trên giường, hai chiếc gối
 *   sleep   — đêm: hai gối sát nhau, chăn phồng, laptop đã gập trên tủ, hai đôi dép
 *   apart   — những vật quen thuộc dưới ánh sáng xanh dịu (đoạn suy ngẫm; nhịp này hiện ảnh thật)
 *
 * Quyết định hình ảnh đã duyệt vẫn giữ: xe tay ga; mũ bảo hiểm anh cam đất (#e58fa3), vợ vàng mù tạt (#d6ad55)
 * — lựa chọn tạo hình, không phải màu mũ thật.
 */
window.NNBT = window.NNBT || {};

(function (NNBT) {
  'use strict';

  const INK = '#3a3634';
  const HELMET_ANH = '#c9774f';
  const HELMET_EM = '#d6ad55';

  // ---------- Mũ bảo hiểm nửa đầu (nhìn nghiêng), gốc ở giữa vành ----------
  function helmet(x, y, color, rot, s) {
    return '<g transform="translate(' + x + ' ' + y + ') rotate(' + (rot || 0) + ') scale(' + (s || 1) + ')">' +
      '<path d="M-17 4 C -17 -16, 17 -16, 17 4 Z" fill="' + color + '"/>' +
      '<path d="M-17 4 C -17 -16, 17 -16, 17 4" fill="none" stroke="rgba(0,0,0,0.18)" stroke-width="1"/>' +
      '<path d="M-10 -9 Q -2 -14 8 -11" fill="none" stroke="#ffffff" stroke-width="2.4" stroke-linecap="round" opacity="0.4"/>' +
      '<path d="M-3 -12.5 V3 M5 -12 V3" stroke="rgba(0,0,0,0.12)" stroke-width="1.2"/>' +
      '<path d="M-19 4 H19 Q 20 7 17 8 H-17 Q -20 7 -19 4 Z" fill="#4a4442"/>' +
      '<path d="M10 4 Q 22 2 26 8 L 18 8 Z" fill="#4a4442"/>' +
      '<path d="M-12 8 Q -10 18 -2 19 Q 6 19 9 9" fill="none" stroke="#3a3634" stroke-width="1.4"/>' +
      '<rect x="-4" y="17" width="5" height="3" rx="1" fill="#8a8f93"/>' +
      '</g>';
  }

  // ---------- Những vật quen thuộc trên bàn (objects / apart) ----------
  function stillLife() {
    return [
      '<rect width="400" height="300" fill="url(#c2-wall)"/>',
      '<rect x="250" y="26" width="118" height="132" rx="3" fill="#fff3f6"/>',
      '<g filter="url(#wc-wash)" opacity="0.55"><circle cx="275" cy="60" r="20" fill="#c9ddb4"/><circle cx="350" cy="120" r="22" fill="#b9d3a8"/></g>',
      '<path d="M309 26 V158 M250 92 H368" stroke="#f6dfe7" stroke-width="5"/>',
      '<rect x="250" y="26" width="118" height="132" rx="3" fill="none" stroke="#fff8fa" stroke-width="6"/>',
      // đồng hồ treo tường và kệ nhỏ với chậu cây
      '<circle cx="78" cy="78" r="26" fill="#fbf4e6" stroke="#d39bab" stroke-width="4"/>',
      '<g stroke="#d39bab" stroke-width="2" stroke-linecap="round"><path d="M78 56 v4 M78 96 v4 M56 78 h4 M96 78 h4"/></g>',
      '<path d="M78 78 L78 64 M78 78 L88 84" stroke="#3a3634" stroke-width="2.4" stroke-linecap="round"/><circle cx="78" cy="78" r="2" fill="#3a3634"/>',
      '<path d="M128 140 H212" stroke="#d39bab" stroke-width="5" stroke-linecap="round"/>',
      '<path d="M134 140 l-2 -4 M206 140 l2 -4" stroke="#d39bab" stroke-width="2"/>',
      '<path d="M146 138 l2 -16 h16 l2 16 z" fill="#e58fa3"/>',
      '<g fill="#9fbf90"><ellipse cx="150" cy="114" rx="4" ry="11" transform="rotate(-24 150 114)"/><ellipse cx="162" cy="112" rx="4" ry="12" transform="rotate(20 162 112)"/><ellipse cx="156" cy="108" rx="4" ry="13"/></g>',
      '<rect x="178" y="118" width="8" height="20" rx="1" fill="#d6ad55"/><rect x="187" y="122" width="7" height="16" rx="1" fill="#7fa3a0"/><rect x="195" y="115" width="8" height="23" rx="1" fill="#c4876a" transform="rotate(8 199 138)"/>',
      '<polygon points="252,34 366,34 300,214 110,214" fill="url(#c2-beam)" opacity="0.5"/>',
      '<rect x="0" y="206" width="400" height="94" fill="url(#c2-wood)"/>',
      '<path d="M0 207 H400" stroke="#ecc3b8" stroke-width="3"/>',
      '<g stroke="#9a6b78" stroke-opacity="0.2" fill="none" stroke-width="1.2">',
        '<path d="M10 240 C 90 234, 170 248, 260 238 S 360 244, 396 238"/><path d="M0 276 C 80 270, 160 284, 250 274 S 350 280, 400 272"/>',
      '</g>',
      // hai laptop gập, xếp chồng
      '<ellipse cx="116" cy="238" rx="62" ry="5" fill="#7a4f63" opacity="0.18"/>',
      '<rect x="60" y="224" width="112" height="11" rx="2.5" fill="#8f999e"/><path d="M62 229 H170" stroke="#aeb7bb" stroke-width="1"/>',
      '<rect x="70" y="212" width="98" height="11" rx="2.5" fill="#b4bcc0"/><path d="M72 217 H166" stroke="#cdd3d6" stroke-width="1"/>',
      '<circle cx="119" cy="217.5" r="2" fill="#e8ecee"/>',
      // mũ bảo hiểm
      '<ellipse cx="230" cy="238" rx="40" ry="5" fill="#7a4f63" opacity="0.2"/>',
      helmet(228, 232, HELMET_ANH, 0, 1.8),
      // hai ly
      '<ellipse cx="320" cy="239" rx="36" ry="4" fill="#7a4f63" opacity="0.16"/>',
      '<path d="M290 200 h22 l-3 38 h-16 z" fill="#eef3f2" opacity="0.75" stroke="#bcc6c6"/>',
      '<path d="M291.4 214 h19.2 l-2 23 h-15.2 z" fill="#b5784d" opacity="0.88"/>',
      '<rect x="294" y="216" width="6" height="6" rx="1" fill="#ffffff" opacity="0.5"/><rect x="301" y="221" width="5" height="5" rx="1" fill="#ffffff" opacity="0.45"/>',
      '<path d="M306 184 L302 230" stroke="#e07a5f" stroke-width="2.4" stroke-linecap="round"/>',
      '<path d="M324 200 h22 l-3 38 h-16 z" fill="#eef3f2" opacity="0.75" stroke="#bcc6c6"/>',
      '<path d="M325.4 210 h19.2 l-2.4 27 h-14.4 z" fill="#e2bf7a" opacity="0.88"/>',
      '<rect x="328" y="214" width="6" height="6" rx="1" fill="#ffffff" opacity="0.5"/>',
      '<path d="M340 186 L336 230" stroke="#7fa3a0" stroke-width="2.4" stroke-linecap="round"/>'
    ].join('');
  }

  // ---------- Xe tay ga đỗ trước dãy nhà phố ----------
  function shophouses() {
    const houses = [
      [0, 70, 120, '#f5c9d4'], [70, 64, 92, '#f8e0c8'], [134, 72, 132, '#d9d6ee'],
      [206, 60, 104, '#f6d6dc'], [266, 70, 140, '#e8d7e6'], [336, 64, 112, '#f3cbbf']
    ];
    let s = '';
    houses.forEach(([x, w, h, c]) => {
      const top = 236 - h;
      s += '<rect x="' + x + '" y="' + top + '" width="' + w + '" height="' + h + '" fill="' + c + '"/>';
      s += '<rect x="' + x + '" y="' + top + '" width="' + w + '" height="6" fill="rgba(0,0,0,0.06)"/>';
      for (let r = 0; r < Math.floor((h - 40) / 34); r++) {
        const wy = top + 14 + r * 34;
        s += '<rect x="' + (x + w * 0.2) + '" y="' + wy + '" width="' + (w * 0.6) + '" height="20" rx="2" fill="#fff6f8" stroke="rgba(90,64,40,0.25)"/>';
        s += '<path d="M' + (x + w * 0.5) + ' ' + wy + ' V' + (wy + 20) + '" stroke="rgba(90,64,40,0.2)"/>';
        s += '<path d="M' + (x + w * 0.12) + ' ' + (wy + 24) + ' H' + (x + w * 0.88) + '" stroke="rgba(90,64,40,0.35)" stroke-width="2"/>';
      }
      s += '<rect x="' + (x + w * 0.15) + '" y="206" width="' + (w * 0.7) + '" height="30" fill="rgba(90,64,40,0.18)"/>';
    });
    return '<g filter="url(#wc-line)" opacity="0.92">' + s + '</g>';
  }

  function scooter() {
    return [
      '<ellipse cx="200" cy="252" rx="100" ry="7" fill="#8a6676" opacity="0.22"/>',
      // bánh xe
      '<circle cx="140" cy="230" r="20" fill="none" stroke="#2f2d2c" stroke-width="7"/><circle cx="140" cy="230" r="11" fill="#c8cdd0"/><circle cx="140" cy="230" r="3.5" fill="#7d858a"/>',
      '<circle cx="264" cy="230" r="20" fill="none" stroke="#2f2d2c" stroke-width="7"/><circle cx="264" cy="230" r="11" fill="#c8cdd0"/><circle cx="264" cy="230" r="3.5" fill="#7d858a"/>',
      '<path d="M140 230 L 168 214" stroke="#6e7478" stroke-width="5" stroke-linecap="round"/>',
      '<path d="M256 150 L 264 230" stroke="#6e7478" stroke-width="4" stroke-linecap="round"/>',
      '<path d="M176 236 L 168 250" stroke="#4a4442" stroke-width="2.4" stroke-linecap="round"/>',
      // thân sau
      '<path d="M108 206 C 104 178, 138 166, 176 168 L 228 170 C 238 172, 240 184, 236 194 L 226 208 C 196 214, 148 216, 120 214 Z" fill="url(#c2-body)"/>',
      '<path d="M120 190 C 140 180, 170 178, 210 180" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" opacity="0.35"/>',
      '<path d="M108 206 C 104 178, 138 166, 176 168 L 228 170" fill="none" stroke="rgba(0,0,0,0.15)" stroke-width="1"/>',
      '<rect x="104" y="192" width="9" height="7" rx="2" fill="#d9534f"/>',
      // sàn để chân
      '<path d="M170 206 L 232 204 L 238 215 L 174 217 Z" fill="#6f8a83"/>',
      // yếm trước + chắn bùn
      '<path d="M226 208 C 228 172, 236 142, 250 120 L 263 123 C 252 148, 248 178, 252 212 Z" fill="url(#c2-body)"/>',
      '<path d="M244 216 Q 264 196 286 216 L 282 219 Q 264 204 248 219 Z" fill="#8fb3a9"/>',
      '<ellipse cx="258" cy="135" rx="5" ry="7.5" fill="#fff3cc" stroke="#c9b48a"/>',
      '<circle cx="258" cy="135" r="16" fill="url(#c2-lamp)" opacity="0.6"/>',
      // yên
      '<path d="M148 168 C 160 154, 214 154, 230 164 L 228 172 L 150 174 Z" fill="#3a3634"/>',
      '<path d="M160 162 C 180 156, 206 156, 222 162" fill="none" stroke="#5a5452" stroke-width="2" stroke-linecap="round"/>',
      // cổ lái, ốp tay lái, tay nắm, gương
      '<path d="M249 106 L 263 106 L 264 124 L 250 122 Z" fill="#7fa59a"/>',
      '<path d="M236 106 L 230 104 M 276 103 L 284 101" stroke="#3a3634" stroke-width="6" stroke-linecap="round"/>',
      '<path d="M238 106 C 240 94, 270 90, 278 100 L 276 108 C 264 112, 248 112, 240 110 Z" fill="url(#c2-body)"/>',
      '<path d="M244 100 C 252 95, 266 94, 274 98" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" opacity="0.4"/>',
      '<rect x="252" y="99" width="12" height="7" rx="2" fill="#e9eef0" stroke="#7d858a" stroke-width="0.8"/>',
      '<path d="M244 98 L 238 84 M 272 96 L 278 82" stroke="#3a3634" stroke-width="2.2" stroke-linecap="round"/>',
      '<ellipse cx="237" cy="80" rx="7" ry="5" fill="#cfd8dc" stroke="#3a3634" stroke-width="1.8"/>',
      '<ellipse cx="279" cy="78" rx="7" ry="5" fill="#cfd8dc" stroke="#3a3634" stroke-width="1.8"/>',
      // mũ của anh treo trên tay lái, mũ của vợ đặt trên yên
      '<path d="M234 105 Q 232 112 234 116" stroke="#3a3634" stroke-width="1.4" fill="none"/>',
      helmet(232, 126, HELMET_ANH, -18, 1.05),
      helmet(186, 154, HELMET_EM, 6, 1.15)
    ].join('');
  }

  // ---------- Mặt bàn quán cà phê, nhìn từ trên xuống ----------
  function laptopTop(x, y) {
    return '<g transform="translate(' + x + ' ' + y + ')">' +
      '<rect x="-4" y="-6" width="118" height="128" rx="6" fill="#000" opacity="0.12"/>' +
      '<rect x="0" y="0" width="110" height="56" rx="4" fill="#cfd4d8"/>' +
      '<rect x="5" y="4" width="100" height="48" rx="2" fill="#33414c"/>' +
      '<rect x="5" y="4" width="100" height="48" rx="2" fill="url(#c2-screen-lin)" opacity="0.9"/>' +
      '<g stroke="#e8eef2" stroke-width="2" stroke-linecap="round" opacity="0.6"><path d="M14 14 H60 M14 22 H84 M14 30 H70 M14 38 H52"/></g>' +
      '<rect x="0" y="58" width="110" height="62" rx="5" fill="#dfe3e6"/>' +
      '<g fill="#c3c9cd">' + keys() + '</g>' +
      '<rect x="38" y="96" width="34" height="18" rx="3" fill="#cfd5d9"/>' +
      '</g>';
  }
  function keys() {
    let s = '';
    for (let r = 0; r < 4; r++) for (let c = 0; c < 10; c++) s += '<rect x="' + (8 + c * 9.6) + '" y="' + (64 + r * 7.2) + '" width="7.6" height="5.4" rx="1"/>';
    return s;
  }
  function glassTop(x, y, drink) {
    return '<g transform="translate(' + x + ' ' + y + ')">' +
      '<circle r="19" fill="#000" opacity="0.1" cx="2" cy="3"/>' +
      '<circle r="18" fill="#eef3f2" opacity="0.85" stroke="#c5cfcf" stroke-width="1.5"/>' +
      '<circle r="14.5" fill="' + drink + '"/>' +
      '<rect x="-8" y="-7" width="8" height="8" rx="1.5" fill="#ffffff" opacity="0.55" transform="rotate(12)"/>' +
      '<rect x="1" y="-1" width="7" height="7" rx="1.5" fill="#ffffff" opacity="0.5" transform="rotate(-18)"/>' +
      '<circle cx="5" cy="-6" r="2.4" fill="#e07a5f"/><path d="M5 -6 L 22 -22" stroke="#e07a5f" stroke-width="3" stroke-linecap="round"/>' +
      '</g>';
  }

  // Tờ giấy nhớ dán trên bàn; chữ viết tay hiện khi đã chạm đủ `k` lần.
  function stickyNote(cx, cy, rot, color, lines, k) {
    const textY = lines.length > 1 ? -2 : 5;
    return '<g transform="translate(' + cx + ' ' + cy + ') rotate(' + rot + ')">' +
      '<rect x="-47" y="-22" width="94" height="46" rx="1.5" fill="#000" opacity="0.12" transform="translate(2 3)"/>' +
      '<rect x="-47" y="-22" width="94" height="46" rx="1.5" fill="' + color + '"/>' +
      '<rect x="-47" y="-22" width="94" height="8" fill="#000" opacity="0.05"/>' +
      '<g data-tap-show="' + k + '">' +
        lines.map((s, i) => '<text x="0" y="' + (textY + i * 14) + '" text-anchor="middle" font-family="Charm, Georgia, serif" font-size="' + (lines.length > 1 ? 12.5 : 15) + '" fill="#7a4f63">' + s + '</text>').join('') +
        '<path d="M36 15 c-2.6 -2.6 -2.6 -5.2 0 -5.2 c1.3 0 2 0.8 2 1.3 c0 -0.5 0.7 -1.3 2 -1.3 c2.6 0 2.6 2.6 0 5.2 l-2 1.8 z" fill="#d97b6c"/>' +
      '</g>' +
      '</g>';
  }

  // ---------- Phòng ngủ (bedwork / sleep), nhìn từ cuối giường ----------
  // Dây đèn nhỏ trên tường; ban đêm vẽ sau lớp phủ tối để bóng đèn vẫn sáng.
  function garland(night) {
    const dots = [[124, 44], [140, 51], [156, 54], [172, 53], [188, 48], [222, 48], [238, 53], [254, 54], [270, 51], [288, 44]];
    return '<path d="M112 34 Q 160 62 206 40 Q 252 62 304 34" fill="none" stroke="' + (night ? '#4a4258' : '#a88d98') + '" stroke-width="1.2"/>' +
      '<g fill="' + (night ? '#ffe2a0' : '#f3cf8a') + '">' +
      dots.map(([x, y]) => (night ? '<circle cx="' + x + '" cy="' + y + '" r="7" opacity="0.22"/>' : '') + '<circle cx="' + x + '" cy="' + y + '" r="2.6"/>').join('') +
      '</g>';
  }
  function bedroom(night) {
    return [
      '<rect width="400" height="300" fill="url(' + (night ? '#c2-room-night' : '#c2-room') + ')"/>',
      '<rect x="22" y="40" width="74" height="96" rx="3" fill="' + (night ? '#2e3d55' : '#a9b8dc') + '"/>',
      night ? '<circle cx="74" cy="66" r="10" fill="#f6eac2"/><circle cx="79" cy="62" r="9" fill="#2e3d55"/>' +
        '<g fill="#f6eac2"><circle cx="38" cy="58" r="1.2"/><circle cx="52" cy="100" r="1"/><circle cx="84" cy="112" r="1.2"/></g>' : '',
      '<path d="M59 40 V136 M22 88 H96" stroke="#f7e3ea" stroke-width="4"/>',
      '<rect x="22" y="40" width="74" height="96" rx="3" fill="none" stroke="#fbeef2" stroke-width="5"/>',
      // dây đèn nhỏ trên tường + khung tranh
      night ? '' : garland(false),
      '<rect x="182" y="64" width="36" height="28" rx="2" fill="#f4e6cf" stroke="#c4909c" stroke-width="3"/>',
      '<path d="M200 86 C 190 78, 192 70, 200 75 C 208 70, 210 78, 200 86 Z" fill="#d97b6c"/>',
      // tủ đầu giường + đèn
      '<circle cx="352" cy="166" r="' + (night ? 46 : 62) + '" fill="url(#c2-lamp)" opacity="' + (night ? 0.55 : 1) + '"/>',
      '<rect x="324" y="198" width="58" height="64" rx="3" fill="#d7a3ad"/>',
      '<path d="M324 222 H382" stroke="#c08b97" stroke-width="1.5"/><circle cx="353" cy="212" r="2" fill="#fbe3e9"/>',
      '<path d="M340 194 h24 l-5 -24 h-14 z" fill="#f3d9a8" stroke="#d9b47c"/><path d="M352 194 v4" stroke="#9a6b78" stroke-width="2"/>',
      // đầu giường
      '<rect x="84" y="110" width="232" height="92" rx="12" fill="#d9a8b4"/>',
      '<rect x="95" y="121" width="210" height="72" rx="9" fill="#e6bcc6"/>',
      '<g stroke="#cc98a6" stroke-width="1.2" opacity="0.7"><path d="M130 124 V190 M165 124 V190 M200 124 V190 M235 124 V190 M270 124 V190"/></g>',
      // thân giường
      '<rect x="66" y="250" width="268" height="22" rx="4" fill="#c4909c"/>',
      '<path d="M76 272 v14 M324 272 v14" stroke="#b07f86" stroke-width="5" stroke-linecap="round"/>',
      // thảm
      '<ellipse cx="200" cy="292" rx="150" ry="10" fill="#e7a9b9" opacity="0.35"/>'
    ].join('');
  }
  function pillow(cx, cy, dent) {
    return '<g>' +
      '<path d="M' + (cx - 46) + ' ' + cy + ' Q' + (cx - 48) + ' ' + (cy - 20) + ' ' + (cx - 30) + ' ' + (cy - 22) + ' L' + (cx + 30) + ' ' + (cy - 22) +
      ' Q' + (cx + 48) + ' ' + (cy - 20) + ' ' + (cx + 46) + ' ' + cy + ' Q' + (cx + 48) + ' ' + (cy + 16) + ' ' + (cx + 30) + ' ' + (cy + 16) +
      ' L' + (cx - 30) + ' ' + (cy + 16) + ' Q' + (cx - 48) + ' ' + (cy + 16) + ' ' + (cx - 46) + ' ' + cy + ' Z" fill="#fffafb" stroke="#f0d5dc" stroke-width="1.2"/>' +
      (dent ? '<ellipse cx="' + (cx + dent) + '" cy="' + (cy - 2) + '" rx="20" ry="7" fill="#f3dde4" opacity="0.8"/>' : '') +
      '<path d="M' + (cx - 30) + ' ' + (cy - 14) + ' Q' + cx + ' ' + (cy - 18) + ' ' + (cx + 30) + ' ' + (cy - 14) + '" fill="none" stroke="#ffffff" stroke-width="2" opacity="0.6"/>' +
      '</g>';
  }
  function duvet(mounds) {
    const top = mounds
      ? 'M74 214 Q 110 186 150 196 Q 180 204 200 198 Q 222 190 252 196 Q 292 186 326 214'
      : 'M74 214 Q 200 196 326 214';
    return '<path d="' + top + ' L 334 254 H 66 Z" fill="url(#c2-duvet)"/>' +
      '<path d="' + top + '" fill="none" stroke="#fbd9e2" stroke-width="3" opacity="0.8"/>' +
      '<g fill="none" stroke="#d88ea3" stroke-width="1.6" opacity="0.7"><path d="M112 222 Q128 236 118 250 M288 220 Q274 236 286 250 M190 226 Q200 238 194 250"/></g>' +
      '<g fill="#fbd9e2" opacity="0.45"><circle cx="140" cy="232" r="2"/><circle cx="170" cy="242" r="2"/><circle cx="230" cy="236" r="2"/><circle cx="262" cy="244" r="2"/><circle cx="206" cy="246" r="2"/></g>';
  }
  function laptopOpen(x, y) {
    return '<g transform="translate(' + x + ' ' + y + ')">' +
      '<circle cx="0" cy="-12" r="40" fill="url(#c2-screen)" opacity="0.8"/>' +
      '<path d="M-30 -36 H30 L 27 0 H-27 Z" fill="#cfd4d8"/>' +
      '<path d="M-26 -32 H26 L 24 -3 H-24 Z" fill="#33414c"/>' +
      '<path d="M-26 -32 H26 L 24 -3 H-24 Z" fill="url(#c2-screen-lin)" opacity="0.85"/>' +
      '<g stroke="#e8eef2" stroke-width="1.6" stroke-linecap="round" opacity="0.6"><path d="M-18 -24 H6 M-18 -18 H14 M-18 -12 H2"/></g>' +
      '<path d="M-34 0 H34 L 38 7 H-38 Z" fill="#dfe3e6"/><path d="M-10 3 H10" stroke="#c3c9cd" stroke-width="2"/>' +
      '</g>';
  }
  function slippers(x, y, color) {
    return '<g transform="translate(' + x + ' ' + y + ')">' +
      '<ellipse cx="0" cy="0" rx="12" ry="4.5" fill="' + color + '"/><path d="M-5 -3 Q2 -9 8 -2" fill="none" stroke="#ffffff" stroke-width="2.4" opacity="0.6"/>' +
      '<ellipse cx="18" cy="2" rx="12" ry="4.5" fill="' + color + '"/><path d="M13 -1 Q20 -7 26 0" fill="none" stroke="#ffffff" stroke-width="2.4" opacity="0.6"/>' +
      '</g>';
  }

  function svg(titleId) {
    return [
      '<svg class="scene-art" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid meet" role="img" aria-labelledby="' + titleId + '">',
      '<title id="' + titleId + '"></title>',
      '<defs>',
        '<linearGradient id="c2-wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fbe6ec"/><stop offset="1" stop-color="#f3d3dd"/></linearGradient>',
        '<linearGradient id="c2-wood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e2b3a6"/><stop offset="1" stop-color="#c99086"/></linearGradient>',
        '<linearGradient id="c2-beam" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff4f7" stop-opacity="0.9"/><stop offset="1" stop-color="#fff4f7" stop-opacity="0"/></linearGradient>',
        '<linearGradient id="c2-morning" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fbd5df"/><stop offset="1" stop-color="#fdeef2"/></linearGradient>',
        '<linearGradient id="c2-body" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a9cbc0"/><stop offset="1" stop-color="#7fa59a"/></linearGradient>',
        '<linearGradient id="c2-table" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e8c1b6"/><stop offset="1" stop-color="#d4a39a"/></linearGradient>',
        '<linearGradient id="c2-room" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f7dfe6"/><stop offset="1" stop-color="#efcdd8"/></linearGradient>',
        '<linearGradient id="c2-room-night" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7f7699"/><stop offset="1" stop-color="#6d6488"/></linearGradient>',
        '<linearGradient id="c2-duvet" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6c1cf"/><stop offset="1" stop-color="#e8a5b8"/></linearGradient>',
        '<linearGradient id="c2-screen-lin" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6d8fb0"/><stop offset="1" stop-color="#2f3e4c"/></linearGradient>',
        '<radialGradient id="c2-lamp"><stop offset="0" stop-color="#ffdf9e" stop-opacity="0.75"/><stop offset="1" stop-color="#ffdf9e" stop-opacity="0"/></radialGradient>',
        '<radialGradient id="c2-screen"><stop offset="0" stop-color="#eaf2ff" stop-opacity="0.7"/><stop offset="1" stop-color="#eaf2ff" stop-opacity="0"/></radialGradient>',
        '<radialGradient id="c2-sun"><stop offset="0" stop-color="#fff0c4" stop-opacity="0.95"/><stop offset="1" stop-color="#fff0c4" stop-opacity="0"/></radialGradient>',
      '</defs>',
      '<rect width="400" height="300" fill="#fbeef2"/>',

      // objects + apart
      '<g data-layer="objects apart" class="scene-layer">', stillLife(), '</g>',
      '<g data-layer="apart" class="scene-layer">',
        '<rect width="400" height="300" fill="#5d86a8" opacity="0.38" style="mix-blend-mode:multiply"/>',
        '<rect width="400" height="300" fill="#dbe8f2" opacity="0.16"/>',
      '</g>',

      // ride: xe tay ga đỗ trước dãy nhà phố buổi sáng
      '<g data-layer="ride" class="scene-layer">',
        '<rect width="400" height="300" fill="url(#c2-morning)"/>',
        '<circle cx="350" cy="40" r="70" fill="url(#c2-sun)"/>',
        shophouses(),
        '<path d="M0 30 Q 200 60 400 26 M0 40 Q 200 72 400 36" fill="none" stroke="#8a6676" stroke-width="1" opacity="0.5"/>',
        // tán cây: các khối tròn chồng lên nhau, khối dưới đậm hơn (nét, không nhòe)
        '<g><circle cx="26" cy="158" r="30" fill="#a3c493"/><circle cx="56" cy="146" r="26" fill="#a3c493"/><circle cx="30" cy="134" r="28" fill="#b9d3a8"/><circle cx="60" cy="124" r="22" fill="#c9ddb4"/><circle cx="44" cy="112" r="18" fill="#d6e6c4"/>' +
          '<circle cx="36" cy="124" r="4" fill="#f4b6c6"/><circle cx="62" cy="136" r="3.5" fill="#f4b6c6"/><circle cx="20" cy="150" r="3.5" fill="#f4b6c6"/></g>',
        '<path d="M42 236 V170" stroke="#a8727f" stroke-width="6" stroke-linecap="round"/>',
        '<rect x="0" y="236" width="400" height="16" fill="#ecd9e0"/>',
        '<g stroke="#d9c6d1" stroke-width="1"><path d="M40 236 V252 M100 236 V252 M160 236 V252 M220 236 V252 M280 236 V252 M340 236 V252"/></g>',
        '<rect x="0" y="252" width="400" height="48" fill="#cdbccb"/>',
        '<path d="M20 280 h40 M110 280 h40 M200 280 h40 M290 280 h40" stroke="#fbf1f5" stroke-width="3" stroke-linecap="round"/>',
        scooter(),
      '</g>',

      // cafe: mặt bàn nhìn từ trên xuống
      '<g data-layer="cafe" class="scene-layer">',
        '<rect width="400" height="300" fill="url(#c2-table)"/>',
        '<g stroke="#b07f86" stroke-opacity="0.22" fill="none" stroke-width="1.4">',
          '<path d="M0 40 C 120 30, 260 52, 400 38 M0 110 C 140 98, 250 124, 400 108 M0 190 C 110 180, 280 204, 400 186 M0 262 C 150 252, 260 274, 400 258"/>',
        '</g>',
        '<g fill="#7a4f63" opacity="0.13" filter="url(#wc-wash)"><circle cx="40" cy="30" r="30"/><circle cx="370" cy="270" r="34"/><circle cx="330" cy="20" r="18"/><circle cx="60" cy="260" r="20"/></g>',
        laptopTop(62, 92),
        laptopTop(218, 92),
        glassTop(192, 70, '#b5784d'),
        glassTop(356, 146, '#e2bf7a'),
        // chậu cây nhỏ nhìn từ trên
        '<g transform="translate(206 230)"><circle r="20" fill="#e58fa3"/><circle r="16" fill="#a8727f"/>' +
          '<g fill="#9fbf90"><ellipse rx="6" ry="14" transform="rotate(0)"/><ellipse rx="6" ry="14" transform="rotate(60)"/><ellipse rx="6" ry="14" transform="rotate(120)"/></g>' +
          '<g fill="#b9d3a8"><ellipse rx="4" ry="10" transform="rotate(30)"/><ellipse rx="4" ry="10" transform="rotate(90)"/><ellipse rx="4" ry="10" transform="rotate(150)"/></g></g>',
        // ba tờ giấy nhớ — chữ hiện dần khi chạm (nhịp "cafe": [data-tap-show])
        stickyNote(62, 250, -6, '#fbe7a1', ['Mũi em cao'], 1),
        stickyNote(142, 268, 4, '#f6cdbf', ['Mắt em to'], 2),
        stickyNote(292, 256, -3, '#d7e8c8', ['Thi thoảng', 'hơi nhăn nhăn'], 3),
        '<rect width="400" height="300" fill="url(#c2-lamp)" opacity="0.35"/>',
      '</g>',

      // bedwork: hai laptop mở sáng trên giường
      '<g data-layer="bedwork" class="scene-layer">',
        bedroom(false),
        pillow(160, 176), pillow(240, 176),
        duvet(false),
        laptopOpen(160, 226), laptopOpen(240, 226),
        '<g transform="translate(336 192)"><rect x="0" y="-12" width="12" height="13" rx="2" fill="#f2ede4"/><path d="M12 -8 q5 0 5 4 q0 4 -5 4" fill="none" stroke="#f2ede4" stroke-width="2"/></g>',
      '</g>',

      // sleep: đêm, hai gối sát nhau, chăn phồng, laptop đã gập trên tủ
      '<g data-layer="sleep" class="scene-layer">',
        bedroom(true),
        pillow(168, 176, 6), pillow(232, 176, -6),
        duvet(true),
        '<rect x="330" y="189" width="46" height="5" rx="1.5" fill="#8f999e"/><rect x="333" y="184" width="40" height="5" rx="1.5" fill="#b4bcc0"/>',
        slippers(96, 284, '#b9cbd6'), slippers(262, 286, '#e7b49a'),
        '<rect width="400" height="300" fill="#2f3b52" opacity="0.18" style="mix-blend-mode:multiply"/>',
        garland(true),
      '</g>',

      '</svg>'
    ].join('');
  }

  NNBT.art = NNBT.art || {};
  NNBT.art.ch2 = { svg };
})(window.NNBT);

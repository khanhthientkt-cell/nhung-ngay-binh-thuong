/*
 * ch2-days.js — Minh họa Chương 2: Những ngày chẳng có gì đặc biệt.
 *
 * Một SVG, mỗi lớp [data-layer] là một cảnh trọn vẹn (có nền riêng), bật/tắt theo nhịp truyện.
 * Tông ấm cho những ngày ở cạnh nhau; nhịp cuối phủ một lớp xanh dịu (khoảng cách).
 *
 * CHỈ minh họa các sự việc trong bản mô tả, không thêm chi tiết:
 *   objects — những vật quen thuộc trên bàn: hai chiếc laptop gập, mũ bảo hiểm, hai chiếc ly
 *   ride    — anh chở vợ trên xe máy (đi làm / đón về)
 *   cafe    — hai người ngồi cạnh nhau ở quán cà phê, mỗi người một laptop (nhìn từ phía sau)
 *   bedwork — về nhà, cả hai làm việc trên giường (nắp laptop che mặt, không vẽ khuôn mặt)
 *   sleep   — xong việc, laptop gập lại, hai người ôm nhau ngủ
 *   apart   — lại những vật quen thuộc, dưới ánh sáng xanh dịu (đoạn suy ngẫm)
 * Không vẽ khuôn mặt. Màu áo giữ giống Chương 1: anh xanh than, vợ nâu đỏ nhạt.
 *
 * QUYẾT ĐỊNH HÌNH ẢNH ĐÃ DUYỆT — không đổi nếu không có yêu cầu mới:
 *   - ride:  xe máy tay ga, anh lái, vợ ngồi sau.
 *   - mũ bảo hiểm: anh cam đất (#c9774f), vợ vàng mù tạt (#d6ad55) — lựa chọn tạo hình, không phải màu mũ thật.
 *   - cafe:  vợ ngồi bên trái, anh bên phải.
 *   - sleep: anh ôm vợ từ phía sau dưới chăn.
 */
window.NNBT = window.NNBT || {};

(function (NNBT) {
  'use strict';

  const INK = '#3c3a39';
  const HAIR = '#2b2522';
  const ANH = '#4f5d6e';
  const ANH_DARK = '#3e4a58';
  const EM = '#c4876a';
  const EM_DARK = '#a56d54';

  // ---------- Những vật quen thuộc trên bàn (dùng cho "objects" và "apart") ----------
  function stillLife() {
    return [
      '<rect width="400" height="300" fill="url(#c2-wall)"/>',
      // Ô cửa sổ sáng phía sau và vệt nắng
      '<rect x="250" y="26" width="118" height="132" rx="3" fill="#fbecc9"/>',
      '<path d="M309 26 V158 M250 92 H368" stroke="#f5e3c2" stroke-width="5"/>',
      '<rect x="250" y="26" width="118" height="132" rx="3" fill="none" stroke="#f9f0de" stroke-width="6"/>',
      '<polygon points="252,34 366,34 300,214 110,214" fill="url(#c2-beam)" opacity="0.5"/>',
      // Bàn gỗ
      '<rect x="0" y="206" width="400" height="94" fill="url(#c2-wood)"/>',
      '<path d="M0 207 H400" stroke="#dcae7f" stroke-width="3"/>',
      '<g stroke="#6f4729" stroke-opacity="0.2" fill="none" stroke-width="1.2" filter="url(#wc-line)">',
        '<path d="M10 240 C 90 234, 170 248, 260 238 S 360 244, 396 238"/><path d="M0 276 C 80 270, 160 284, 250 274 S 350 280, 400 272"/>',
      '</g>',
      // Hai chiếc laptop gập, xếp chồng
      '<ellipse cx="116" cy="238" rx="62" ry="5" fill="#5a3a22" opacity="0.18"/>',
      '<rect x="60" y="224" width="112" height="11" rx="2.5" fill="#8f999e"/>',
      '<path d="M62 229 H170" stroke="#aeb7bb" stroke-width="1"/>',
      '<rect x="70" y="212" width="98" height="11" rx="2.5" fill="#b4bcc0"/>',
      '<path d="M72 217 H166" stroke="#cdd3d6" stroke-width="1"/>',
      // Mũ bảo hiểm
      '<ellipse cx="230" cy="238" rx="38" ry="5" fill="#5a3a22" opacity="0.2"/>',
      '<path d="M196 236 Q196 196 228 194 Q262 196 262 230 L262 236 Z" fill="#c9774f" filter="url(#wc-line)"/>',
      '<path d="M228 195 Q236 214 234 236" stroke="#fff3e0" stroke-width="3" fill="none" opacity="0.35"/>',
      '<path d="M246 212 Q264 210 268 226 L249 227 Z" fill="#56656d" opacity="0.85"/>',
      '<path d="M206 236 q4 9 15 8" stroke="#4a3f38" stroke-width="1.6" fill="none" stroke-linecap="round"/>',
      // Hai chiếc ly
      '<ellipse cx="318" cy="239" rx="34" ry="4" fill="#5a3a22" opacity="0.16"/>',
      '<path d="M290 204 h22 l-3 34 h-16 z" fill="#eef3f2" opacity="0.75" stroke="#bcc6c6"/>',
      '<path d="M291.3 218 h19.4 l-1.8 19 h-15.8 z" fill="#b5784d" opacity="0.85"/>',
      '<path d="M322 204 h22 l-3 34 h-16 z" fill="#eef3f2" opacity="0.75" stroke="#bcc6c6"/>',
      '<path d="M323.3 214 h19.4 l-2.1 23 h-15.2 z" fill="#e2bf7a" opacity="0.85"/>'
    ].join('');
  }

  // ---------- Người ngồi trên xe máy, nhìn nghiêng (gốc ở hông) ----------
  function rider(x, y, coat, dark, helmet, longHair, armTo) {
    let s = '';
    s += '<path d="M' + x + ' ' + y + ' L' + (x + 15) + ' ' + (y + 10) + ' L' + (x + 17) + ' ' + (y + 30) + '" stroke="' + INK + '" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>';
    s += '<path d="M' + (x - 9) + ' ' + y + ' Q' + (x - 6) + ' ' + (y - 22) + ' ' + (x + 6) + ' ' + (y - 38) + ' L' + (x + 16) + ' ' + (y - 34) + ' Q' + (x + 12) + ' ' + (y - 16) + ' ' + (x + 9) + ' ' + (y + 2) + ' Z" fill="' + coat + '"/>';
    s += '<path d="M' + (x + 10) + ' ' + (y - 30) + ' L' + armTo[0] + ' ' + armTo[1] + '" stroke="' + dark + '" stroke-width="4.5" fill="none" stroke-linecap="round"/>';
    const hx = x + 12;
    const hy = y - 48;
    if (longHair) s += '<path d="M' + (hx - 8) + ' ' + (hy - 2) + ' Q' + (hx - 11) + ' ' + (hy + 14) + ' ' + (hx - 4) + ' ' + (hy + 18) + ' L' + (hx + 2) + ' ' + (hy + 6) + ' Z" fill="' + HAIR + '"/>';
    s += '<circle cx="' + hx + '" cy="' + hy + '" r="8" fill="' + HAIR + '"/>';
    s += '<path d="M' + (hx - 10) + ' ' + (hy + 1) + ' Q' + (hx - 10) + ' ' + (hy - 13) + ' ' + hx + ' ' + (hy - 13) + ' Q' + (hx + 10) + ' ' + (hy - 13) + ' ' + (hx + 10) + ' ' + (hy + 1) + ' Z" fill="' + helmet + '"/>';
    return s;
  }

  // ---------- Người nhìn từ phía sau (quán cà phê) ----------
  function backView(x, coat, longHair) {
    let s = '';
    s += '<path d="M' + (x - 46) + ' 300 Q' + (x - 48) + ' 242 ' + (x - 30) + ' 224 Q' + x + ' 212 ' + (x + 30) + ' 224 Q' + (x + 48) + ' 242 ' + (x + 46) + ' 300 Z" fill="' + coat + '"/>';
    s += '<rect x="' + (x - 7) + '" y="206" width="14" height="14" fill="#d9a98a"/>';
    s += '<circle cx="' + x + '" cy="194" r="21" fill="' + HAIR + '"/>';
    if (longHair) s += '<path d="M' + (x - 21) + ' 196 Q' + (x - 22) + ' 236 ' + (x - 12) + ' 248 L' + (x + 12) + ' 248 Q' + (x + 22) + ' 236 ' + (x + 21) + ' 196 Z" fill="' + HAIR + '"/>';
    return s;
  }

  // ---------- Phòng ngủ (dùng cho "bedwork" và "sleep") ----------
  function bedroom() {
    return [
      '<rect width="400" height="300" fill="url(#c2-room)"/>',
      // Cửa sổ đêm
      '<rect x="22" y="40" width="70" height="92" rx="3" fill="#5d7189"/>',
      '<path d="M57 40 V132 M22 86 H92" stroke="#e7d5be" stroke-width="4"/>',
      '<rect x="22" y="40" width="70" height="92" rx="3" fill="none" stroke="#efe1cc" stroke-width="5"/>',
      // Đèn ngủ và tủ đầu giường
      '<circle cx="352" cy="168" r="60" fill="url(#c2-lamp)"/>',
      '<rect x="326" y="200" width="54" height="62" rx="3" fill="#a9774f"/>',
      '<path d="M342 196 h20 l-4 -22 h-12 z" fill="#f3d9a8"/><path d="M352 196 v4" stroke="#6f4729" stroke-width="2"/>',
      // Đầu giường, gối
      '<rect x="88" y="112" width="224" height="88" rx="10" fill="#b4875f"/>',
      '<rect x="98" y="122" width="204" height="70" rx="8" fill="#c39a72"/>',
      '<ellipse cx="160" cy="176" rx="44" ry="15" fill="#f7efe3"/>',
      '<ellipse cx="240" cy="176" rx="44" ry="15" fill="#f7efe3"/>',
      // Thân giường
      '<rect x="70" y="250" width="260" height="22" rx="4" fill="#9a6d47"/>',
      '<path d="M80 272 v14 M320 272 v14" stroke="#7d5536" stroke-width="5" stroke-linecap="round"/>'
    ].join('');
  }

  function svg(titleId) {
    return [
      '<svg class="scene-art" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid meet" role="img" aria-labelledby="' + titleId + '">',
      '<title id="' + titleId + '"></title>',
      '<defs>',
        '<linearGradient id="c2-wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4e5ca"/><stop offset="1" stop-color="#e9d1ab"/></linearGradient>',
        '<linearGradient id="c2-wood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c48f5f"/><stop offset="1" stop-color="#966641"/></linearGradient>',
        '<linearGradient id="c2-beam" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff4d2" stop-opacity="0.9"/><stop offset="1" stop-color="#fff4d2" stop-opacity="0"/></linearGradient>',
        '<linearGradient id="c2-morning" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f7dcb6"/><stop offset="1" stop-color="#f3eadb"/></linearGradient>',
        '<linearGradient id="c2-cafe" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d8b48a"/><stop offset="1" stop-color="#c79d73"/></linearGradient>',
        '<linearGradient id="c2-room" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e6d0b6"/><stop offset="1" stop-color="#d9bd9c"/></linearGradient>',
        '<radialGradient id="c2-lamp"><stop offset="0" stop-color="#ffdf9e" stop-opacity="0.75"/><stop offset="1" stop-color="#ffdf9e" stop-opacity="0"/></radialGradient>',
        '<radialGradient id="c2-screen"><stop offset="0" stop-color="#f4f8ff" stop-opacity="0.8"/><stop offset="1" stop-color="#f4f8ff" stop-opacity="0"/></radialGradient>',
      '</defs>',
      '<rect width="400" height="300" fill="#efe3cf"/>',

      // objects + apart: những vật quen thuộc
      '<g data-layer="objects apart" class="scene-layer">', stillLife(), '</g>',
      // apart: phủ xanh dịu (khoảng cách)
      '<g data-layer="apart" class="scene-layer">',
        '<rect width="400" height="300" fill="#5d86a8" opacity="0.38" style="mix-blend-mode:multiply"/>',
        '<rect width="400" height="300" fill="#dbe8f2" opacity="0.16"/>',
      '</g>',

      // ride: anh chở vợ trên xe máy
      '<g data-layer="ride" class="scene-layer">',
        '<rect width="400" height="300" fill="url(#c2-morning)"/>',
        '<g filter="url(#wc-wash)" opacity="0.55">',
          '<path d="M0 200 V150 h40 v-30 h36 v40 h30 v-55 h42 v45 h34 v-25 h40 v50 h38 v-38 h44 v30 h34 v-20 h62 V200 Z" fill="#e2c8a6"/>',
        '</g>',
        '<g filter="url(#wc-wash)" opacity="0.6"><circle cx="40" cy="190" r="26" fill="#b9c79c"/><circle cx="362" cy="186" r="30" fill="#b3c497"/></g>',
        '<rect x="0" y="206" width="400" height="94" fill="#c4baab"/>',
        '<path d="M0 207 H400" stroke="#d8cfc1" stroke-width="3"/>',
        '<path d="M20 268 h40 M110 268 h40 M200 268 h40 M290 268 h40" stroke="#efe7da" stroke-width="3" stroke-linecap="round"/>',
        '<path d="M60 222 h44 M44 236 h36 M70 248 h30" stroke="#a69b8b" stroke-width="1.6" stroke-linecap="round" opacity="0.6"/>',
        // Xe máy (xe tay ga, nhìn nghiêng, hướng sang phải)
        '<ellipse cx="205" cy="258" rx="84" ry="5" fill="#6b5a4a" opacity="0.2"/>',
        '<circle cx="152" cy="240" r="17" fill="none" stroke="' + INK + '" stroke-width="6"/><circle cx="152" cy="240" r="4" fill="' + INK + '"/>',
        '<circle cx="264" cy="240" r="17" fill="none" stroke="' + INK + '" stroke-width="6"/><circle cx="264" cy="240" r="4" fill="' + INK + '"/>',
        '<path d="M258 206 L264 240" stroke="' + INK + '" stroke-width="3.5" stroke-linecap="round"/>',
        '<path d="M128 236 Q128 206 168 200 L232 200 Q240 214 236 228 L172 230 Q158 240 128 236 Z" fill="#8fa6b0"/>',
        '<path d="M172 230 L236 228 L240 237 L176 239 Z" fill="#6f8692"/>',
        '<path d="M236 228 Q240 194 256 174 L268 179 Q253 204 255 232 Z" fill="#8fa6b0"/>',
        '<path d="M134 222 Q150 214 170 216" stroke="#a9bcc5" stroke-width="2" fill="none" opacity="0.8"/>',
        '<path d="M160 200 Q192 191 230 196 L230 203 H160 Z" fill="' + INK + '"/>',
        '<path d="M260 176 L266 158 L280 160" stroke="' + INK + '" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
        '<circle cx="265" cy="186" r="4.5" fill="#f2d08a"/>',
        // vợ ngồi sau, anh lái
        rider(180, 200, EM, EM_DARK, '#d6ad55', true, [206, 180]),
        rider(214, 200, ANH, ANH_DARK, '#c9774f', false, [276, 162]),
      '</g>',

      // cafe: hai người ngồi cạnh nhau, nhìn từ phía sau
      '<g data-layer="cafe" class="scene-layer">',
        '<rect width="400" height="300" fill="url(#c2-cafe)"/>',
        '<rect x="34" y="30" width="332" height="118" rx="4" fill="#f0dcb6"/>',
        '<g filter="url(#wc-wash)" opacity="0.7"><circle cx="70" cy="110" r="34" fill="#9fb58a"/><circle cx="330" cy="100" r="40" fill="#a9bd90"/><circle cx="200" cy="130" r="26" fill="#b6c79c"/></g>',
        '<path d="M145 30 V148 M255 30 V148" stroke="#c9a27a" stroke-width="5"/>',
        '<rect x="34" y="30" width="332" height="118" rx="4" fill="none" stroke="#b88f66" stroke-width="6"/>',
        '<path d="M205 0 V36" stroke="#5a4636" stroke-width="2"/><path d="M190 48 h30 l-6 -12 h-18 z" fill="#5a4636"/>',
        '<circle cx="205" cy="56" r="40" fill="url(#c2-lamp)"/>',
        // Bàn
        '<rect x="0" y="176" width="400" height="124" fill="#8a5d3b"/>',
        '<path d="M0 177 H400" stroke="#a9774f" stroke-width="3"/>',
        // Hai laptop mở (thấy màn hình) và hai ly
        '<circle cx="146" cy="160" r="44" fill="url(#c2-screen)"/>',
        '<rect x="112" y="138" width="66" height="42" rx="3" fill="#e8eef2"/><rect x="104" y="179" width="82" height="5" rx="2" fill="#9aa3a8"/>',
        '<circle cx="276" cy="160" r="44" fill="url(#c2-screen)"/>',
        '<rect x="242" y="138" width="66" height="42" rx="3" fill="#e8eef2"/><rect x="234" y="179" width="82" height="5" rx="2" fill="#9aa3a8"/>',
        '<path d="M200 156 h16 l-2 26 h-12 z" fill="#eef3f2" opacity="0.8" stroke="#c7cfcf"/><path d="M201 166 h14 l-1.4 15 h-11.2 z" fill="#b5784d" opacity="0.85"/>',
        '<path d="M336 156 h16 l-2 26 h-12 z" fill="#eef3f2" opacity="0.8" stroke="#c7cfcf"/><path d="M337 163 h14 l-1.6 18 h-10.8 z" fill="#e2bf7a" opacity="0.85"/>',
        // Hai người (vợ bên trái, anh bên phải)
        backView(160, EM, true),
        backView(262, ANH, false),
      '</g>',

      // bedwork: về nhà, làm việc trên giường
      '<g data-layer="bedwork" class="scene-layer">',
        bedroom(),
        // đầu hai người (chỉ thấy tóc phía trên nắp laptop)
        '<circle cx="164" cy="150" r="16" fill="' + HAIR + '"/>',
        '<path d="M148 152 Q146 176 154 186 L174 186 Q182 176 180 152 Z" fill="' + HAIR + '"/>',
        '<circle cx="238" cy="150" r="16" fill="' + HAIR + '"/>',
        '<path d="M150 182 h28 v40 h-28z" fill="' + EM + '"/><path d="M224 180 h28 v42 h-28z" fill="' + ANH + '"/>',
        // chăn đắp chân
        '<path d="M86 214 Q200 196 314 214 L322 252 H78 Z" fill="#e7b49a"/>',
        '<path d="M120 222 Q140 238 128 250 M260 220 Q248 236 262 250" stroke="#cf977b" stroke-width="2" fill="none"/>',
        // nắp laptop mở (che mặt), ánh màn hình
        '<circle cx="164" cy="162" r="36" fill="url(#c2-screen)" opacity="0.6"/>',
        '<circle cx="238" cy="162" r="36" fill="url(#c2-screen)" opacity="0.6"/>',
        '<rect x="138" y="144" width="52" height="40" rx="3" fill="#aeb6bb"/><rect x="134" y="182" width="60" height="6" rx="2" fill="#8f999e"/>',
        '<rect x="212" y="144" width="52" height="40" rx="3" fill="#aeb6bb"/><rect x="208" y="182" width="60" height="6" rx="2" fill="#8f999e"/>',
      '</g>',

      // sleep: nhìn nghiêng từ cạnh giường — laptop đã gập trên tủ, hai người nằm ôm nhau dưới chăn
      '<g data-layer="sleep" class="scene-layer">',
        '<rect width="400" height="300" fill="url(#c2-room)"/>',
        '<rect x="160" y="40" width="70" height="92" rx="3" fill="#5d7189"/>',
        '<path d="M195 40 V132 M160 86 H230" stroke="#e7d5be" stroke-width="4"/>',
        '<rect x="160" y="40" width="70" height="92" rx="3" fill="none" stroke="#efe1cc" stroke-width="5"/>',
        // tủ đầu giường bên phải, đèn dịu, hai laptop gập
        '<circle cx="352" cy="168" r="54" fill="url(#c2-lamp)" opacity="0.7"/>',
        '<rect x="326" y="200" width="54" height="62" rx="3" fill="#a9774f"/>',
        '<path d="M342 196 h20 l-4 -22 h-12 z" fill="#f3d9a8"/><path d="M352 196 v4" stroke="#6f4729" stroke-width="2"/>',
        '<rect x="330" y="191" width="44" height="5" rx="1.5" fill="#8f999e"/><rect x="333" y="186" width="38" height="5" rx="1.5" fill="#b4bcc0"/>',
        // giường nhìn nghiêng: đầu giường bên trái
        '<rect x="40" y="132" width="16" height="122" rx="4" fill="#9a6d47"/>',
        '<rect x="52" y="214" width="262" height="18" rx="4" fill="#f4ebdf"/>',
        '<rect x="52" y="230" width="262" height="22" rx="3" fill="#9a6d47"/>',
        '<path d="M60 252 v18 M306 252 v18" stroke="#7d5536" stroke-width="5" stroke-linecap="round"/>',
        '<ellipse cx="96" cy="206" rx="36" ry="10" fill="#f7efe3"/>',
        // hai mái đầu trên gối: anh phía sau, vợ phía trước (tóc dài xõa trên gối)
        '<circle cx="88" cy="186" r="12" fill="' + HAIR + '"/>',
        '<path d="M70 204 Q78 190 100 192 Q112 198 108 206 Z" fill="' + HAIR + '"/>',
        '<circle cx="104" cy="194" r="12" fill="' + HAIR + '"/>',
        // chăn phủ cả hai, hai dáng người nằm nghiêng
        '<path d="M108 210 Q120 182 160 186 Q200 176 236 190 Q276 186 300 202 L310 222 H104 Z" fill="#e7b49a"/>',
        '<path d="M150 200 Q190 194 230 204 M240 206 Q268 202 292 212" stroke="#cf977b" stroke-width="2" fill="none"/>',
        // vòng tay của anh ôm qua vợ, trên mép chăn
        '<path d="M100 186 Q128 176 150 190" stroke="#5f6f82" stroke-width="7" fill="none" stroke-linecap="round"/>',
        '<circle cx="152" cy="191" r="4" fill="#d9a98a"/>',
        // đêm: tối hơn, đèn dịu
        '<rect width="400" height="300" fill="#2f3b52" opacity="0.3" style="mix-blend-mode:multiply"/>',
      '</g>',

      '</svg>'
    ].join('');
  }

  NNBT.art = NNBT.art || {};
  NNBT.art.ch2 = { svg };
})(window.NNBT);

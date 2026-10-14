/*
 * postcard.js — Vẽ bưu thiếp bằng Canvas 2D (không chụp DOM, không thư viện ngoài).
 *
 * Vì sao Canvas thay vì chụp DOM:
 *   - Kiểm soát được font tiếng Việt: chờ font tải xong (document.fonts.load) rồi mới vẽ.
 *   - Không dùng ảnh/SVG ngoài → canvas không bị "tainted", toBlob luôn xuất được ảnh.
 *   - Ảnh xuất ra giống hệt bản xem trước trên mọi máy.
 *
 * API:
 *   NNBT.postcard.render(canvas, { trip, tripLine, place, message, texts }) → Promise<canvas>
 *   NNBT.postcard.toBlob(canvas) → Promise<Blob>
 *   NNBT.postcard.SIZE = { w, h }
 */
window.NNBT = window.NNBT || {};

(function (NNBT) {
  'use strict';

  const W = 1080;
  const H = 1350;
  const FONT_BODY = '"Be Vietnam Pro", system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif';
  const FONT_HAND = '"Charm", "Palatino Linotype", Palatino, Georgia, "Noto Serif", serif';

  const INK = '#3a2e27';
  const INK_SOFT = '#64544a';
  const WARM_DEEP = '#9c4f2d';

  const STAMP_COLORS = { slow: '#d98a63', new: '#7aa39a', aurora: '#3f6c8a', custom: '#c9a24f' };

  // ---------- Tiện ích ----------

  function rng(seed) {
    let s = seed >>> 0;
    return () => {
      s = (s * 1664525 + 1013904223) >>> 0;
      return s / 4294967296;
    };
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  // Mảng màu loang: vài hình elip trong suốt chồng lệch nhau
  function wash(ctx, rand, x, y, rx, ry, color, alpha) {
    ctx.save();
    ctx.fillStyle = color;
    for (let i = 0; i < 5; i++) {
      ctx.globalAlpha = alpha * (0.28 + 0.2 * rand());
      ctx.beginPath();
      ctx.ellipse(
        x + (rand() - 0.5) * rx * 0.3, y + (rand() - 0.5) * ry * 0.3,
        rx * (0.82 + 0.3 * rand()), ry * (0.82 + 0.3 * rand()),
        (rand() - 0.5) * 0.5, 0, Math.PI * 2
      );
      ctx.fill();
    }
    ctx.restore();
  }

  // Ngắt dòng theo độ rộng; từ quá dài thì cắt theo ký tự.
  function wrap(ctx, text, maxW) {
    const lines = [];
    String(text).split('\n').forEach((para) => {
      const words = para.split(/\s+/).filter(Boolean);
      let line = '';
      words.forEach((word) => {
        const test = line ? line + ' ' + word : word;
        if (ctx.measureText(test).width <= maxW) {
          line = test;
          return;
        }
        if (line) lines.push(line);
        if (ctx.measureText(word).width <= maxW) {
          line = word;
          return;
        }
        // Từ dài hơn cả dòng
        let chunk = '';
        Array.from(word).forEach((ch) => {
          if (ctx.measureText(chunk + ch).width > maxW) {
            lines.push(chunk);
            chunk = ch;
          } else chunk += ch;
        });
        line = chunk;
      });
      lines.push(line);
    });
    return lines;
  }

  function ellipsize(ctx, text, maxW) {
    if (ctx.measureText(text).width <= maxW) return text;
    let t = Array.from(text);
    while (t.length && ctx.measureText(t.join('') + '…').width > maxW) t.pop();
    return t.join('') + '…';
  }

  // Chờ font có ký tự tiếng Việt tải xong (tối đa ~3 giây), không bao giờ làm hỏng việc vẽ.
  function ensureFonts(sample) {
    if (!document.fonts || !document.fonts.load) return Promise.resolve();
    const loads = [
      document.fonts.load('400 66px "Charm"', sample),
      document.fonts.load('400 34px "Be Vietnam Pro"', sample),
      document.fonts.load('500 24px "Be Vietnam Pro"', sample)
    ];
    const timeout = new Promise((resolve) => setTimeout(resolve, 3000));
    return Promise.race([Promise.all(loads), timeout]).catch(() => {});
  }

  // ---------- Tranh theo kiểu chuyến đi (vẽ trong khung w×h) ----------

  const ART = {
    // Một chuyến đi thật chậm: con đường chiều, cây, bàn cà phê với hai chiếc ly
    slow(ctx, w, h, rand) {
      let g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, '#f8d6ab');
      g.addColorStop(0.6, '#fbeedd');
      g.addColorStop(1, '#f3dcc0');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      g = ctx.createRadialGradient(700, 150, 10, 700, 150, 190);
      g.addColorStop(0, 'rgba(255,227,160,0.95)');
      g.addColorStop(1, 'rgba(255,227,160,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      wash(ctx, rand, 220, 330, 330, 90, '#e2a982', 0.9);
      wash(ctx, rand, 720, 340, 380, 100, '#ebbf98', 0.9);
      ctx.fillStyle = '#f1d9bb';
      ctx.fillRect(0, 350, w, h - 350);
      // con đường uốn
      ctx.save();
      ctx.lineCap = 'round';
      ctx.strokeStyle = 'rgba(250,238,215,0.95)';
      ctx.lineWidth = 78;
      ctx.beginPath();
      ctx.moveTo(360, h + 20);
      ctx.bezierCurveTo(420, 520, 640, 470, 560, 400);
      ctx.bezierCurveTo(500, 350, 470, 340, 520, 320);
      ctx.stroke();
      ctx.strokeStyle = '#ddb98d';
      ctx.lineWidth = 3;
      ctx.setLineDash([14, 16]);
      ctx.stroke();
      ctx.restore();
      // cây
      wash(ctx, rand, 150, 400, 90, 120, '#a9bd8d', 1);
      wash(ctx, rand, 860, 380, 80, 110, '#b3c597', 1);
      ctx.strokeStyle = '#7d5a3f';
      ctx.lineWidth = 6;
      ctx.beginPath(); ctx.moveTo(150, 470); ctx.lineTo(150, 540); ctx.moveTo(860, 450); ctx.lineTo(860, 520); ctx.stroke();
      // bàn cà phê, hai chiếc ly
      ctx.fillStyle = '#a97a52';
      ctx.beginPath(); ctx.ellipse(730, 540, 140, 28, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#8a6040';
      ctx.fillRect(722, 560, 16, 50);
      [[690, '#b5784d'], [770, '#e2bf7a']].forEach(([x, drink]) => {
        ctx.fillStyle = 'rgba(245,249,248,0.9)';
        ctx.beginPath(); ctx.moveTo(x - 22, 470); ctx.lineTo(x + 22, 470); ctx.lineTo(x + 17, 532); ctx.lineTo(x - 17, 532); ctx.closePath(); ctx.fill();
        ctx.fillStyle = drink;
        ctx.beginPath(); ctx.moveTo(x - 20, 490); ctx.lineTo(x + 20, 490); ctx.lineTo(x + 17, 530); ctx.lineTo(x - 17, 530); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = 'rgba(160,130,100,0.5)';
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(x - 6, 455); ctx.bezierCurveTo(x - 16, 440, x + 4, 430, x - 6, 412); ctx.stroke();
      });
    },

    // Một nơi mới: tấm bản đồ mở ra, đường chấm dẫn tới một ngôi sao
    new(ctx, w, h, rand) {
      let g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, '#d7e6e2');
      g.addColorStop(1, '#eef3ec');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = 'rgba(160,188,180,0.7)';
      [[120, 300, 160], [330, 290, 210], [600, 300, 180], [830, 280, 220]].forEach(([x, base, hh]) => {
        ctx.beginPath(); ctx.moveTo(x - hh, base); ctx.lineTo(x, base - hh * 0.8); ctx.lineTo(x + hh, base); ctx.closePath(); ctx.fill();
      });
      wash(ctx, rand, 476, 300, 520, 60, '#f4f7f2', 1);
      // bản đồ gấp ba
      const panels = [['#f7eedb', [[226, 330], [386, 300], [386, 560], [226, 590]]],
        ['#ecdcc0', [[386, 300], [566, 330], [566, 590], [386, 560]]],
        ['#f7eedb', [[566, 330], [726, 300], [726, 560], [566, 590]]]];
      panels.forEach(([c, pts]) => {
        ctx.fillStyle = c;
        ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); ctx.fill();
      });
      wash(ctx, rand, 330, 470, 80, 50, '#cfe0c4', 0.9);
      wash(ctx, rand, 640, 420, 70, 60, '#cfe0c4', 0.9);
      ctx.save();
      ctx.strokeStyle = WARM_DEEP;
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      ctx.setLineDash([2, 16]);
      ctx.beginPath(); ctx.moveTo(260, 540); ctx.bezierCurveTo(360, 420, 470, 560, 560, 450); ctx.bezierCurveTo(610, 390, 640, 400, 660, 380); ctx.stroke();
      ctx.restore();
      star(ctx, 670, 372, 26, 11, '#e9b85c');
      // la bàn
      ctx.strokeStyle = '#6f8e86'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(830, 120, 48, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = '#9c4f2d';
      ctx.beginPath(); ctx.moveTo(830, 78); ctx.lineTo(842, 120); ctx.lineTo(818, 120); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#6f8e86';
      ctx.beginPath(); ctx.moveTo(830, 162); ctx.lineTo(842, 120); ctx.lineTo(818, 120); ctx.closePath(); ctx.fill();
    },

    // Dưới bầu trời cực quang: trời đêm, dải cực quang, hai người ngồi trên đồi nhìn từ phía sau
    aurora(ctx, w, h, rand) {
      let g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, '#0e1f33');
      g.addColorStop(1, '#2a4a63');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 140; i++) {
        ctx.globalAlpha = 0.35 + 0.6 * rand();
        ctx.fillStyle = '#f3f6ff';
        ctx.beginPath(); ctx.arc(rand() * w, rand() * h * 0.7, 0.8 + rand() * 1.8, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.lineCap = 'round';
      [[90, 170, 0.5], [70, 240, 0.4], [110, 120, 0.3]].forEach(([lw, y0, a]) => {
        const lg = ctx.createLinearGradient(0, 0, w, 0);
        lg.addColorStop(0, 'rgba(110,230,180,0)');
        lg.addColorStop(0.35, 'rgba(110,230,180,' + a + ')');
        lg.addColorStop(0.7, 'rgba(140,170,250,' + a * 0.8 + ')');
        lg.addColorStop(1, 'rgba(140,170,250,0)');
        ctx.strokeStyle = lg;
        ctx.lineWidth = lw;
        ctx.shadowColor = 'rgba(110,230,180,0.6)';
        ctx.shadowBlur = 40;
        ctx.beginPath();
        ctx.moveTo(-40, y0 + 60);
        ctx.bezierCurveTo(240, y0 - 80, 520, y0 + 110, 980, y0 - 40);
        ctx.stroke();
      });
      ctx.restore();
      // đồi tuyết
      ctx.fillStyle = '#1c3146';
      ctx.beginPath(); ctx.moveTo(0, 470); ctx.bezierCurveTo(260, 410, 600, 420, w, 480); ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(190,215,235,0.35)'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(0, 470); ctx.bezierCurveTo(260, 410, 600, 420, w, 480); ctx.stroke();
      // hai người ngồi cạnh nhau (nhìn từ phía sau, không có mặt)
      [[440, true], [500, false]].forEach(([x, longHair]) => {
        ctx.fillStyle = '#0c1a28';
        roundRect(ctx, x - 26, 432, 52, 66, 22); ctx.fill();
        ctx.beginPath(); ctx.arc(x, 418, 17, 0, Math.PI * 2); ctx.fill();
        if (longHair) { roundRect(ctx, x - 17, 418, 34, 40, 12); ctx.fill(); }
      });
    },

    // Nơi em tự chọn: bản đồ giấy, đường chấm, chiếc ghim và tên địa điểm
    custom(ctx, w, h, rand, data) {
      ctx.fillStyle = '#f4ead6';
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = 'rgba(200,180,145,0.35)';
      ctx.lineWidth = 2;
      for (let x = 48; x < w; x += 64) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
      for (let y = 48; y < h; y += 64) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
      wash(ctx, rand, 260, 420, 230, 140, '#e6d2ab', 1);
      wash(ctx, rand, 690, 260, 260, 150, '#e6d2ab', 1);
      wash(ctx, rand, 760, 480, 120, 70, '#cfdcc0', 0.9);
      ctx.save();
      ctx.strokeStyle = WARM_DEEP; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.setLineDash([2, 16]);
      ctx.beginPath(); ctx.moveTo(110, 540); ctx.bezierCurveTo(260, 420, 420, 520, 520, 380); ctx.bezierCurveTo(560, 320, 590, 300, 610, 292); ctx.stroke();
      ctx.restore();
      // ghim
      ctx.fillStyle = '#c9774f';
      ctx.beginPath(); ctx.moveTo(620, 290); ctx.bezierCurveTo(580, 240, 585, 190, 620, 186); ctx.bezierCurveTo(655, 190, 660, 240, 620, 290); ctx.fill();
      ctx.fillStyle = '#fbf4e6';
      ctx.beginPath(); ctx.arc(620, 222, 14, 0, Math.PI * 2); ctx.fill();
      if (data.place) {
        ctx.font = '500 30px ' + FONT_BODY;
        const label = ellipsize(ctx, data.place, 340);
        const tw = ctx.measureText(label).width;
        // Nhãn nằm cạnh ghim; nếu dài thì lùi sang trái để không tràn khỏi tranh
        const bx = Math.min(650, w - (tw + 36) - 24);
        ctx.fillStyle = 'rgba(251,244,230,0.95)';
        roundRect(ctx, bx, 168, tw + 36, 52, 14); ctx.fill();
        ctx.fillStyle = INK;
        ctx.textBaseline = 'middle';
        ctx.fillText(label, bx + 18, 195);
        ctx.textBaseline = 'alphabetic';
      }
    }
  };

  function star(ctx, cx, cy, R, r, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const rad = i % 2 ? r : R;
      const a = -Math.PI / 2 + (i * Math.PI) / 5;
      const x = cx + Math.cos(a) * rad;
      const y = cy + Math.sin(a) * rad;
      if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
  }

  function heart(ctx, x, y, s, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, y + s * 0.3);
    ctx.bezierCurveTo(x - s, y - s * 0.4, x - s * 0.4, y - s, x, y - s * 0.4);
    ctx.bezierCurveTo(x + s * 0.4, y - s, x + s, y - s * 0.4, x, y + s * 0.3);
    ctx.fill();
  }

  // ---------- Bưu thiếp ----------

  function drawPaper(ctx, rand) {
    ctx.fillStyle = '#fbf4e6';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#8a6a4f';
    for (let i = 0; i < 2600; i++) {
      ctx.globalAlpha = 0.03 + rand() * 0.04;
      ctx.fillRect(rand() * W, rand() * H, 1 + rand() * 1.5, 1 + rand() * 1.5);
    }
    ctx.globalAlpha = 1;
    ctx.strokeStyle = '#e2d2b6';
    ctx.lineWidth = 3;
    roundRect(ctx, 28, 28, W - 56, H - 56, 18);
    ctx.stroke();
  }

  function drawStamp(ctx, trip, texts) {
    ctx.save();
    ctx.translate(892, 104);
    ctx.rotate(-0.05);
    const sw = 140;
    const sh = 168;
    ctx.shadowColor = 'rgba(60,40,20,0.25)';
    ctx.shadowBlur = 12;
    ctx.fillStyle = '#fffaf0';
    ctx.fillRect(-sw / 2, -sh / 2, sw, sh);
    ctx.shadowBlur = 0;
    // răng cưa
    ctx.fillStyle = '#fbf4e6';
    for (let x = -sw / 2; x <= sw / 2; x += 14) {
      ctx.beginPath(); ctx.arc(x, -sh / 2, 5, 0, Math.PI * 2); ctx.arc(x, sh / 2, 5, 0, Math.PI * 2); ctx.fill();
    }
    for (let y = -sh / 2; y <= sh / 2; y += 14) {
      ctx.beginPath(); ctx.arc(-sw / 2, y, 5, 0, Math.PI * 2); ctx.arc(sw / 2, y, 5, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = STAMP_COLORS[trip] || '#c9a24f';
    ctx.fillRect(-sw / 2 + 14, -sh / 2 + 14, sw - 28, sh - 28);
    heart(ctx, 0, -14, 26, 'rgba(255,248,236,0.92)');
    ctx.fillStyle = '#fff8ec';
    ctx.font = '400 40px ' + FONT_HAND;
    ctx.textAlign = 'center';
    ctx.fillText(texts.stampDate, 0, 52);
    ctx.restore();
    // dấu bưu điện
    ctx.save();
    ctx.strokeStyle = 'rgba(156,79,45,0.45)';
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(808, 196, 58, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(808, 196, 46, 0, Math.PI * 2); ctx.stroke();
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      for (let x = 600; x <= 750; x += 6) {
        const y = 178 + i * 18 + Math.sin(x / 14) * 4;
        if (x === 600) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.restore();
  }

  function render(canvas, data) {
    const texts = data.texts;
    const sample = [texts.heading, data.tripLine, data.place, data.message, texts.messageHeading, texts.placeLabel, texts.footer, 'ạảãáàâầấậăằắặđêềếệôồốộơờớợưừứựỳýỵỷỹ'].filter(Boolean).join(' ');
    return ensureFonts(sample).then(() => {
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext('2d');
      const rand = rng(20251020);

      drawPaper(ctx, rand);

      // Tranh
      const ax = 64;
      const ay = 64;
      const aw = W - 128;
      // Có lời nhắn hoặc địa điểm → tranh thấp lại để nhường chỗ cho chữ.
      const msgLen = data.message ? data.message.length : 0;
      let ah = 740;
      if (msgLen > 140) ah = data.place ? 430 : 480;
      else if (msgLen > 0) ah = data.place ? 500 : 580;
      else if (data.place) ah = 640;
      ctx.save();
      roundRect(ctx, ax, ay, aw, ah, 20);
      ctx.clip();
      ctx.translate(ax, ay);
      (ART[data.trip] || ART.slow)(ctx, aw, ah, rng(1020 + data.trip.length), data);
      ctx.restore();
      ctx.strokeStyle = 'rgba(90,64,40,0.12)';
      ctx.lineWidth = 2;
      roundRect(ctx, ax, ay, aw, ah, 20);
      ctx.stroke();

      drawStamp(ctx, data.trip, texts);

      // Chữ
      const x = 96;
      const maxW = W - 192;
      const bottomLimit = H - 120;
      let y = ay + ah + 84;

      // Tiêu đề: thu nhỏ dần cho vừa một dòng (tối thiểu 48px, nếu vẫn dài thì xuống dòng)
      ctx.textAlign = 'left';
      ctx.fillStyle = INK;
      let hs = 66;
      ctx.font = '400 ' + hs + 'px ' + FONT_HAND;
      while (ctx.measureText(texts.heading).width > maxW && hs > 48) {
        hs -= 2;
        ctx.font = '400 ' + hs + 'px ' + FONT_HAND;
      }
      wrap(ctx, texts.heading, maxW).forEach((line) => { ctx.fillText(line, x, y); y += Math.round(hs * 1.18); });

      y += 4;
      ctx.fillStyle = INK_SOFT;
      ctx.font = '400 34px ' + FONT_BODY;
      wrap(ctx, data.tripLine, maxW).forEach((line) => { ctx.fillText(line, x, y); y += 50; });

      if (data.place) {
        y += 18;
        ctx.fillStyle = WARM_DEEP;
        ctx.font = '500 24px ' + FONT_BODY;
        ctx.fillText(texts.placeLabel.toUpperCase(), x, y);
        y += 62;
        ctx.font = '400 56px ' + FONT_HAND;
        wrap(ctx, data.place, maxW).slice(0, 2).forEach((line) => { ctx.fillText(line, x, y); y += 68; });
      }

      if (data.message) {
        y += 18;
        ctx.strokeStyle = '#e2d2b6';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + maxW, y); ctx.stroke();
        y += 50;
        ctx.fillStyle = WARM_DEEP;
        ctx.font = '500 24px ' + FONT_BODY;
        ctx.fillText(texts.messageHeading.toUpperCase(), x, y);
        y += 16;

        // Tự giảm cỡ chữ cho vừa chỗ; nếu vẫn dài thì cắt và thêm "…"
        const room = bottomLimit - y;
        let size = 44;
        let lines;
        let lh;
        for (;;) {
          ctx.font = '400 ' + size + 'px ' + FONT_HAND;
          lh = Math.round(size * 1.3);
          lines = wrap(ctx, data.message, maxW);
          if (lines.length * lh <= room || size <= 26) break;
          size -= 2;
        }
        // Ghi lại để kiểm thử: lời nhắn có bị cắt không
        canvas.dataset.messageLines = String(lines.length);
        canvas.dataset.messageFits = String(lines.length * lh <= room);
        const maxLines = Math.max(1, Math.floor(room / lh));
        if (lines.length > maxLines) {
          lines = lines.slice(0, maxLines);
          lines[maxLines - 1] = ellipsize(ctx, lines[maxLines - 1] + '…', maxW);
        }
        ctx.fillStyle = '#2f2620';
        lines.forEach((line) => { y += lh; ctx.fillText(line, x, y - lh * 0.25); });
      }

      // Chân thiếp
      ctx.fillStyle = '#8a7768';
      ctx.font = '400 24px ' + FONT_BODY;
      ctx.fillText(texts.footer, x, H - 66);
      heart(ctx, W - 110, H - 76, 16, '#d98a63');

      return canvas;
    });
  }

  function toBlob(canvas) {
    return new Promise((resolve, reject) => {
      try {
        if (canvas.toBlob) {
          canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('toBlob trả về rỗng'))), 'image/png');
        } else {
          // Trình duyệt rất cũ: đổi từ dataURL
          const data = atob(canvas.toDataURL('image/png').split(',')[1]);
          const arr = new Uint8Array(data.length);
          for (let i = 0; i < data.length; i++) arr[i] = data.charCodeAt(i);
          resolve(new Blob([arr], { type: 'image/png' }));
        }
      } catch (e) {
        reject(e);
      }
    });
  }

  NNBT.postcard = { render, toBlob, SIZE: { w: W, h: H } };
})(window.NNBT);

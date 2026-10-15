/*
 * postcard.js — Vẽ bưu thiếp bằng Canvas 2D (không chụp DOM, không thư viện ngoài).
 *
 * Nội dung bưu thiếp: tranh đêm cực quang (hộp nhẫn trên đồi tuyết, hai hàng dấu chân),
 * tên Chương 5, LỜI CHÚC CỦA ANH và (nếu có) LỜI NHẮN CỦA EM. Tông hồng pastel.
 *
 * Vì sao Canvas thay vì chụp DOM:
 *   - Kiểm soát được font tiếng Việt: chờ font tải xong (document.fonts.load) rồi mới vẽ.
 *   - Không dùng ảnh/SVG ngoài → canvas không bị "tainted", toBlob luôn xuất được ảnh.
 *   - Ảnh xuất ra giống hệt bản xem trước trên mọi máy.
 *
 * API:
 *   NNBT.postcard.render(canvas, { wish, message, texts }) → Promise<canvas>
 *     texts: { heading, wishHeading, messageHeading, footer, stampDate }
 *   NNBT.postcard.toBlob(canvas) → Promise<Blob>
 *   NNBT.postcard.SIZE = { w, h }
 */
window.NNBT = window.NNBT || {};

(function (NNBT) {
  'use strict';

  const W = 1080;
  const H = 1350;
  const FONT_BODY = '"Be Vietnam Pro", system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif';
  const FONT_SERIF = '"Lora", Georgia, "Noto Serif", serif';
  const FONT_HAND = '"Charm", "Lora", Georgia, serif';

  const INK = '#3d2a33';
  const INK_SOFT = '#6e5560';
  const ROSE = '#a94d6b';
  const LINE = '#f0d5dc';

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
    const t = Array.from(text);
    while (t.length && ctx.measureText(t.join('') + '…').width > maxW) t.pop();
    return t.join('') + '…';
  }

  // Chờ font có ký tự tiếng Việt tải xong (tối đa ~3 giây), không bao giờ làm hỏng việc vẽ.
  function ensureFonts(sample) {
    if (!document.fonts || !document.fonts.load) return Promise.resolve();
    const loads = [
      document.fonts.load('600 56px "Lora"', sample),
      document.fonts.load('italic 400 32px "Lora"', sample),
      document.fonts.load('400 34px "Lora"', sample),
      document.fonts.load('400 40px "Charm"', '20·10'),
      document.fonts.load('500 24px "Be Vietnam Pro"', sample)
    ];
    const timeout = new Promise((resolve) => setTimeout(resolve, 3000));
    return Promise.race([Promise.all(loads), timeout]).catch(() => {});
  }

  function heart(ctx, x, y, s, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, y + s * 0.3);
    ctx.bezierCurveTo(x - s, y - s * 0.4, x - s * 0.4, y - s, x, y - s * 0.4);
    ctx.bezierCurveTo(x + s * 0.4, y - s, x + s, y - s * 0.4, x, y + s * 0.3);
    ctx.fill();
  }

  // ---------- Tranh: đêm cực quang, hộp nhẫn trên đồi tuyết (tĩnh vật — không vẽ người) ----------

  function drawArt(ctx, w, h, rand) {
    const k = h / 640;
    const hy = Math.round(h * 0.62);

    // trời đêm tím hồng
    let g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#231d3d');
    g.addColorStop(0.55, '#4a3a66');
    g.addColorStop(1, '#8a6a8f');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    // sao
    for (let i = 0; i < 130; i++) {
      ctx.globalAlpha = 0.3 + 0.6 * rand();
      ctx.fillStyle = '#fff5fa';
      ctx.beginPath(); ctx.arc(rand() * w, rand() * hy * 0.92, 0.8 + rand() * 1.7, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;

    // dải cực quang xanh ngọc pha hồng
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';
    [[70, 150 * k, 0.32, '120,235,195'], [46, 210 * k, 0.26, '255,160,205'], [90, 108 * k, 0.18, '150,175,255']].forEach(([lw, y0, a, c]) => {
      const lg = ctx.createLinearGradient(0, 0, w, 0);
      lg.addColorStop(0, 'rgba(' + c + ',0)');
      lg.addColorStop(0.35, 'rgba(' + c + ',' + a + ')');
      lg.addColorStop(0.7, 'rgba(' + c + ',' + a * 0.8 + ')');
      lg.addColorStop(1, 'rgba(' + c + ',0)');
      ctx.strokeStyle = lg;
      ctx.lineWidth = lw * Math.max(0.75, k);
      ctx.shadowColor = 'rgba(' + c + ',0.6)';
      ctx.shadowBlur = 70;
      ctx.beginPath();
      ctx.moveTo(-40, y0 + 60);
      ctx.bezierCurveTo(240, y0 - 80, 520, y0 + 110, 980, y0 - 40);
      ctx.stroke();
    });
    ctx.restore();

    // đồi xa
    ctx.fillStyle = '#5d4a78';
    ctx.beginPath(); ctx.moveTo(0, hy - 30 * k); ctx.bezierCurveTo(220, hy - 86 * k, 520, hy - 16 * k, w, hy - 64 * k); ctx.lineTo(w, hy + 40); ctx.lineTo(0, hy + 40); ctx.closePath(); ctx.fill();

    // đồi tuyết hồng nhạt
    const ridge = (c) => { c.moveTo(0, hy + 10); c.bezierCurveTo(260, hy - 46 * k, 600, hy - 36 * k, w, hy + 18); };
    g = ctx.createLinearGradient(0, hy - 46 * k, 0, h);
    g.addColorStop(0, '#f6dce8');
    g.addColorStop(1, '#c9a9cf');
    ctx.fillStyle = g;
    ctx.beginPath(); ridge(ctx); ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 3;
    ctx.beginPath(); ridge(ctx); ctx.stroke();

    // hộp nhẫn sáng giữa tuyết
    const bx = w * 0.62;
    const by = hy + (h - hy) * 0.42;
    const s = 1.5 * Math.max(0.8, k);
    const glow = ctx.createRadialGradient(bx, by - 30 * s, 6, bx, by - 30 * s, 170 * s);
    glow.addColorStop(0, 'rgba(255,236,200,0.85)');
    glow.addColorStop(1, 'rgba(255,236,200,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(bx - 300, by - 260, 600, 420);
    ctx.save();
    ctx.translate(bx, by);
    ctx.scale(s, s);
    ctx.fillStyle = 'rgba(120,80,120,0.35)';
    ctx.beginPath(); ctx.ellipse(0, 18, 40, 7, 0, 0, Math.PI * 2); ctx.fill();
    // nắp mở
    ctx.fillStyle = '#b34a6b';
    ctx.beginPath(); ctx.moveTo(-30, -22); ctx.lineTo(30, -22); ctx.lineTo(26, -44); ctx.lineTo(-26, -44); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#f7e9ee';
    ctx.beginPath(); ctx.moveTo(-24, -24); ctx.lineTo(24, -24); ctx.lineTo(21, -40); ctx.lineTo(-21, -40); ctx.closePath(); ctx.fill();
    // thân hộp
    roundRect(ctx, -30, -6, 60, 26, 6);
    ctx.fillStyle = '#c95c7e'; ctx.fill();
    ctx.fillStyle = '#f7e9ee';
    roundRect(ctx, -24, -12, 48, 10, 4); ctx.fill();
    // nhẫn + viên đá
    ctx.strokeStyle = '#e8c46a'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(0, -16, 10, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = '#eef8ff'; ctx.strokeStyle = '#bfe1f2'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(-5, -28); ctx.lineTo(0, -35); ctx.lineTo(5, -28); ctx.lineTo(0, -24); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = '#fffbe8'; ctx.lineWidth = 2; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(14, -46); ctx.lineTo(14, -54); ctx.moveTo(10, -50); ctx.lineTo(18, -50); ctx.stroke();
    ctx.restore();

    // hai hàng dấu chân đi cạnh nhau dẫn tới hộp nhẫn (gần to, xa nhỏ)
    const p0 = [w * 0.18, h + 20];
    const p1 = [w * 0.32, by + (h - by) * 0.4];
    const p2 = [bx - 60 * s, by + 10 * s];
    const at = (t) => [
      (1 - t) * (1 - t) * p0[0] + 2 * (1 - t) * t * p1[0] + t * t * p2[0],
      (1 - t) * (1 - t) * p0[1] + 2 * (1 - t) * t * p1[1] + t * t * p2[1]
    ];
    ctx.fillStyle = 'rgba(122,86,130,0.45)';
    const steps = 14;
    for (let i = 1; i < steps; i++) {
      const t = i / steps;
      const [x, y] = at(t);
      const [x2, y2] = at(Math.min(1, t + 0.01));
      const ang = Math.atan2(y2 - y, x2 - x);
      const sc = 1 - t * 0.65;
      const nx = -Math.sin(ang);
      const ny = Math.cos(ang);
      [-1, 1].forEach((trail) => {
        const off = trail * 24 * sc + (i % 2 ? 1 : -1) * 6 * sc;
        ctx.beginPath();
        ctx.ellipse(x + nx * off, y + ny * off, 11 * sc, 5 * sc, ang, 0, Math.PI * 2);
        ctx.fill();
      });
    }
  }

  // ---------- Giấy, tem, dấu bưu điện ----------

  function drawPaper(ctx, rand) {
    const g = ctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, '#fff8fa');
    g.addColorStop(1, '#fdeef3');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#b07a92';
    for (let i = 0; i < 1800; i++) {
      ctx.globalAlpha = 0.02 + rand() * 0.03;
      ctx.fillRect(rand() * W, rand() * H, 1 + rand() * 1.2, 1 + rand() * 1.2);
    }
    ctx.globalAlpha = 1;
    ctx.strokeStyle = LINE;
    ctx.lineWidth = 3;
    roundRect(ctx, 28, 28, W - 56, H - 56, 22);
    ctx.stroke();
  }

  function drawStamp(ctx, texts) {
    ctx.save();
    ctx.translate(892, 104);
    ctx.rotate(-0.05);
    const sw = 140;
    const sh = 168;
    ctx.shadowColor = 'rgba(110,55,80,0.22)';
    ctx.shadowBlur = 12;
    ctx.fillStyle = '#fffafc';
    ctx.fillRect(-sw / 2, -sh / 2, sw, sh);
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#fdeef3';
    for (let x = -sw / 2; x <= sw / 2; x += 14) {
      ctx.beginPath(); ctx.arc(x, -sh / 2, 5, 0, Math.PI * 2); ctx.arc(x, sh / 2, 5, 0, Math.PI * 2); ctx.fill();
    }
    for (let y = -sh / 2; y <= sh / 2; y += 14) {
      ctx.beginPath(); ctx.arc(-sw / 2, y, 5, 0, Math.PI * 2); ctx.arc(sw / 2, y, 5, 0, Math.PI * 2); ctx.fill();
    }
    const sg = ctx.createLinearGradient(0, -sh / 2, 0, sh / 2);
    sg.addColorStop(0, '#e58fa3');
    sg.addColorStop(1, '#b4546f');
    ctx.fillStyle = sg;
    ctx.fillRect(-sw / 2 + 14, -sh / 2 + 14, sw - 28, sh - 28);
    heart(ctx, 0, -14, 26, 'rgba(255,248,250,0.95)');
    ctx.fillStyle = '#fff8fa';
    ctx.font = '400 40px ' + FONT_HAND;
    ctx.textAlign = 'center';
    ctx.fillText(texts.stampDate, 0, 52);
    ctx.restore();
    // dấu bưu điện
    ctx.save();
    ctx.strokeStyle = 'rgba(169,77,107,0.4)';
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

  // Một đoạn chữ tự co cỡ cho vừa khoảng trống; quá dài thì cắt và thêm "…"
  function fitBlock(ctx, text, font, maxSize, minSize, maxW, room) {
    let size = maxSize;
    let lines;
    let lh;
    for (;;) {
      ctx.font = font(size);
      lh = Math.round(size * 1.45);
      lines = wrap(ctx, text, maxW);
      if (lines.length * lh <= room || size <= minSize) break;
      size -= 1;
    }
    const maxLines = Math.max(1, Math.floor(room / lh));
    const fits = lines.length <= maxLines;
    if (!fits) {
      lines = lines.slice(0, maxLines);
      lines[maxLines - 1] = ellipsize(ctx, lines[maxLines - 1] + '…', maxW);
    }
    return { lines, lh, fits };
  }

  function label(ctx, text, x, y) {
    ctx.fillStyle = ROSE;
    ctx.font = '500 23px ' + FONT_BODY;
    ctx.fillText(text.toUpperCase(), x, y);
  }

  function render(canvas, data) {
    const texts = data.texts;
    const sample = [texts.heading, data.wish, data.message, texts.wishHeading, texts.messageHeading, texts.footer, 'ạảãáàâầấậăằắặđêềếệôồốộơờớợưừứựỳýỵỷỹ'].filter(Boolean).join(' ');
    return ensureFonts(sample).then(() => {
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext('2d');
      const rand = rng(20251020);

      drawPaper(ctx, rand);

      // Tranh: có lời nhắn → thấp lại để nhường chỗ cho chữ
      const ax = 64;
      const ay = 64;
      const aw = W - 128;
      const msgLen = data.message ? data.message.length : 0;
      const ah = msgLen > 140 ? 430 : msgLen > 60 ? 520 : msgLen > 0 ? 580 : 640;
      ctx.save();
      roundRect(ctx, ax, ay, aw, ah, 22);
      ctx.clip();
      ctx.translate(ax, ay);
      drawArt(ctx, aw, ah, rng(1027));
      ctx.restore();

      drawStamp(ctx, texts);

      const x = 96;
      const maxW = W - 192;
      const bottomLimit = H - 120;
      let y = ay + ah + 78;

      // Tiêu đề (Lora), thu nhỏ dần cho vừa một dòng
      ctx.textAlign = 'left';
      ctx.fillStyle = INK;
      let hs = 56;
      ctx.font = '600 ' + hs + 'px ' + FONT_SERIF;
      while (ctx.measureText(texts.heading).width > maxW && hs > 40) {
        hs -= 2;
        ctx.font = '600 ' + hs + 'px ' + FONT_SERIF;
      }
      wrap(ctx, texts.heading, maxW).forEach((line) => { ctx.fillText(line, x, y); y += Math.round(hs * 1.25); });

      // Lời chúc của anh
      y += 22;
      label(ctx, texts.wishHeading, x, y);
      y += 14;
      const wishRoom = data.message ? Math.min(250, bottomLimit - y - 170) : bottomLimit - y;
      const wish = fitBlock(ctx, data.wish, (sz) => 'italic 400 ' + sz + 'px ' + FONT_SERIF, 34, 24, maxW, wishRoom);
      ctx.fillStyle = INK_SOFT;
      wish.lines.forEach((line) => { y += wish.lh; ctx.fillText(line, x, y - wish.lh * 0.28); });

      // Lời nhắn của em
      if (data.message) {
        y += 26;
        ctx.strokeStyle = LINE;
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + maxW, y); ctx.stroke();
        y += 46;
        label(ctx, texts.messageHeading, x, y);
        y += 12;
        const msg = fitBlock(ctx, data.message, (sz) => '400 ' + sz + 'px ' + FONT_SERIF, 38, 24, maxW, bottomLimit - y);
        canvas.dataset.messageLines = String(msg.lines.length);
        canvas.dataset.messageFits = String(msg.fits);
        ctx.fillStyle = INK;
        msg.lines.forEach((line) => { y += msg.lh; ctx.fillText(line, x, y - msg.lh * 0.28); });
      }

      // Chân thiếp
      ctx.fillStyle = '#a88d98';
      ctx.font = '400 24px ' + FONT_BODY;
      ctx.fillText(texts.footer, x, H - 66);
      heart(ctx, W - 110, H - 76, 16, '#e58fa3');

      return canvas;
    });
  }

  function toBlob(canvas) {
    return new Promise((resolve, reject) => {
      try {
        if (canvas.toBlob) {
          canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('toBlob trả về rỗng'))), 'image/png');
        } else {
          const data = canvas.toDataURL('image/png');
          fetch(data).then((r) => r.blob()).then(resolve, reject);
        }
      } catch (e) {
        reject(e);
      }
    });
  }

  NNBT.postcard = { render, toBlob, SIZE: { w: W, h: H } };
})(window.NNBT);

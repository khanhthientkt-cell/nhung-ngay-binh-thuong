/*
 * photos.js — Ảnh thật dạng polaroid trên nền giấy (dùng cho chương, trang đầu và dòng kết).
 *
 * NNBT.photos.polaroid(photo, { rotate, zoom }) → phần tử ảnh; zoom = true → chạm để xem lớn
 * NNBT.photos.stage() → { node, show(photos), hide() } — lớp ảnh phủ lên tranh trong khung cảnh
 * NNBT.photos.view(photo) → mở ảnh lớn toàn màn hình
 *
 * photo = { src, alt, w, h }  (w, h: kích thước thật để trình duyệt giữ chỗ, tránh nhảy bố cục)
 */
window.NNBT = window.NNBT || {};

(function (NNBT) {
  'use strict';

  // Vị trí các tấm ảnh theo số lượng (theo % khung 4:3), góc xoay nhẹ cho tự nhiên.
  // Độ rộng đã tính để ảnh dọc cao nhất (tỉ lệ ~0,64) vẫn nằm gọn trong khung.
  const LAYOUTS = {
    1: [{ left: 50, top: 50, width: 42, rotate: -2 }],
    2: [{ left: 30, top: 50, width: 39, rotate: -4 }, { left: 70, top: 52, width: 39, rotate: 3 }],
    3: [{ left: 21, top: 52, width: 33, rotate: -5 }, { left: 50, top: 48, width: 33, rotate: 2 }, { left: 79, top: 53, width: 33, rotate: 5 }]
  };

  // Xem ảnh lớn. Đóng bằng: chạm bất kỳ đâu, nút "Đóng", phím Esc.
  function view(photo) {
    if (typeof HTMLDialogElement === 'undefined') {
      window.open(photo.src, '_blank', 'noopener');
      return;
    }
    const dialog = document.createElement('dialog');
    dialog.className = 'photo-viewer';
    dialog.setAttribute('aria-label', photo.alt || 'Ảnh');
    const img = document.createElement('img');
    img.className = 'photo-viewer__img';
    img.src = photo.src;
    img.alt = photo.alt || '';
    const close = NNBT.ui.button({ label: 'Đóng', variant: 'secondary', className: 'photo-viewer__close' });

    let closed = false;
    const done = () => {
      if (closed) return;
      closed = true;
      if (dialog.open) dialog.close();
      dialog.remove();
      if (opener && opener.isConnected) opener.focus({ preventScroll: true });
    };
    const opener = document.activeElement;
    dialog.addEventListener('click', done);
    dialog.addEventListener('cancel', (e) => { e.preventDefault(); done(); });
    dialog.addEventListener('close', done);

    dialog.append(img, close);
    document.body.append(dialog);
    dialog.showModal();
    close.focus();
  }

  function polaroid(photo, opts) {
    const o = opts || {};
    const img = document.createElement('img');
    img.src = photo.src;
    img.alt = photo.alt || '';
    if (photo.w && photo.h) {
      img.width = photo.w;
      img.height = photo.h;
    }
    img.decoding = 'async';
    if (o.lazy !== false) img.loading = 'lazy';
    img.draggable = false;

    // Ảnh có thể phóng to là một nút (dùng được bằng chạm, chuột và bàn phím).
    const fig = document.createElement(o.zoom ? 'button' : 'figure');
    fig.className = 'polaroid' + (o.zoom ? ' polaroid--zoom' : '') + (o.className ? ' ' + o.className : '');
    if (o.zoom) {
      fig.type = 'button';
      fig.setAttribute('aria-label', (photo.alt || 'Ảnh') + ' Chạm để xem lớn.');
      fig.addEventListener('click', () => view(photo));
    }
    if (o.rotate) fig.style.setProperty('--rotate', o.rotate + 'deg');
    fig.append(img);
    return fig;
  }

  function stage() {
    const node = document.createElement('div');
    node.className = 'photo-stage';
    node.setAttribute('aria-hidden', 'true');

    function show(photos) {
      node.textContent = '';
      const list = photos.slice(0, 3);
      const layout = LAYOUTS[list.length] || LAYOUTS[1];
      list.forEach((p, i) => {
        const pos = layout[i];
        const fig = polaroid(p, { rotate: pos.rotate, lazy: false, zoom: true });
        fig.style.left = pos.left + '%';
        fig.style.top = pos.top + '%';
        fig.style.width = pos.width + '%';
        node.append(fig);
      });
      node.dataset.count = String(list.length);
      node.classList.add('is-active');
      node.removeAttribute('aria-hidden');
      node.inert = false;
    }

    function hide() {
      node.classList.remove('is-active');
      node.setAttribute('aria-hidden', 'true');
      node.inert = true; // ảnh đang ẩn thì không nhận focus bàn phím
    }

    node.inert = true;
    return { node, show, hide };
  }

  NNBT.photos = { polaroid, stage, view };
})(window.NNBT);

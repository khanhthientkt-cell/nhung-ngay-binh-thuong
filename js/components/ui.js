/*
 * ui.js — Các thành phần giao diện nhỏ dùng lại được: tạo phần tử, nút, thông báo, hộp xác nhận.
 * Không chứa nội dung câu chuyện (nội dung nằm trong js/content/story.js).
 */
window.NNBT = window.NNBT || {};

(function (NNBT) {
  'use strict';

  /**
   * Tạo phần tử DOM.
   * attrs: class, text, html (chỉ dùng cho SVG tĩnh do mình viết), dataset, on<Sự kiện>, và thuộc tính thường.
   */
  function el(tag, attrs, children) {
    const node = tag === 'svg' || tag === 'path' || tag === 'circle'
      ? document.createElementNS('http://www.w3.org/2000/svg', tag)
      : document.createElement(tag);

    if (attrs) {
      Object.keys(attrs).forEach((key) => {
        const value = attrs[key];
        if (value === null || value === undefined || value === false) return;
        if (key === 'class') node.setAttribute('class', value);
        else if (key === 'text') node.textContent = value;
        else if (key === 'html') node.innerHTML = value;
        else if (key === 'dataset') Object.assign(node.dataset, value);
        else if (key.slice(0, 2) === 'on' && typeof value === 'function') {
          node.addEventListener(key.slice(2).toLowerCase(), value);
        } else node.setAttribute(key, value === true ? '' : value);
      });
    }

    [].concat(children === undefined ? [] : children).forEach((child) => {
      if (child === null || child === undefined || child === false) return;
      node.append(child.nodeType ? child : String(child));
    });
    return node;
  }

  /**
   * Nút bấm. variant: 'primary' | 'secondary' | 'quiet'
   */
  function button(opts) {
    const o = opts || {};
    return el('button', {
      type: 'button',
      class: ['btn', 'btn--' + (o.variant || 'primary'), o.className].filter(Boolean).join(' '),
      disabled: o.disabled,
      'aria-describedby': o.describedBy,
      dataset: o.dataset,
      onClick: o.disabled ? null : o.onClick
    }, o.label);
  }

  // ---------- Thông báo ----------

  let announcer = null;
  let toastRegion = null;

  function announce(message) {
    announcer = announcer || document.getElementById('announcer');
    if (!announcer) return;
    announcer.textContent = '';
    // Đặt lại sau một nhịp để trình đọc màn hình đọc cả khi nội dung giống lần trước.
    window.setTimeout(() => { announcer.textContent = message; }, 60);
  }

  function toast(message, opts) {
    toastRegion = toastRegion || document.getElementById('toast-region');
    if (!toastRegion) return;
    // Chạm nhiều lần liên tiếp không chồng thêm thông báo giống hệt.
    const same = Array.from(toastRegion.children).some((n) => n.textContent === message && !n.dataset.leaving);
    if (same) return;
    const tone = (opts && opts.tone) || 'info';
    const duration = (opts && opts.duration) || 4200;
    const node = el('div', { class: 'toast toast--' + tone }, message);
    toastRegion.append(node);
    const show = () => node.classList.add('is-visible');
    window.requestAnimationFrame(show);
    window.setTimeout(show, 60); // dự phòng khi khung hình bị tạm dừng
    window.setTimeout(() => {
      node.dataset.leaving = 'true';
      node.classList.remove('is-visible');
      window.setTimeout(() => node.remove(), 400);
    }, duration);
  }

  // ---------- Hộp xác nhận (dùng <dialog> để có sẵn bẫy focus và phím Esc) ----------

  function confirmDialog(opts) {
    const o = opts || {};
    if (typeof HTMLDialogElement === 'undefined') {
      return Promise.resolve(window.confirm(o.title + '\n\n' + o.body));
    }

    return new Promise((resolve) => {
      const titleId = 'dlg-title-' + Date.now();
      const bodyId = 'dlg-body-' + Date.now();
      const cancelBtn = button({ label: o.cancel, variant: 'secondary' });
      const confirmBtn = button({ label: o.confirm, variant: 'primary' });

      const dialog = el('dialog', { class: 'dialog', 'aria-labelledby': titleId, 'aria-describedby': bodyId }, [
        el('h2', { class: 'dialog__title', id: titleId, text: o.title }),
        el('p', { class: 'dialog__body', id: bodyId, text: o.body }),
        el('div', { class: 'dialog__actions' }, [cancelBtn, confirmBtn])
      ]);

      // Kết thúc trực tiếp từ nút bấm, không chờ sự kiện "close"
      // (một số trình duyệt nhúng không phát sự kiện này đáng tin cậy).
      let settled = false;
      const done = (result) => {
        if (settled) return;
        settled = true;
        if (dialog.open) dialog.close();
        dialog.remove();
        resolve(result);
      };
      cancelBtn.addEventListener('click', () => done(false));
      confirmBtn.addEventListener('click', () => done(true));
      // Phím Esc
      dialog.addEventListener('cancel', (e) => { e.preventDefault(); done(false); });
      // Chạm ra ngoài khung để đóng
      dialog.addEventListener('click', (e) => { if (e.target === dialog) done(false); });
      // Dự phòng nếu hộp bị đóng bằng cách khác
      dialog.addEventListener('close', () => done(false));

      document.body.append(dialog);
      dialog.showModal();
      cancelBtn.focus(); // mặc định đặt focus vào lựa chọn an toàn
    });
  }

  NNBT.ui = { el, button, announce, toast, confirm: confirmDialog };
})(window.NNBT);

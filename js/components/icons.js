/*
 * icons.js — Bộ biểu tượng nét đơn (24×24, màu theo chữ), dùng chung cho bản đồ và các điểm chạm trong chương.
 * Hình ảnh lấy từ các biểu tượng trong bản mô tả dự án.
 */
window.NNBT = window.NNBT || {};

(function (NNBT) {
  'use strict';

  const ICONS = {
    letter:
      '<rect x="3.5" y="6" width="17" height="12.5" rx="1.5"/><path d="m4.2 7 7.8 6.2L19.8 7"/>',
    umbrella:
      '<path d="M3 12.5a9 9 0 0 1 18 0c-1.5-1.2-3-1.2-4.5 0-1.5-1.2-3-1.2-4.5 0-1.5-1.2-3-1.2-4.5 0-1.5-1.2-3-1.2-4.5 0z"/>' +
      '<path d="M12 12.5v6a2 2 0 0 1-4 0"/><path d="M12 3.5v-1"/>',
    helmet:
      '<path d="M4 15a8 8 0 0 1 16 0v1.2H4z"/><path d="M12 7v4.5"/><path d="M14.5 16.2h6.5"/>' +
      '<path d="M7.5 16.2v1.6a1.6 1.6 0 0 0 1.6 1.6h1.4"/>',
    cups:
      '<path d="M4.5 7.5h5.5l-.8 11a1 1 0 0 1-1 .9H6.3a1 1 0 0 1-1-.9z"/><path d="M14 7.5h5.5l-.8 11a1 1 0 0 1-1 .9h-1.9a1 1 0 0 1-1-.9z"/>' +
      '<path d="M4.8 11.5h4.9M14.3 11.5h4.9"/>',
    bed:
      '<path d="M3 18.5V7"/><path d="M3 14.5h18v4"/><path d="M21 14.5V12a2 2 0 0 0-2-2h-8v4.5"/><rect x="5" y="10.5" width="4.5" height="4" rx="1.2"/>',
    laptops:
      '<path d="M4 16.5h16"/><rect x="5" y="13" width="14" height="3.5" rx="1"/><rect x="6.5" y="8.5" width="11" height="3.5" rx="1"/>',
    hug:
      '<circle cx="9" cy="6.8" r="2.6"/><circle cx="15.2" cy="7.4" r="2.6"/>' +
      '<path d="M4.5 19.5c0-4.3 1.9-7 4.5-7h6.2c2.6 0 4.3 2.7 4.3 7"/><path d="M6.8 15.2c2.6 2.4 7.8 2.4 10.4 0"/>',
    spark:
      '<path d="M12 3.5 13.8 10.2 20.5 12 13.8 13.8 12 20.5 10.2 13.8 3.5 12 10.2 10.2Z"/>',
    road:
      '<path d="M7.5 20.5 10.5 3.5M16.5 20.5 13.5 3.5"/><path d="M12 6v2.5M12 11.5V14M12 17.5V20"/>',
    song:
      '<path d="M9 17.5V6.5l10-2.2v11"/><circle cx="6.6" cy="17.5" r="2.4"/><circle cx="16.6" cy="15.3" r="2.4"/>',
    houses:
      '<path d="M2.5 19.5V12l4.2-3.6 4.2 3.6v7.5z"/><path d="M13.1 19.5V12l4.2-3.6 4.2 3.6v7.5z"/>' +
      '<rect class="icon-lit" x="5.4" y="13.4" width="2.6" height="2.6" rx=".4"/><rect class="icon-lit" x="16" y="13.4" width="2.6" height="2.6" rx=".4"/>',
    aurora:
      '<path d="M3 15c3-6 6 2 9-4s6-3 9-7"/><path d="M3 19.5c3-4 6 1 9-3s6-2 9-5"/><circle cx="18.5" cy="14.5" r=".8" fill="currentColor"/>'
  };

  // Trả về chuỗi SVG; className để mỗi nơi tự chỉnh cỡ.
  function icon(name, className) {
    return '<svg class="' + (className || 'icon') + '" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" ' +
      'stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' + (ICONS[name] || '') + '</svg>';
  }

  NNBT.icons = { icon, has: (name) => Object.prototype.hasOwnProperty.call(ICONS, name) };
})(window.NNBT);

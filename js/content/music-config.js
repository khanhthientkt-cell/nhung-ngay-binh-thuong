/*
 * music-config.js — Nhạc nền.
 *
 * Nhạc phát bằng cách NHÚNG video YouTube (không tải, không lưu tệp nhạc trong dự án).
 * Đổi bài: thay `youtube` bằng mã video (phần sau "youtu.be/" hoặc "v=" trong link).
 * Để youtube: null → không có nhạc, khung nhạc và nút âm thanh tự ẩn.
 *
 * Theo quy định của YouTube, khung video phải hiện rõ trên màn hình (tối thiểu 200×200 px), không được ẩn.
 * Nhạc tự chạy từ cú bấm đầu tiên (trình duyệt không cho phát trước đó) và chạy liền qua mọi màn hình.
 */
window.NNBT = window.NNBT || {};

window.NNBT.musicConfig = {
  youtube: 'FN7ALfpGxiI', // https://youtu.be/FN7ALfpGxiI — MV chính thức (đổi bài ngày 16/10/2026, trước đây là "Vết mưa" piano cover)
  title: 'Nơi này có anh – Sơn Tùng M-TP',
  credit: 'MV chính thức: Sơn Tùng M-TP Official',
  volume: 0.5
};
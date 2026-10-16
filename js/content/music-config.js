/*
 * music-config.js — Nhạc nền.
 *
 * Nhạc phát bằng cách NHÚNG video YouTube (không tải, không lưu tệp nhạc trong dự án).
 * Thêm / đổi bài: sửa danh sách `tracks` (`youtube` = mã video, phần sau "youtu.be/" hoặc "v=" trong link).
 * Bỏ qua đoạn mở đầu của mỗi bài: đặt `start` = số giây nhạc bắt đầu vào.
 * Để tracks: [] → không có nhạc, khung nhạc và nút âm thanh tự ẩn.
 *
 * Theo quy định của YouTube, khung video phải hiện rõ trên màn hình (tối thiểu 200×200 px), không được ẩn.
 * Nhạc tự chạy từ cú bấm đầu tiên (trình duyệt không cho phát trước đó) và chạy liền qua mọi màn hình.
 */
window.NNBT = window.NNBT || {};

window.NNBT.musicConfig = {
  // Danh sách phát (16/10/2026: chỉ còn bài của RIO; đã bỏ "Nơi này có anh" theo ý anh).
  // start: giây bắt đầu phát, để bỏ qua đoạn phim mở đầu của MV. Hết bài thì quay lại đúng giây này.
  tracks: [
    {
      youtube: '2VMG0ZwNjMg', // https://youtu.be/2VMG0ZwNjMg
      start: 0,
      title: 'Vạn vật như muốn ta bên nhau – RIO',
      credit: 'MV chính thức: RIO Official'
    }
  ],
  volume: 0.7
};
/*
 * state.js — Quản lý trạng thái, tách khỏi giao diện.
 *
 * - Một nguồn trạng thái duy nhất; giao diện đọc qua store.get() và đăng ký thay đổi qua store.subscribe().
 * - Mọi thay đổi đi qua store.update(fn), sau đó được kiểm tra hợp lệ (sanitize) và lưu vào localStorage.
 * - Dữ liệu lưu bị lỗi, sai phiên bản hoặc không hợp lệ → tự quay về trạng thái mặc định.
 * - Chỉ lưu tiến trình và lựa chọn giao diện. Không lưu lời nhắn cá nhân, không gửi gì ra ngoài.
 * - Không có chỗ nào tự động mở khóa hay đánh dấu hoàn thành chương. Các hàm unlock/complete
 *   chỉ được gọi từ những bước sau, khi nội dung chương đã được duyệt.
 */
window.NNBT = window.NNBT || {};

(function (NNBT) {
  'use strict';

  const STORAGE_KEY = 'nnbt.progress';
  const SCHEMA_VERSION = 1;
  const FIRST_CHAPTER = 'prologue';
  const TRIP_ID_PATTERN = /^[a-z][a-z0-9-]{0,31}$/;
  const SCREEN_ID_PATTERN = /^[a-z][a-z0-9-]{0,31}$/;

  function defaultState() {
    return {
      version: SCHEMA_VERSION,
      screen: 'start',          // màn hình đang hiển thị
      resumeScreen: null,       // màn hình truyện gần nhất (điểm "Tiếp tục"), vd 'letter', 'map'
      chapter: null,            // chương đang đọc dở
      scene: 0,                 // cảnh trong chương đang đọc dở (ở lá thư: số đoạn đã hiện)
      progress: {
        started: false,
        unlocked: [FIRST_CHAPTER], // chương đã mở
        completed: [],             // chương đã đi hết
        seen: {}                   // { chapterId: [sceneId, ...] } — kỷ niệm đã xem
      },
      audio: {
        muted: false               // nhạc nền tự chạy từ cú bấm đầu tiên; chỉ dừng khi người chơi tắt tiếng
      },
      replay: {                    // chế độ xem lại — chỉ tồn tại trong phiên, không lưu
        active: false,
        chapter: null
      },
      choices: {
        trip: null                 // lựa chọn chuyến đi ở Chương 5 (dùng ở bước sau)
      }
    };
  }

  // ---------- Kiểm tra hợp lệ ----------

  function chapterIds() {
    return NNBT.story ? NNBT.story.chapterIds() : [FIRST_CHAPTER];
  }

  function asArray(v) {
    return Array.isArray(v) ? v : [];
  }

  function uniq(list) {
    return Array.from(new Set(list));
  }

  function isPlainObject(v) {
    return v !== null && typeof v === 'object' && !Array.isArray(v);
  }

  function sanitize(raw) {
    const ids = chapterIds();
    const s = defaultState();
    if (!isPlainObject(raw)) return s;

    if (typeof raw.screen === 'string' && raw.screen.length <= 40) s.screen = raw.screen;
    if (typeof raw.resumeScreen === 'string' && SCREEN_ID_PATTERN.test(raw.resumeScreen)) s.resumeScreen = raw.resumeScreen;
    if (ids.includes(raw.chapter)) s.chapter = raw.chapter;
    if (Number.isInteger(raw.scene) && raw.scene >= 0 && raw.scene < 200) s.scene = raw.scene;

    const p = isPlainObject(raw.progress) ? raw.progress : {};
    s.progress.started = p.started === true;
    s.progress.unlocked = uniq([FIRST_CHAPTER].concat(asArray(p.unlocked).filter((id) => ids.includes(id))));
    s.progress.completed = uniq(asArray(p.completed).filter((id) => ids.includes(id)));
    if (isPlainObject(p.seen)) {
      ids.forEach((id) => {
        const list = asArray(p.seen[id]).filter((x) => typeof x === 'string' && x.length <= 40);
        if (list.length) s.progress.seen[id] = uniq(list).slice(0, 100);
      });
    }

    s.audio.muted = isPlainObject(raw.audio) && raw.audio.muted === true;

    if (isPlainObject(raw.replay) && raw.replay.active === true && ids.includes(raw.replay.chapter)) {
      s.replay = { active: true, chapter: raw.replay.chapter };
    }

    if (isPlainObject(raw.choices) && typeof raw.choices.trip === 'string' && TRIP_ID_PATTERN.test(raw.choices.trip)) {
      s.choices.trip = raw.choices.trip;
    }
    return s;
  }

  // Phần được ghi xuống máy: bỏ chế độ xem lại (chỉ thuộc về phiên hiện tại).
  function toStored(state) {
    const copy = clone(state);
    delete copy.replay;
    return copy;
  }

  function clone(v) {
    return JSON.parse(JSON.stringify(v));
  }

  // ---------- localStorage (luôn bọc try/catch: chế độ ẩn danh hoặc bị chặn có thể ném lỗi) ----------

  const storage = {
    available: (function () {
      try {
        const k = '__nnbt_test__';
        window.localStorage.setItem(k, '1');
        window.localStorage.removeItem(k);
        return true;
      } catch (e) {
        return false;
      }
    })(),
    read() {
      if (!this.available) return { status: 'unavailable', data: null };
      let text;
      try {
        text = window.localStorage.getItem(STORAGE_KEY);
      } catch (e) {
        return { status: 'unavailable', data: null };
      }
      if (!text) return { status: 'empty', data: null };
      try {
        const data = JSON.parse(text);
        if (!isPlainObject(data) || data.version !== SCHEMA_VERSION) return { status: 'corrupt', data: null };
        return { status: 'ok', data };
      } catch (e) {
        return { status: 'corrupt', data: null };
      }
    },
    write(state) {
      if (!this.available) return false;
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(toStored(state)));
        return true;
      } catch (e) {
        return false;
      }
    },
    clear() {
      if (!this.available) return;
      try {
        window.localStorage.removeItem(STORAGE_KEY);
      } catch (e) { /* bỏ qua */ }
    }
  };

  // ---------- Store ----------

  const loaded = storage.read();
  let state = loaded.status === 'ok' ? sanitize(loaded.data) : defaultState();
  if (loaded.status === 'corrupt') storage.clear();

  const listeners = new Set();

  function get() {
    return clone(state);
  }

  /**
   * Cập nhật trạng thái.
   * @param {(draft: object) => void} recipe  Hàm sửa trực tiếp trên bản nháp.
   * @param {{ persist?: boolean }} [opts]
   */
  function update(recipe, opts) {
    const draft = clone(state);
    recipe(draft);
    const prev = state;
    state = sanitize(draft);
    if (!opts || opts.persist !== false) storage.write(state);
    const snapshot = clone(state);
    listeners.forEach((fn) => {
      try {
        fn(snapshot, prev);
      } catch (e) {
        console.error('[state] Lỗi trong listener:', e);
      }
    });
  }

  function subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  }

  function reset() {
    storage.clear();
    update((draft) => {
      Object.keys(draft).forEach((k) => delete draft[k]);
      Object.assign(draft, defaultState());
    });
  }

  // ---------- Hàm tiện ích cho các bước sau ----------

  function isUnlocked(chapterId) {
    return state.progress.unlocked.includes(chapterId);
  }

  function isCompleted(chapterId) {
    return state.progress.completed.includes(chapterId);
  }

  function unlockChapter(chapterId) {
    update((s) => {
      if (!s.progress.unlocked.includes(chapterId)) s.progress.unlocked.push(chapterId);
    });
  }

  function completeChapter(chapterId) {
    update((s) => {
      if (!s.progress.completed.includes(chapterId)) s.progress.completed.push(chapterId);
    });
  }

  function markSeen(chapterId, sceneId) {
    update((s) => {
      const list = s.progress.seen[chapterId] || (s.progress.seen[chapterId] = []);
      if (!list.includes(sceneId)) list.push(sceneId);
    });
  }

  NNBT.store = {
    get,
    update,
    subscribe,
    reset,
    isUnlocked,
    isCompleted,
    unlockChapter,
    completeChapter,
    markSeen,
    loadStatus: loaded.status,          // 'ok' | 'empty' | 'corrupt' | 'unavailable'
    storageAvailable: storage.available,
    // Chỉ để kiểm thử
    _sanitize: sanitize,
    _defaultState: defaultState,
    STORAGE_KEY
  };
})(window.NNBT);

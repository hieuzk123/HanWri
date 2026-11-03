# PROJECT_STATE: HanWri (Chinese Handwriting & Character Practice App)

> **Trạng thái hiện tại**: Hoàn thành toàn diện các tính năng cốt lõi, Chỉnh sửa Bộ từ/Từ vựng và Hệ thống Ôn tập lặp lại ngắt quãng (Task 12: Spaced Repetition Review Mode - SRS) - Sẵn sàng nghiệm thu & đóng gói  
> **Cập nhật lần cuối**: 2026-11-04  
> **Mục tiêu dự án**: Xây dựng ứng dụng web/desktop hỗ trợ học và luyện viết chữ Hán dựa trên thư viện `hanzi-writer`, tích hợp quản lý bộ từ, hoạt ảnh nét viết, 2 chế độ luyện viết (đồ nét theo thứ tự & nhận diện viết tự do), chế độ Ôn tập lặp lại ngắt quãng (SRS 4 mức độ nhớ), cùng khả năng nhập từ vựng qua CSV/Excel, chỉnh sửa chi tiết bộ từ & từ vựng, và luyện viết nhanh mọi chữ Hán.

---

## 1. Cấu trúc thư mục dự án (Project Structure)
```
HanWri/
├── docs/                           # Tài liệu đặc tả kỹ thuật và kế hoạch thực thi
│   ├── hanwri-plan.md
│   └── hanwri-spec.md
├── public/                         # Tài nguyên tĩnh (favicon, icons)
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── components/
│   │   ├── deck/
│   │   │   ├── AddWordModal.test.tsx    # Unit tests cho AddWordModal (render, validate, submit, close)
│   │   │   ├── AddWordModal.tsx         # Modal nhập và thêm từ mới thủ công vào bộ từ
│   │   │   ├── CreateDeckModal.test.tsx # Unit tests cho CreateDeckModal (render, validate, submit, close)
│   │   │   ├── CreateDeckModal.tsx      # Modal tạo bộ từ vựng mới
│   │   │   ├── DeckDetail.test.tsx      # Unit tests cho DeckDetail & Practice session (view, add, edit, delete, modes, nav)
│   │   │   ├── DeckDetail.tsx           # Chi tiết bộ từ, danh sách từ & Practice mode switcher (Animation, Quiz, Freehand)
│   │   │   ├── DeckImporter.test.tsx    # Unit tests cho DeckImporter (render, download template, parse, drag-drop, errors, submit)
│   │   │   ├── DeckImporter.tsx         # Modal nhập bộ từ qua file Excel (.xlsx, .xls) hoặc CSV kèm preview & download template
│   │   │   ├── DeckList.test.tsx        # Unit tests cho DeckList (render list, card click, edit, create, import, empty state)
│   │   │   ├── DeckList.tsx             # Danh sách bộ từ vựng, số lượng từ, trigger tạo mới, sửa & import
│   │   │   ├── EditDeckModal.test.tsx   # Unit tests cho EditDeckModal (prefill, validate, submit, close)
│   │   │   ├── EditDeckModal.tsx        # Modal chỉnh sửa thông tin bộ từ vựng (tên, mô tả)
│   │   │   ├── EditWordModal.test.tsx   # Unit tests cho EditWordModal (prefill, validate, submit, close)
│   │   │   └── EditWordModal.tsx        # Modal chỉnh sửa từ vựng (Hán tự, Pinyin, Hán Việt, Nghĩa, Ghi chú)
│   │   ├── grid/
│   │   │   ├── CharacterGrid.test.tsx  # Unit tests kiểm thử khung ô chữ Mễ/Điền
│   │   │   └── CharacterGrid.tsx       # Component SVG render ô chữ MiZiGe, TianZiGe, None
│   │   ├── practice/
│   │   │   ├── FreehandCanvas.test.tsx # Unit tests cho FreehandCanvas (render, ink capture, undo, clear, check)
│   │   │   ├── FreehandCanvas.tsx      # Component canvas vẽ tự do, thu thập vector ink Google Input Tools & controls
│   │   │   ├── FreehandRecognitionView.test.tsx # Unit tests cho FreehandRecognitionView (rank feedback, onSuccess, model modal)
│   │   │   ├── FreehandRecognitionView.tsx      # Chế độ nhận diện tự do: tích hợp Canvas, API nhận diện, alert xếp hạng & modal xem mẫu chuẩn
│   │   │   ├── GuidedQuiz.test.tsx     # Unit tests cho GuidedQuiz (quiz mode, showOutline, hint, retry, mistakes)
│   │   │   ├── GuidedQuiz.tsx          # Component chế độ đồ nét theo thứ tự, đếm lỗi sai, gợi ý nét, ẩn/hiện bóng mờ
│   │   │   ├── StrokeAnimator.test.tsx # Unit tests cho StrokeAnimator (HanziWriter wrapper)
│   │   │   ├── StrokeAnimator.tsx      # Component hoạt ảnh nét viết chữ Hán, controls play/pause/reset/speed
│   │   │   ├── WordContainer.test.tsx  # Unit tests cho WordContainer (tách từ ghép, tabs, pronunciation)
│   │   │   └── WordContainer.tsx       # Component khung từ vựng, hỗ trợ từ đơn/từ ghép & render slot
│   │   └── review/
│   │       ├── ReviewModal.test.tsx    # Unit tests cho ReviewModal (chọn bộ từ, chế độ viết ẩn Hán tự, 4 mức SRS, học lại)
│   │       └── ReviewModal.tsx         # Modal phiên Ôn tập từ vựng theo phương pháp lặp lại ngắt quãng (SRS)
│   ├── db/
│   │   ├── db.test.ts              # Unit tests cho Dexie IndexedDB & Seed data & CRUD (bao gồm updateDeck, updateWord, recordWordReview)
│   │   ├── index.ts                # Khởi tạo HanWriDatabase & các hàm CRUD + SRS review update
│   │   └── seed.ts                 # Dữ liệu từ vựng mẫu HSK 1 ban đầu
│   ├── services/
│   │   ├── fileImportService.test.ts # Unit tests cho fileImportService (header normalization, row validation, template generation)
│   │   ├── fileImportService.ts      # Service phân tích file Excel/CSV qua SheetJS, chuẩn hóa cột & tạo file mẫu .xlsx
│   │   ├── handwritingApi.test.ts  # Unit tests cho Handwriting API service & evaluateMatch
│   │   ├── handwritingApi.ts       # Service gửi ink vectors tới Google Input Tools & đánh giá xếp hạng chữ Hán
│   │   ├── srsService.test.ts      # Unit tests cho thuật toán lặp lại ngắt quãng SRS (4 mức: Quên rồi, Khó, Tốt, Dễ)
│   │   └── srsService.ts           # Service tính toán lịch ôn tập tiếp theo (SM-2 rút gọn) & lọc từ đến hạn
│   ├── test/
│   │   └── setup.ts                # Cấu hình môi trường kiểm thử Vitest + jest-dom
│   ├── types/
│   │   └── index.ts                # Định nghĩa types & interfaces: Deck, Word, ReviewRating, PracticeStats,...
│   ├── App.test.tsx                # Integration tests kiểm tra toàn bộ luồng App, seed DB, DeckList, DeckDetail, Modals, Quick Practice, ReviewModal
│   ├── App.tsx                     # Component gốc HanWri kết nối Header, Quick Practice, ReviewModal, DeckList, DeckDetail, Modals
│   ├── index.css                   # Tailwind CSS directives & global typography
│   └── main.tsx                    # Entry point React 19 DOM render
├── index.html                      # HTML root template
├── package.json                    # Khai báo dependencies & test scripts
├── postcss.config.js               # Cấu hình PostCSS với TailwindCSS & Autoprefixer
├── tailwind.config.js              # Theme Tailwind mở rộng bảng màu `chinese.*`
├── tsconfig.json                   # Root TypeScript project references
├── tsconfig.app.json               # Cấu hình TS bundler, path alias @/* & vitest types
├── tsconfig.node.json              # Cấu hình TS cho Vite configuration
├── vite.config.ts                  # Cấu hình Vite, React plugin, alias @/ và Vitest runner
└── PROJECT_STATE.md                # Tài liệu theo dõi tiến độ và cấu trúc dự án
```

---

## 2. Danh sách tính năng (Feature Roadmap & Status)

| ID | Tính năng | Trạng thái | Ghi chú |
|---|---|---|---|
| F0 | Thiết lập nền tảng dự án (Project Scaffolding) | ✅ Hoàn thành | React 19 + TypeScript + TailwindCSS v3 + Vite + Vitest + path aliases |
| F1 | Hiển thị chữ & Hoạt ảnh nét viết (Stroke Animation) | ✅ Hoàn thành | Hoàn thành `StrokeAnimator` (HanziWriter wrapper, play/pause/reset/speed) & `WordContainer` (từ đơn & từ ghép) |
| F2 | Chế độ luyện viết 1: Đồ nét theo mẫu (Guided Stroke Quiz) | ✅ Hoàn thành | Bắt lỗi nét sai, gợi ý nét (highlightStroke), đếm số lần viết sai, hỗ trợ tắt nét mờ (`showOutline={false}`) |
| F3 | Chế độ luyện viết 2: Nhận diện chữ viết tự do (Freehand Recognition) | ✅ Hoàn thành | Hoàn thành khung vẽ `FreehandCanvas`, service `handwritingApi` (Google Input Tools API), đánh giá thứ hạng và `FreehandRecognitionView` |
| F4 | Quản lý & Chỉnh sửa bộ từ vựng (Word Decks / Lists) | ✅ Hoàn thành | Tầng dữ liệu Dexie IndexedDB + UI `DeckList`, `DeckDetail`, `AddWordModal`, `CreateDeckModal`, `EditDeckModal`, `EditWordModal` |
| F5 | Nhập/Xuất bộ từ qua CSV / Excel (.xlsx) | ✅ Hoàn thành | Service `fileImportService` (SheetJS xlsx, chuẩn hóa đa tiêu đề, file mẫu) & Modal UI `DeckImporter` (kéo thả, preview, auto deck title) |
| F6 | Giao diện người dùng & Tối ưu trải nghiệm (UI/UX) | ✅ Hoàn thành | Hoàn thành component `CharacterGrid` (米字格 & 田字格), responsive layout, Quick Practice drawer/modal, thanh tìm kiếm luyện nhanh |
| F7 | Chế độ Ôn tập từ vựng lặp lại ngắt quãng (SRS Review Mode) | ✅ Hoàn thành | Nút "Ôn tập" trên Header, chọn bộ từ đến hạn, ẩn Hán tự (chỉ hiện Pinyin + nghĩa), kiểm tra qua Đồ chữ (ẩn nét mờ) hoặc Khung viết, 4 mức đánh giá (Quên rồi, Khó, Tốt, Dễ) và học lại từ sai |

*Ký hiệu: 📋 Lập kế hoạch | ⏳ Đang thực hiện | ✅ Hoàn thành*

---

## 3. Lịch sử cập nhật phiên làm việc (Changelog)
- **2026-11-04 (Task 12 - Spaced Repetition Review Feature)**: Hoàn thành tính năng Ôn tập từ vựng (SRS Review Mode).
  - Tầng Service & DB (`src/services/srsService.ts`, `src/db/index.ts`): Xây dựng thuật toán lặp lại ngắt quãng với 4 mức đánh giá: `1 - Quên rồi` (10 phút, reset chuỗi nhớ), `2 - Khó` (1 ngày / `1.2x`), `3 - Tốt` (3 ngày / `easeFactor`), `4 - Dễ` (7 ngày / `1.3x * easeFactor`). Bổ sung `recordWordReview` cập nhật lịch ôn tập tiếp theo vào IndexedDB.
  - Nâng cấp `GuidedQuiz`: Hỗ trợ prop `showOutline={false}` để tắt nét chữ mờ khi kiểm tra trí nhớ và báo số lỗi sai qua `onMistake` / `onQuizComplete`.
  - Giao diện `ReviewModal` (`src/components/review/ReviewModal.tsx`): Cho phép chọn bộ từ cần ôn tập (hiển thị số từ đến hạn cần ôn hôm nay), ẩn mặt chữ Hán (chỉ hiện Pinyin + Âm Hán Việt + Ý nghĩa), chỉ cung cấp 2 chế độ kiểm tra (Đồ chữ theo thứ tự và Khung viết & Nhận diện). Nếu người dùng viết đúng toàn bộ chữ trong từ: lật mở chữ Hán và hiển thị 4 nút chọn mức độ nhớ kèm thời gian ôn tập cụ thể. Nếu sai quá 3 lỗi hoặc bấm "Không nhớ / Xem đáp án": hiển thị hoạt ảnh mẫu chữ để học lại và đẩy từ đó xuống cuối hàng đợi ôn tập trong phiên.
  - Tích hợp nút **"Ôn tập"** trên Header cùng hàng với nút **"Luyện ngay"** trong `App.tsx`.
  - Đạt **138/138 tests passed** (19 test files), `oxlint` 0 lỗi/0 cảnh báo, `tsc -b` 0 lỗi, build production thành công.
- **2026-11-04 (Task 11 - Edit Deck & Edit Word Feature)**: Hoàn thành triển khai chức năng chỉnh sửa ở mức độ bộ từ và mức độ từ vựng (`updateDeck`, `updateWord`, `EditDeckModal`, `EditWordModal`). Đạt 120/120 tests toàn dự án (17 test files).
- **2026-11-03 (Task 10)**: Hoàn thành tích hợp toàn diện ứng dụng `App.tsx` (App Integration, Quick Practice Modal & Polish). Đạt 100/100 tests toàn dự án (15 test files).
- **2026-11-03 (Task 9)**: Hoàn thành service `fileImportService` và component `DeckImporter` cho việc nhập bộ từ qua bảng tính Excel (.xlsx, .xls) và CSV.
- **2026-11-03 (Task 8)**: Hoàn thành giao diện quản lý bộ từ vựng và phiên luyện tập tương tác (Deck Management & Practice Session UI).
- **2026-11-03 (Task 7)**: Hoàn thành service `handwritingApi` và component `FreehandRecognitionView`.
- **2026-11-03 (Task 6)**: Hoàn thành component `FreehandCanvas`.
- **2026-11-03 (Task 5)**: Hoàn thành component `GuidedQuiz`.
- **2026-11-02 (Task 4)**: Hoàn thành component `StrokeAnimator` và component `WordContainer`.
- **2026-11-02 (Task 3)**: Hoàn thành component `CharacterGrid`.
- **2026-11-02 (Task 2)**: Hoàn thành thiết lập tầng Database & Data Models với Dexie IndexedDB (`HanWriDatabase`).
- **2026-11-02 (Task 1)**: Hoàn thành thiết lập nền tảng dự án (Vite 8, React 19, TypeScript, TailwindCSS v3, Vitest 5).

---

## 4. Hướng dẫn tiếp tục phiên làm việc tiếp theo (Resume Instructions for Next Session)

- **Vị trí hiện tại**: Đã hoàn thành toàn bộ **Task 1 đến Task 12** (F0 đến F7).
- **Tình trạng kiểm thử**: 138/138 tests passed (19 test files), `oxlint` 0 errors / 0 warnings, `tsc -b` 0 errors.
- **Các lệnh kiểm thử và build production**:
  ```bash
  # Chạy toàn bộ 138 unit & integration tests:
  npx vitest run

  # Kiểm tra TypeScript strict mode:
  npx tsc -b

  # Kiểm tra linter:
  npm run lint

  # Build gói ứng dụng production:
  npm run build

  # Khởi chạy preview production:
  npm run preview
  ```

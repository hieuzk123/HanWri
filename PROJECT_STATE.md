# PROJECT_STATE: HanWri (Chinese Handwriting & Character Practice App)

> **Trạng thái hiện tại**: Giai đoạn 3 - Quản lý bộ từ & Nhập xuất (Task 9: CSV & Excel (.xlsx) Import / Export Service & UI)  
> **Cập nhật lần cuối**: 2026-11-03  
> **Mục tiêu dự án**: Xây dựng ứng dụng web/desktop hỗ trợ học và luyện viết chữ Hán dựa trên thư viện `hanzi-writer`, tích hợp quản lý bộ từ, hoạt ảnh nét viết, 2 chế độ luyện viết (đồ nét theo thứ tự & nhận diện viết tự do), cùng khả năng nhập từ vựng qua CSV/Excel.

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
│   │   │   ├── DeckDetail.test.tsx      # Unit tests cho DeckDetail & Practice session (view, add, delete, modes, nav)
│   │   │   ├── DeckDetail.tsx           # Chi tiết bộ từ, danh sách từ & Practice mode switcher (Animation, Quiz, Freehand)
│   │   │   ├── DeckImporter.test.tsx    # Unit tests cho DeckImporter (render, download template, parse, drag-drop, errors, submit)
│   │   │   ├── DeckImporter.tsx         # Modal nhập bộ từ qua file Excel (.xlsx, .xls) hoặc CSV kèm preview & download template
│   │   │   ├── DeckList.test.tsx        # Unit tests cho DeckList (render list, card click, create, import, empty state)
│   │   │   └── DeckList.tsx             # Danh sách bộ từ vựng, số lượng từ, trigger tạo mới & import
│   │   ├── grid/
│   │   │   ├── CharacterGrid.test.tsx  # Unit tests kiểm thử khung ô chữ Mễ/Điền
│   │   │   └── CharacterGrid.tsx       # Component SVG render ô chữ MiZiGe, TianZiGe, None
│   │   └── practice/
│   │       ├── FreehandCanvas.test.tsx # Unit tests cho FreehandCanvas (render, ink capture, undo, clear, check)
│   │       ├── FreehandCanvas.tsx      # Component canvas vẽ tự do, thu thập vector ink Google Input Tools & controls
│   │       ├── FreehandRecognitionView.test.tsx # Unit tests cho FreehandRecognitionView (rank feedback, onSuccess, model modal)
│   │       ├── FreehandRecognitionView.tsx      # Chế độ nhận diện tự do: tích hợp Canvas, API nhận diện, alert xếp hạng & modal xem mẫu chuẩn
│   │       ├── GuidedQuiz.test.tsx     # Unit tests cho GuidedQuiz (quiz mode, hint, retry, mistakes)
│   │       ├── GuidedQuiz.tsx          # Component chế độ đồ nét theo thứ tự, đếm lỗi sai, gợi ý nét, chúc mừng hoàn thành
│   │       ├── StrokeAnimator.test.tsx # Unit tests cho StrokeAnimator (HanziWriter wrapper)
│   │       ├── StrokeAnimator.tsx      # Component hoạt ảnh nét viết chữ Hán, controls play/pause/reset/speed
│   │       ├── WordContainer.test.tsx  # Unit tests cho WordContainer (tách từ ghép, tabs, pronunciation)
│   │       └── WordContainer.tsx       # Component khung từ vựng, hỗ trợ từ đơn/từ ghép & render slot
│   ├── db/
│   │   ├── db.test.ts              # Unit tests cho Dexie IndexedDB & Seed data
│   │   ├── index.ts                # Khởi tạo HanWriDatabase & các hàm CRUD
│   │   └── seed.ts                 # Dữ liệu từ vựng mẫu HSK 1 ban đầu
│   ├── services/
│   │   ├── fileImportService.test.ts # Unit tests cho fileImportService (header normalization, row validation, template generation)
│   │   ├── fileImportService.ts      # Service phân tích file Excel/CSV qua SheetJS, chuẩn hóa cột & tạo file mẫu .xlsx
│   │   ├── handwritingApi.test.ts  # Unit tests cho Handwriting API service & evaluateMatch
│   │   └── handwritingApi.ts       # Service gửi ink vectors tới Google Input Tools & đánh giá xếp hạng chữ Hán
│   ├── test/
│   │   └── setup.ts                # Cấu hình môi trường kiểm thử Vitest + jest-dom
│   ├── types/
│   │   └── index.ts                # Định nghĩa types & interfaces: Deck, Word, PracticeStats,...
│   ├── App.test.tsx                # Unit test kiểm tra giao diện khởi đầu App
│   ├── App.tsx                     # Component gốc HanWri với Header & Welcome card
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
| F2 | Chế độ luyện viết 1: Đồ nét theo mẫu (Guided Stroke Quiz) | ✅ Hoàn thành | Bắt lỗi nét sai, gợi ý nét (highlightStroke), đếm số lần viết sai, chúc mừng hoàn thành |
| F3 | Chế độ luyện viết 2: Nhận diện chữ viết tự do (Freehand Recognition) | ✅ Hoàn thành | Hoàn thành khung vẽ `FreehandCanvas`, service `handwritingApi` (Google Input Tools API), đánh giá thứ hạng (1: hoàn hảo, 2-3: chính xác, >3: gần đúng, -1: sai) và `FreehandRecognitionView` với modal xem mẫu chuẩn `StrokeAnimator` |
| F4 | Quản lý bộ từ vựng (Word Decks / Lists) | ✅ Hoàn thành | Tầng dữ liệu Dexie IndexedDB + UI `DeckList`, `DeckDetail` (tích hợp 3 chế độ luyện tập), `AddWordModal`, `CreateDeckModal` |
| F5 | Nhập/Xuất bộ từ qua CSV / Excel (.xlsx) | ✅ Hoàn thành | Service `fileImportService` (SheetJS xlsx, chuẩn hóa đa tiêu đề, file mẫu) & Modal UI `DeckImporter` (kéo thả, preview, auto deck title) |
| F6 | Giao diện người dùng & Tối ưu trải nghiệm (UI/UX) | ⏳ Đang thực hiện | Hoàn thành component `CharacterGrid` (米字格 & 田字格), responsive layout |

*Ký hiệu: 📋 Lập kế hoạch | ⏳ Đang thực hiện | ✅ Hoàn thành*

---

## 3. Lịch sử cập nhật phiên làm việc (Changelog)
- **2026-11-03 (Task 9)**: Hoàn thành service `fileImportService` và component `DeckImporter` cho việc nhập bộ từ qua bảng tính Excel (.xlsx, .xls) và CSV. Triển khai chuẩn hóa header đa ngôn ngữ/biến thể ('Chữ Hán', 'Từ vựng', 'hanzi', 'Phiên âm', 'pinyin', 'Hán Việt', 'sino_vietnamese', 'Nghĩa', 'meaning', 'Ghi chú', 'notes'), lọc hàng trống/hợp lệ, sinh và tải file Excel mẫu `downloadSampleExcelTemplate` / `generateSampleExcelTemplate`. Triển khai modal `DeckImporter` với khu vực kéo-thả trực quan, tự động đặt tên bộ từ theo tên file, đếm trước số lượng từ hợp lệ, xử lý lỗi chi tiết và xác nhận nhập `onImportSuccess`. 19 unit tests mới (tổng 93/93 tests toàn dự án), `oxlint` 0 lỗi/cảnh báo, `tsc -b` 0 lỗi.
- **2026-11-03 (Task 8)**: Hoàn thành giao diện quản lý bộ từ vựng và phiên luyện tập tương tác (Deck Management & Practice Session UI). Triển khai `DeckList` (hiển thị danh sách bộ từ, số lượng từ, trạng thái rỗng, nút trigger tạo bộ từ & nhập Excel/CSV), `DeckDetail` (danh sách từ, nút thêm từ, xóa từ, điều hướng từ trước/sau, bộ chuyển 3 chế độ luyện tập: xem hoạt ảnh nét, đồ chữ theo thứ tự, khung viết & nhận diện), `AddWordModal` (form nhập Hán tự, Pinyin, Hán Việt, Nghĩa, Ghi chú kèm xác thực), và `CreateDeckModal` (form tạo bộ từ kèm xác thực). Triển khai theo chuẩn TDD với 22 unit tests mới (tổng 74/74 tests toàn dự án), `oxlint` 0 lỗi/cảnh báo, `tsc -b` 0 lỗi.
- **2026-11-03 (Task 7)**: Hoàn thành service `handwritingApi` và component `FreehandRecognitionView`. Triển khai `recognizeHandwriting` gửi ink vector tới Google Input Tools Handwriting IME API, tính toán thứ hạng chữ mục tiêu trong danh sách ứng viên qua `evaluateMatch`. Component `FreehandRecognitionView` hiển thị trạng thái đánh giá phản hồi trực quan theo 4 cấp bậc (Tuyệt vời rank 1, Chính xác rank 2-3, Gần đúng rank >3, Chưa nhận diện đúng rank -1) và modal overlay xem lại mẫu viết chuẩn với `StrokeAnimator`. 100% test pass (52/52 tests toàn dự án), `oxlint` 0 lỗi/cảnh báo, `tsc -b` 0 lỗi.
- **2026-11-03 (Task 6)**: Hoàn thành component `FreehandCanvas` (khung vẽ tự do trên nền `CharacterGrid` Mễ tự cách, thu thập vector ink theo chuẩn Google Input Tools `[xs, ys, timestamps]`, hỗ trợ các thao tác "Xóa nét" - Undo, "Xóa hết" - Clear, và "Kiểm tra" - trigger `onCheck(strokes, width, height)` gửi dữ liệu nét vẽ). Triển khai theo quy trình TDD với 9 unit tests kiểm thử render, trạng thái vô hiệu hóa/kích hoạt của các nút điều khiển, tương tác pointer capture, undo, clear, và `isLoading`. 100% test pass (38/38 tests), `oxlint` 0 lỗi/cảnh báo, `tsc -b` 0 lỗi.
- **2026-11-03 (Task 5)**: Hoàn thành component `GuidedQuiz` (bọc engine quiz của `hanzi-writer` trên nền `CharacterGrid` Mễ tự cách, theo dõi tiến độ nét viết `currentStroke / totalStrokes`, bắt lỗi sai nét trực tiếp, nút "Gợi ý nét" gọi `highlightStroke`, nút "Làm lại" khởi động lại bài luyện tập, và hiển thị overlay chúc mừng kèm số lần sai khi hoàn thành). Triển khai theo quy trình TDD với đầy đủ 7 unit tests kiểm thử trạng thái, callbacks và mocks. 100% test pass (29/29 tests), `oxlint` 0 cảnh báo/lỗi, `tsc -b` 0 lỗi.
- **2026-11-02 (Task 4)**: Hoàn thành component `StrokeAnimator` (bọc `hanzi-writer` điều khiển hoạt ảnh nét viết chữ Hán với các nút Play, Pause, Reset, tùy chỉnh tốc độ 0.5x - 2x trên nền `CharacterGrid`) và component `WordContainer` (tách từ ghép thành các tab chữ riêng biệt, hiển thị Pinyin, Hán-Việt, nghĩa và cung cấp custom render slot). Triển khai theo quy trình TDD với đầy đủ unit test cho `WordContainer` và `StrokeAnimator`. 100% test pass (22/22 tests), `oxlint` 0 lỗi/cảnh báo và TypeScript check không có lỗi.
- **2026-11-02 (Task 3)**: Hoàn thành component `CharacterGrid` kết xuất khung ô chữ luyện viết Hán tự bằng SVG theo chuẩn Mễ tự cách (米字格 - MiZiGe) và Điền tự cách (田字格 - TianZiGe), hỗ trợ tùy chỉnh kích thước, nét đứt, màu sắc và chế độ `none`. Viết unit test theo TDD kiểm thử đầy đủ các chế độ hiển thị và tùy biến CSS style. 100% test pass (13/13 tests) và TypeScript strict check thành công.
- **2026-11-02 (Task 2)**: Hoàn thành thiết lập tầng Database & Data Models với Dexie IndexedDB (`HanWriDatabase`). Định nghĩa interfaces (`Deck`, `Word`, `RecognitionCandidate`, `HandwritingRecognitionResult`, `PracticeStats`). Cài đặt `fake-indexeddb`, viết unit test theo TDD kiểm thử hàm khởi tạo seed dữ liệu HSK 1 và các hàm CRUD (`createDeck`, `addWordToDeck`, `getDeckWithWords`, `deleteWord`). 100% test pass và TypeScript strict mode xác thực thành công (0 errors).
- **2026-11-02 (Task 1)**: Hoàn thành thiết lập nền tảng dự án (Vite 8, React 19, TypeScript, TailwindCSS v3, Vitest 5). Thiết lập alias `@/`, cấu hình màu sắc cổ phong `chinese.*`, viết unit test theo TDD cho `App.tsx`, build và test thành công 100%.
- **2026-11-02 (Khởi tạo)**: Khởi tạo tài liệu `PROJECT_STATE.md`, phân tích yêu cầu kỹ thuật và xây dựng lộ trình các giai đoạn phát triển.

---

## 4. Hướng dẫn tiếp tục phiên làm việc tiếp theo (Resume Instructions for Next Session)

- **Vị trí hiện tại**: Đã hoàn thành nghiệm thu **Task 1, Task 2, Task 3, Task 4, Task 5, Task 6, Task 7, Task 8, Task 9**.
- **Task tiếp theo**: **Task 10: Complete App Assembly, Navigation & Integration Testing** (Kết nối App.tsx toàn bộ luồng DeckList -> DeckDetail -> Practice modes -> Modals CRUD & Import).
- **Kế hoạch chi tiết**: Tham khảo [docs/superpowers/plans/2026-11-02-hanwri-chinese-handwriting-app.md](file:///d:/HanWri/docs/superpowers/plans/2026-11-02-hanwri-chinese-handwriting-app.md#L1825).
- **Lệnh kiểm tra hiện trạng**:
  ```bash
  # Chạy toàn bộ 93 unit tests:
  npx vitest run

  # Kiểm tra TypeScript strict mode:
  npx tsc -b

  # Kiểm tra linter:
  npm run lint

  # Khởi chạy server phát triển local:
  npm run dev
  ```

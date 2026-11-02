# PROJECT_STATE: HanWri (Chinese Handwriting & Character Practice App)

> **Trạng thái hiện tại**: Giai đoạn 2 - Thành phần giao diện & Canvas (Task 4: HanziWriter Wrapper & Stroke Animator Component)  
> **Cập nhật lần cuối**: 2026-11-02  
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
│   │   ├── grid/
│   │   │   ├── CharacterGrid.test.tsx  # Unit tests kiểm thử khung ô chữ Mễ/Điền
│   │   │   └── CharacterGrid.tsx       # Component SVG render ô chữ MiZiGe, TianZiGe, None
│   │   └── practice/
│   │       ├── StrokeAnimator.test.tsx # Unit tests cho StrokeAnimator (HanziWriter wrapper)
│   │       ├── StrokeAnimator.tsx      # Component hoạt ảnh nét viết chữ Hán, controls play/pause/reset/speed
│   │       ├── WordContainer.test.tsx  # Unit tests cho WordContainer (tách từ ghép, tabs, pronunciation)
│   │       └── WordContainer.tsx       # Component khung từ vựng, hỗ trợ từ đơn/từ ghép & render slot
│   ├── db/
│   │   ├── db.test.ts              # Unit tests cho Dexie IndexedDB & Seed data
│   │   ├── index.ts                # Khởi tạo HanWriDatabase & các hàm CRUD
│   │   └── seed.ts                 # Dữ liệu từ vựng mẫu HSK 1 ban đầu
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
| F2 | Chế độ luyện viết 1: Đồ nét theo mẫu (Guided Stroke Quiz) | 📋 Lập kế hoạch | Bắt lỗi nét sai, gợi ý nét, đếm số lần viết |
| F3 | Chế độ luyện viết 2: Nhận diện chữ viết tự do (Freehand Recognition) | 📋 Lập kế hoạch | Khung vẽ tự do + thuật toán đối soát/nhận diện |
| F4 | Quản lý bộ từ vựng (Word Decks / Lists) | ⏳ Đang thực hiện | Hoàn thành tầng dữ liệu Dexie IndexedDB, CRUD helpers và dữ liệu mẫu HSK 1 (UI ở Task 8) |
| F5 | Nhập/Xuất bộ từ qua CSV / Excel (.xlsx) | 📋 Lập kế hoạch | Hỗ trợ template chuẩn, import hàng loạt |
| F6 | Giao diện người dùng & Tối ưu trải nghiệm (UI/UX) | ⏳ Đang thực hiện | Hoàn thành component `CharacterGrid` (米字格 & 田字格), responsive layout |

*Ký hiệu: 📋 Lập kế hoạch | ⏳ Đang thực hiện | ✅ Hoàn thành*

---

## 3. Lịch sử cập nhật phiên làm việc (Changelog)
- **2026-11-02 (Task 4)**: Hoàn thành component `StrokeAnimator` (bọc `hanzi-writer` điều khiển hoạt ảnh nét viết chữ Hán với các nút Play, Pause, Reset, tùy chỉnh tốc độ 0.5x - 2x trên nền `CharacterGrid`) và component `WordContainer` (tách từ ghép thành các tab chữ riêng biệt, hiển thị Pinyin, Hán-Việt, nghĩa và cung cấp custom render slot). Triển khai theo quy trình TDD với đầy đủ unit test cho `WordContainer` và `StrokeAnimator`. 100% test pass (22/22 tests), `oxlint` 0 lỗi/cảnh báo và TypeScript check không có lỗi.
- **2026-11-02 (Task 3)**: Hoàn thành component `CharacterGrid` kết xuất khung ô chữ luyện viết Hán tự bằng SVG theo chuẩn Mễ tự cách (米字格 - MiZiGe) và Điền tự cách (田字格 - TianZiGe), hỗ trợ tùy chỉnh kích thước, nét đứt, màu sắc và chế độ `none`. Viết unit test theo TDD kiểm thử đầy đủ các chế độ hiển thị và tùy biến CSS style. 100% test pass (13/13 tests) và TypeScript strict check thành công.
- **2026-11-02 (Task 2)**: Hoàn thành thiết lập tầng Database & Data Models với Dexie IndexedDB (`HanWriDatabase`). Định nghĩa interfaces (`Deck`, `Word`, `RecognitionCandidate`, `HandwritingRecognitionResult`, `PracticeStats`). Cài đặt `fake-indexeddb`, viết unit test theo TDD kiểm thử hàm khởi tạo seed dữ liệu HSK 1 và các hàm CRUD (`createDeck`, `addWordToDeck`, `getDeckWithWords`, `deleteWord`). 100% test pass và TypeScript strict mode xác thực thành công (0 errors).
- **2026-11-02 (Task 1)**: Hoàn thành thiết lập nền tảng dự án (Vite 8, React 19, TypeScript, TailwindCSS v3, Vitest 5). Thiết lập alias `@/`, cấu hình màu sắc cổ phong `chinese.*`, viết unit test theo TDD cho `App.tsx`, build và test thành công 100%.
- **2026-11-02 (Khởi tạo)**: Khởi tạo tài liệu `PROJECT_STATE.md`, phân tích yêu cầu kỹ thuật và xây dựng lộ trình các giai đoạn phát triển.


---

## 4. Hướng dẫn tiếp tục phiên làm việc tiếp theo (Resume Instructions for Next Session)

- **Vị trí hiện tại**: Đã hoàn thành nghiệm thu **Task 1, Task 2, Task 3, Task 4**.
- **Task tiếp theo**: **Task 5: Guided Stroke Tracing Quiz Mode** (Chế độ đồ chữ theo mẫu bắt lỗi sai và gợi ý nét).
- **Kế hoạch chi tiết**: Tham khảo [docs/superpowers/plans/2026-11-02-hanwri-chinese-handwriting-app.md](file:///d:/HanWri/docs/superpowers/plans/2026-11-02-hanwri-chinese-handwriting-app.md#L368).
- **Lệnh kiểm tra hiện trạng**:
  ```bash
  # Chạy toàn bộ 22 unit tests:
  npx vitest run

  # Kiểm tra TypeScript strict mode:
  npx tsc -b

  # Khởi chạy server phát triển local:
  npm run dev
  ```

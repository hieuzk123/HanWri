# PROJECT_STATE: HanWri (Chinese Handwriting & Character Practice App)

> **Trạng thái hiện tại**: Giai đoạn 1 - Thiết lập nền tảng dự án hoàn tất (Task 1: Project Scaffolding & Setup)  
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
│   ├── test/
│   │   └── setup.ts                # Cấu hình môi trường kiểm thử Vitest + jest-dom
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
| F1 | Hiển thị chữ & Hoạt ảnh nét viết (Stroke Animation) | 📋 Lập kế hoạch | Dựa trên `hanzi-writer`, hỗ trợ từ đơn và từ ghép |
| F2 | Chế độ luyện viết 1: Đồ nét theo mẫu (Guided Stroke Quiz) | 📋 Lập kế hoạch | Bắt lỗi nét sai, gợi ý nét, đếm số lần viết |
| F3 | Chế độ luyện viết 2: Nhận diện chữ viết tự do (Freehand Recognition) | 📋 Lập kế hoạch | Khung vẽ tự do + thuật toán đối soát/nhận diện |
| F4 | Quản lý bộ từ vựng (Word Decks / Lists) | 📋 Lập kế hoạch | Tạo, sửa, xóa bộ từ, lưu trữ cục bộ (IndexedDB/LocalStorage) |
| F5 | Nhập/Xuất bộ từ qua CSV / Excel (.xlsx) | 📋 Lập kế hoạch | Hỗ trợ template chuẩn, import hàng loạt |
| F6 | Giao diện người dùng & Tối ưu trải nghiệm (UI/UX) | 📋 Lập kế hoạch | Giao diện bảng viết ô chữ Mễ (米字格) / Điền (田字格), dark/light mode |

*Ký hiệu: 📋 Lập kế hoạch | ⏳ Đang thực hiện | ✅ Hoàn thành*

---

## 3. Lịch sử cập nhật phiên làm việc (Changelog)
- **2026-11-02 (Task 1)**: Hoàn thành thiết lập nền tảng dự án (Vite 8, React 19, TypeScript, TailwindCSS v3, Vitest 5). Thiết lập alias `@/`, cấu hình màu sắc cổ phong `chinese.*`, viết unit test theo TDD cho `App.tsx`, build và test thành công 100%.
- **2026-11-02 (Khởi tạo)**: Khởi tạo tài liệu `PROJECT_STATE.md`, phân tích yêu cầu kỹ thuật và xây dựng lộ trình các giai đoạn phát triển.

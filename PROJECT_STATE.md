# PROJECT_STATE: HanWri (Chinese Handwriting & Character Practice App)

> **Trạng thái hiện tại**: Giai đoạn khởi tạo & Lập kế hoạch kiến trúc (Phase 0: Planning & Brainstorming)  
> **Cập nhật lần cuối**: 2026-11-02  
> **Mục tiêu dự án**: Xây dựng ứng dụng web/desktop hỗ trợ học và luyện viết chữ Hán dựa trên thư viện `hanzi-writer`, tích hợp quản lý bộ từ, hoạt ảnh nét viết, 2 chế độ luyện viết (đồ nét theo thứ tự & nhận diện viết tự do), cùng khả năng nhập từ vựng qua CSV/Excel.

---

## 1. Cấu trúc thư mục dự án (Project Structure)
```
HanWri/
├── PROJECT_STATE.md               # File theo dõi trạng thái và cấu trúc dự án
```
*(Cấu trúc chi tiết sẽ được cập nhật liên tục khi khởi tạo mã nguồn và hoàn thành từng tính năng)*

---

## 2. Danh sách tính năng (Feature Roadmap & Status)

| ID | Tính năng | Trạng thái | Ghi chú |
|---|---|---|---|
| F0 | Thiết lập nền tảng dự án (Project Scaffolding) | ⏳ Đang chờ thống nhất | Công nghệ dự kiến: React + TypeScript + TailwindCSS + Vite |
| F1 | Hiển thị chữ & Hoạt ảnh nét viết (Stroke Animation) | 📋 Lập kế hoạch | Dựa trên `hanzi-writer`, hỗ trợ từ đơn và từ ghép |
| F2 | Chế độ luyện viết 1: Đồ nét theo mẫu (Guided Stroke Quiz) | 📋 Lập kế hoạch | Bắt lỗi nét sai, gợi ý nét, đếm số lần viết |
| F3 | Chế độ luyện viết 2: Nhận diện chữ viết tự do (Freehand Recognition) | 📋 Lập kế hoạch | Khung vẽ tự do + thuật toán đối soát/nhận diện |
| F4 | Quản lý bộ từ vựng (Word Decks / Lists) | 📋 Lập kế hoạch | Tạo, sửa, xóa bộ từ, lưu trữ cục bộ (IndexedDB/LocalStorage) |
| F5 | Nhập/Xuất bộ từ qua CSV / Excel (.xlsx) | 📋 Lập kế hoạch | Hỗ trợ template chuẩn, import hàng loạt |
| F6 | Giao diện người dùng & Tối ưu trải nghiệm (UI/UX) | 📋 Lập kế hoạch | Giao diện bảng viết ô chữ Mễ (米字格) / Điền (田字格), dark/light mode |

*Ký hiệu: 📋 Lập kế hoạch | ⏳ Đang thực hiện | ✅ Hoàn thành*

---

## 3. Lịch sử cập nhật phiên làm việc (Changelog)
- **2026-11-02**: Khởi tạo tài liệu `PROJECT_STATE.md`, phân tích yêu cầu kỹ thuật và xây dựng lộ trình các giai đoạn phát triển.

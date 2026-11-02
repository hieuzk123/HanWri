# Design Specification: HanWri - Chinese Character Handwriting & Practice App

- **Date**: 2026-11-02
- **Author**: Antigravity & User
- **Status**: Approved (Design Phase)
- **Target Platform**: Modern Web App (Vite + React + TypeScript), architected for seamless future Desktop port (Tauri / Electron).

---

## 1. Executive Summary & Goals

**HanWri** is a dedicated Chinese character learning and handwriting practice application based on the open-source library [`hanzi-writer`](https://github.com/chanind/hanzi-writer). 

The application solves key pain points for learners:
1. Understanding stroke order via interactive animations.
2. Building muscle memory through guided, stroke-by-stroke tracing with real-time error correction.
3. Testing true character recall using an unguided freehand canvas powered by a Handwriting Recognition API.
4. Organizing study material into custom decks, easily imported from CSV and Excel (`.xlsx`) spreadsheets.

---

## 2. Technology Stack & Dependencies

| Layer | Technology | Purpose |
|---|---|---|
| **Build Tool & Framework** | React 19 + Vite + TypeScript | Lightning-fast development, typed models, modern bundle output |
| **Styling & UI Components** | TailwindCSS + Lucide React | Clean, responsive Chinese calligraphy-aesthetic UI |
| **Stroke Rendering & Quiz** | `hanzi-writer` | Stroke vector animation and guided stroke-order quiz mode |
| **Handwriting Recognition** | Canvas Vector Capture + Google Input Tools IME API | Freehand stroke capture and cloud-based handwriting character recognition |
| **Local Persistence** | `dexie` (IndexedDB wrapper) | Fast, client-side relational storage for Decks and Words (offline-ready) |
| **Spreadsheet Processing** | `xlsx` (SheetJS) | Parsing and exporting CSV, XLS, and XLSX word decks |

---

## 3. System Architecture & Components

```
d:\HanWri\src\
├── assets/                  # SVG templates, audio feedback (correct/wrong/hint)
├── components/
│   ├── layout/              # App header, navigation, sidebar
│   ├── common/              # Buttons, modals, tooltips, loading spinners
│   ├── grid/                # Canvas background grids (MiZiGe 米字格, TianZiGe 田字格)
│   ├── practice/
│   │   ├── StrokeAnimator.tsx       # Animation player (Play, Pause, Step, Speed slider)
│   │   ├── GuidedQuiz.tsx           # Hanzi-writer interactive quiz
│   │   ├── FreehandCanvas.tsx       # Canvas for freehand stylus/mouse drawing
│   │   └── WordContainer.tsx        # Multi-character coordinator (handles words like 你好)
│   ├── deck/
│   │   ├── DeckList.tsx             # List and manage study decks
│   │   ├── DeckDetail.tsx           # View, add, edit, delete words in deck
│   │   └── DeckImporter.tsx         # CSV / XLSX file drag-and-drop parser & validator
├── db/
│   └── index.ts             # Dexie schema for Decks and Words
├── services/
│   ├── handwritingApi.ts    # Service interacting with Handwriting Recognition API
│   └── fileImportService.ts # Service parsing and validating spreadsheet inputs
└── types/
    └── index.ts             # TypeScript interfaces for Deck, Word, PracticeSession
```

---

## 4. Detailed Feature Specifications

### 4.1 Feature 1: Multi-Character Word Practice Container
- **Problem**: `hanzi-writer` natively renders one character per target SVG element. Real study requires practicing words (e.g., 学习, 电脑).
- **Specification**:
  - `WordContainer` receives a word string (e.g. `"你好"`), splitting it into individual characters: `['你', '好']`.
  - Renders a horizontal bar of characters with active indicator.
  - Displays Pinyin (`nǐ hǎo`), Sino-Vietnamese reading (`Nhĩ Hảo`), and Vietnamese meaning (`Xin chào`).
  - Supports "Next Character" and "Previous Character" keyboard and touch shortcuts.

### 4.2 Feature 2: Stroke Order Animation Player
- **Specification**:
  - Controls:
    - **Play / Pause**: Animate full character.
    - **Step Forward / Step Backward**: Inspect individual stroke vectors.
    - **Speed Control**: 0.5x, 1x, 1.5x, 2x speeds.
    - **Radical Highlighting**: Highlight the radical (bộ thủ) in a distinct accent color.
  - Data loading: Fetches stroke data from CDN with a graceful offline/error fallback.

### 4.3 Feature 3: Guided Tracing Practice (Chế độ Đồ nét)
- **Specification**:
  - Implements `hanzi-writer` quiz engine:
    - Background grid (MiZiGe / TianZiGe).
    - Faint character outline visible by default (`showOutline: true`).
    - Detection of correct vs. mistaken strokes (`onCorrectStroke`, `onMistake`).
    - Mistake tracker: If user fails a stroke 3 times, auto-display animated hint for that specific stroke.
    - Sound and visual haptic celebration upon completing all strokes.

### 4.4 Feature 4: Freehand Drawing & Handwriting Recognition (Chế độ Viết tự do)
- **Specification**:
  - Interactive Canvas capturing touch, mouse, and stylus pointer events with pressure smoothing.
  - Captures stroke vectors in normalized format: `[ [x_coords], [y_coords], [timestamps] ]`.
  - Actions:
    - **Undo Stroke**: Clears the last drawn stroke.
    - **Clear Canvas**: Empties the canvas.
    - **Check Button**: Submits ink vectors to Google Input Tools Handwriting Recognition API.
  - Recognition Evaluation:
    - If target character is Rank #1: **Perfect (Xuất sắc)**.
    - If target character is in Top 3: **Good (Chính xác)**.
    - If target character is in Top 10: **Acceptable (Gần đúng, cần nắn nót hơn)**.
    - If target character is not in Top 10: **Incorrect (Chưa nhận diện được, hãy thử lại)**.
    - Option to immediately toggle the animation overlay over the user's drawing to see differences.

### 4.5 Feature 5: Word Decks & Local Database (Dexie / IndexedDB)
- **Database Schema**:
  - `decks`: `id` (auto-increment), `title`, `description`, `createdAt`, `updatedAt`, `wordCount`.
  - `words`: `id`, `deckId`, `hanzi`, `pinyin`, `sinoVietnamese`, `meaning`, `notes`, `practiceCount`, `masteryLevel`.
- **Preloaded Starter Deck**:
  - Includes a default deck: "HSK 1 Căn bản" (e.g., 你, 好, 谢谢, 再见, etc.) so users can immediately test the app without having to create or import first.

### 4.6 Feature 6: CSV & Excel (.xlsx) Import / Export
- **Specification**:
  - Supported formats: `.csv`, `.xlsx`, `.xls`.
  - Column schema:
    - Column A: `hanzi` (Chữ Hán - Required)
    - Column B: `pinyin` (Phiên âm - Optional)
    - Column C: `sino_vietnamese` (Âm Hán Việt - Optional)
    - Column D: `meaning` (Nghĩa tiếng Việt - Optional)
    - Column E: `notes` (Ghi chú - Optional)
  - Validation:
    - Automatically checks and filters empty rows or non-Chinese characters in Column A.
    - Provides a one-click button to download a sample Excel template (`mau_nhap_tu_hanwri.xlsx`).

---

## 5. Desktop Portability Strategy
- All API and storage calls are strictly abstracted into service interfaces.
- IndexedDB via Dexie works seamlessly in standard browsers and inside Tauri/Electron webviews without code alterations.
- No direct Node.js server dependencies in the core client code.

---

## 6. Verification & Testing Strategy
- **Unit Tests**:
  - Word parsing and character splitting logic.
  - CSV/Excel parsing and validation tests.
  - Ink coordinate format transformation tests.
- **Component Tests**:
  - HanziWriter wrapper mounting and lifecycle unmounting (preventing SVG memory leaks).
  - Canvas drawing and undo operations.
- **End-to-End Flow Verification**:
  - Import sample spreadsheet -> Navigate to Deck -> Start Animation -> Complete Guided Quiz -> Pass Freehand Recognition test.

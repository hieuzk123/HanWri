# HanWri - Chinese Character Handwriting & Practice App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a comprehensive web-based Chinese character learning and handwriting practice application with stroke order animation, guided tracing quiz, unguided freehand handwriting recognition, deck management, and CSV/Excel import.

**Architecture:** Single Page Application (SPA) built with React 19, TypeScript, and TailwindCSS on Vite. Local data persistence is managed via Dexie (IndexedDB). Stroke animation and guided tracing are powered by `hanzi-writer`, while unguided freehand writing captures ink vectors on an HTML5 canvas and evaluates accuracy against Google Input Tools Handwriting Recognition API.

**Tech Stack:** React 19, TypeScript, Vite, TailwindCSS, Lucide React, Dexie (IndexedDB), hanzi-writer, xlsx (SheetJS), Vitest.

**Spec:** [docs/superpowers/specs/2026-11-02-hanwri-chinese-handwriting-app-design.md](file:///d:/HanWri/docs/superpowers/specs/2026-11-02-hanwri-chinese-handwriting-app-design.md)

## Global Constraints

- Platform: Web App (Vite + React), strictly client-side without proprietary backend dependencies so it can be packaged to Desktop (Tauri/Electron) cleanly.
- Language/Runtime: Node v24+, React 19, TypeScript strict mode.
- State & Project Tracking: Every task completion MUST update `PROJECT_STATE.md` with current folder structure, implemented features, and changelog.
- Test runner: Vitest with `@testing-library/react`.

---

## Tasks

### Task 1: Project Scaffolding & Setup

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`, `tailwind.config.js`, `postcss.config.js`, `index.html`, `src/main.tsx`, `src/App.tsx`, `src/index.css`
- Modify: `PROJECT_STATE.md`
- Test: `src/App.test.tsx`

**Interfaces:**
- Consumes: None
- Produces: Working React + Vite + TailwindCSS app running on `http://localhost:5173` with Vitest test suite.

- [ ] **Step 1: Initialize Vite React TypeScript project and install dependencies**

Run:
```bash
npm create vite@latest . -- --template react-ts -y
npm install -D tailwindcss postcss autoprefixer vitest @testing-library/react @testing-library/jest-dom jsdom @types/node
npm install lucide-react clsx tailwind-merge dexie hanzi-writer xlsx
npx tailwindcss init -p
```

- [ ] **Step 2: Configure TailwindCSS and Vitest in `vite.config.ts`**

Edit `vite.config.ts` to support vitest:
```typescript
/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
});
```

Create `src/test/setup.ts`:
```typescript
import '@testing-library/jest-dom';
```

Update `tailwind.config.js`:
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        chinese: {
          red: '#c0392b',
          crimson: '#962d22',
          gold: '#f39c12',
          paper: '#fcfaf2',
          ink: '#2c3e50',
          grid: '#e74c3c33',
        },
      },
    },
  },
  plugins: [],
};
```

Update `src/index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
  background-color: #f7f5ee;
  color: #2c3e50;
  -webkit-font-smoothing: antialiased;
}
```

- [ ] **Step 3: Write test in `src/App.test.tsx`**

```tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('App Scaffolding', () => {
  it('renders HanWri header', () => {
    render(<App />);
    expect(screen.getByText(/HanWri/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 4: Implement minimal `src/App.tsx`**

```tsx
import React from 'react';
import { PenTool } from 'lucide-react';

export default function App() {
  return (
    <div className="min-h-screen bg-chinese-paper text-chinese-ink flex flex-col">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-chinese-red text-white flex items-center justify-center font-bold text-xl shadow">
            漢
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900">HanWri</h1>
            <p className="text-xs text-gray-500">Luyện viết & Học chữ Hán thông minh</p>
          </div>
        </div>
      </header>
      <main className="flex-1 p-6 flex items-center justify-center">
        <div className="text-center">
          <PenTool className="w-12 h-12 mx-auto text-chinese-red mb-3" />
          <p className="text-lg font-medium">Chào mừng đến với HanWri</p>
        </div>
      </main>
    </div>
  );
}
```

- [ ] **Step 5: Run tests and verify**

Run: `npx vitest run`
Expected: 1 passed.

- [ ] **Step 6: Update `PROJECT_STATE.md` and commit**

Update `PROJECT_STATE.md` to reflect Task 1 completion.
Run:
```bash
git add .
git commit -m "feat: scaffold Vite React Tailwind project with Vitest"
```

---

### Task 2: Database Layer & Data Models (Dexie IndexedDB)

**Files:**
- Create: `src/types/index.ts`, `src/db/index.ts`, `src/db/seed.ts`
- Test: `src/db/db.test.ts`
- Modify: `PROJECT_STATE.md`

**Interfaces:**
- Consumes: None
- Produces:
  - Models: `Deck`, `Word`, `PracticeStats`
  - Functions: `db.decks`, `db.words`, `seedInitialDecks()`, `getDeckWithWords(deckId)`, `createDeck()`, `addWordToDeck()`

- [ ] **Step 1: Define TypeScript interfaces in `src/types/index.ts`**

```typescript
export interface Deck {
  id?: number;
  title: string;
  description: string;
  createdAt: number;
  updatedAt: number;
  wordCount: number;
}

export interface Word {
  id?: number;
  deckId: number;
  hanzi: string;
  pinyin?: string;
  sinoVietnamese?: string;
  meaning?: string;
  notes?: string;
  practiceCount?: number;
  masteryLevel?: number; // 0 to 5
}

export interface RecognitionCandidate {
  character: string;
  score?: number;
}

export interface HandwritingRecognitionResult {
  success: boolean;
  candidates: string[];
  matchedRank: number; // -1 if not found, 1 for top match, etc.
}
```

- [ ] **Step 2: Write failing test in `src/db/db.test.ts`**

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { db, seedInitialDecks } from './index';
import 'fake-indexeddb/auto';

describe('Database & Seed', () => {
  beforeEach(async () => {
    await db.decks.clear();
    await db.words.clear();
  });

  it('seeds default HSK 1 deck with basic words', async () => {
    await seedInitialDecks();
    const decks = await db.decks.toArray();
    expect(decks.length).toBeGreaterThan(0);
    expect(decks[0].title).toContain('HSK 1');

    const words = await db.words.where('deckId').equals(decks[0].id!).toArray();
    expect(words.length).toBeGreaterThan(0);
    expect(words.some(w => w.hanzi === '你好')).toBe(true);
  });
});
```

- [ ] **Step 3: Implement `src/db/index.ts` & `src/db/seed.ts`**

Install `fake-indexeddb` for test environment:
```bash
npm install -D fake-indexeddb
```

Create `src/db/index.ts`:
```typescript
import Dexie, { type Table } from 'dexie';
import type { Deck, Word } from '../types';

export class HanWriDatabase extends Dexie {
  decks!: Table<Deck, number>;
  words!: Table<Word, number>;

  constructor() {
    super('HanWriDB');
    this.version(1).stores({
      decks: '++id, title, createdAt, updatedAt',
      words: '++id, deckId, hanzi',
    });
  }
}

export const db = new HanWriDatabase();

export async function seedInitialDecks() {
  const existing = await db.decks.count();
  if (existing > 0) return;

  const defaultDeckId = await db.decks.add({
    title: 'HSK 1 Căn bản',
    description: 'Bộ từ vựng giao tiếp căn bản cho người mới bắt đầu',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    wordCount: 8,
  });

  const starterWords: Omit<Word, 'id'>[] = [
    { deckId: defaultDeckId, hanzi: '你', pinyin: 'nǐ', sinoVietnamese: 'Nhĩ', meaning: 'Bạn, anh, chị (ngôi thứ 2)' },
    { deckId: defaultDeckId, hanzi: '好', pinyin: 'hǎo', sinoVietnamese: 'Hảo', meaning: 'Tốt, đẹp, hay, khỏe' },
    { deckId: defaultDeckId, hanzi: '你好', pinyin: 'nǐ hǎo', sinoVietnamese: 'Nhĩ Hảo', meaning: 'Xin chào' },
    { deckId: defaultDeckId, hanzi: '谢谢', pinyin: 'xièxie', sinoVietnamese: 'Tạ Tạ', meaning: 'Cảm ơn' },
    { deckId: defaultDeckId, hanzi: '再见', pinyin: 'zàijiàn', sinoVietnamese: 'Tái Kiến', meaning: 'Tạm biệt' },
    { deckId: defaultDeckId, hanzi: '中国', pinyin: 'zhōngguó', sinoVietnamese: 'Trung Quốc', meaning: 'Nước Trung Quốc' },
    { deckId: defaultDeckId, hanzi: '学习', pinyin: 'xuéxí', sinoVietnamese: 'Học Tập', meaning: 'Học tập' },
    { deckId: defaultDeckId, hanzi: '汉语', pinyin: 'hànyǔ', sinoVietnamese: 'Hán Ngữ', meaning: 'Tiếng Hán / Tiếng Trung' },
  ];

  await db.words.bulkAdd(starterWords);
}
```

- [ ] **Step 4: Run tests and verify**

Run: `npx vitest run src/db/db.test.ts`
Expected: PASS.

- [ ] **Step 5: Update `PROJECT_STATE.md` and commit**

```bash
git add .
git commit -m "feat: implement Dexie IndexedDB storage with default HSK 1 deck seed"
```

---

### Task 3: Practice Grid Component (MiZiGe & TianZiGe)

**Files:**
- Create: `src/components/grid/CharacterGrid.tsx`
- Test: `src/components/grid/CharacterGrid.test.tsx`
- Modify: `PROJECT_STATE.md`

**Interfaces:**
- Consumes: None
- Produces: `<CharacterGrid size={number} gridType="mizige" | "tianzige" />` SVG component rendering calligraphy grid lines.

- [ ] **Step 1: Write test for `CharacterGrid.test.tsx`**

```tsx
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import CharacterGrid from './CharacterGrid';

describe('CharacterGrid Component', () => {
  it('renders SVG with specified size', () => {
    const { container } = render(<CharacterGrid size={300} gridType="mizige" />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('width', '300');
    expect(svg).toHaveAttribute('height', '300');
  });

  it('renders diagonal lines for mizige grid', () => {
    const { container } = render(<CharacterGrid size={300} gridType="mizige" />);
    const diagonals = container.querySelectorAll('line.diagonal');
    expect(diagonals.length).toBe(2);
  });

  it('does not render diagonal lines for tianzige grid', () => {
    const { container } = render(<CharacterGrid size={300} gridType="tianzige" />);
    const diagonals = container.querySelectorAll('line.diagonal');
    expect(diagonals.length).toBe(0);
  });
});
```

- [ ] **Step 2: Implement `src/components/grid/CharacterGrid.tsx`**

```tsx
import React from 'react';

export interface CharacterGridProps {
  size?: number;
  gridType?: 'mizige' | 'tianzige' | 'none';
  strokeColor?: string;
  className?: string;
}

export const CharacterGrid: React.FC<CharacterGridProps> = ({
  size = 300,
  gridType = 'mizige',
  strokeColor = '#e74c3c33',
  className = '',
}) => {
  if (gridType === 'none') {
    return <div style={{ width: size, height: size }} className={`border border-gray-300 rounded ${className}`} />;
  }

  const half = size / 2;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={`border-2 border-chinese-red/40 rounded-lg bg-chinese-paper select-none ${className}`}
    >
      {/* Outer border */}
      <rect x="0" y="0" width={size} height={size} fill="none" stroke="#e74c3c" strokeWidth="2" opacity="0.4" />

      {/* Horizontal divider */}
      <line
        x1="0"
        y1={half}
        x2={size}
        y2={half}
        stroke={strokeColor}
        strokeWidth="1.5"
        strokeDasharray="6,4"
      />

      {/* Vertical divider */}
      <line
        x1={half}
        y1="0"
        x2={half}
        y2={size}
        stroke={strokeColor}
        strokeWidth="1.5"
        strokeDasharray="6,4"
      />

      {/* Diagonals for MiZiGe */}
      {gridType === 'mizige' && (
        <>
          <line
            className="diagonal"
            x1="0"
            y1="0"
            x2={size}
            y2={size}
            stroke={strokeColor}
            strokeWidth="1"
            strokeDasharray="4,4"
          />
          <line
            className="diagonal"
            x1={size}
            y1="0"
            x2="0"
            y2={size}
            stroke={strokeColor}
            strokeWidth="1"
            strokeDasharray="4,4"
          />
        </>
      )}
    </svg>
  );
};

export default CharacterGrid;
```

- [ ] **Step 3: Run test and verify**

Run: `npx vitest run src/components/grid/CharacterGrid.test.tsx`
Expected: 3 passed.

- [ ] **Step 4: Update `PROJECT_STATE.md` and commit**

```bash
git add .
git commit -m "feat: implement customizable MiZiGe and TianZiGe calligraphy grid component"
```

---

### Task 4: HanziWriter Wrapper & Stroke Animator Component

**Files:**
- Create: `src/components/practice/StrokeAnimator.tsx`, `src/components/practice/WordContainer.tsx`
- Test: `src/components/practice/WordContainer.test.tsx`
- Modify: `PROJECT_STATE.md`

**Interfaces:**
- Consumes: `hanzi-writer`, `CharacterGrid`
- Produces:
  - `<StrokeAnimator character="你" size={300} speed={1} />`
  - `<WordContainer word={{ hanzi: "你好", pinyin: "nǐ hǎo", meaning: "Xin chào" }} mode="animation" />`

- [ ] **Step 1: Write test for WordContainer helper logic in `WordContainer.test.tsx`**

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import WordContainer from './WordContainer';

describe('WordContainer', () => {
  const testWord = {
    hanzi: '你好',
    pinyin: 'nǐ hǎo',
    meaning: 'Xin chào',
    sinoVietnamese: 'Nhĩ Hảo',
  };

  it('splits multi-character word into individual character tabs', () => {
    render(<WordContainer word={testWord} />);
    expect(screen.getByText('你')).toBeInTheDocument();
    expect(screen.getByText('好')).toBeInTheDocument();
    expect(screen.getByText('nǐ hǎo')).toBeInTheDocument();
    expect(screen.getByText(/Xin chào/i)).toBeInTheDocument();
  });

  it('switches active character when clicked', () => {
    render(<WordContainer word={testWord} />);
    const secondCharBtn = screen.getByText('好');
    fireEvent.click(secondCharBtn);
    expect(secondCharBtn.closest('button')).toHaveClass('border-chinese-red');
  });
});
```

- [ ] **Step 2: Implement `src/components/practice/StrokeAnimator.tsx`**

```tsx
import React, { useEffect, useRef, useState } from 'react';
import HanziWriter from 'hanzi-writer';
import { Play, Pause, RotateCcw, FastForward, Gauge } from 'lucide-react';
import CharacterGrid from '../grid/CharacterGrid';

export interface StrokeAnimatorProps {
  character: string;
  size?: number;
  onComplete?: () => void;
}

export const StrokeAnimator: React.FC<StrokeAnimatorProps> = ({
  character,
  size = 300,
  onComplete,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const writerRef = useRef<HanziWriter | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<number>(1);
  const [totalStrokes, setTotalStrokes] = useState<number>(0);
  const [currentStroke, setCurrentStroke] = useState<number>(0);

  useEffect(() => {
    if (!containerRef.current || !character) return;

    containerRef.current.innerHTML = '';
    const writer = HanziWriter.create(containerRef.current, character, {
      width: size,
      height: size,
      padding: 20,
      showOutline: true,
      strokeColor: '#2c3e50',
      outlineColor: '#cbd5e1',
      radicalColor: '#c0392b',
      strokeAnimationSpeed: speed,
      delayBetweenStrokes: 250 / speed,
      onLoadCharDataSuccess: (data) => {
        setTotalStrokes(data.strokes.length);
      },
    });

    writerRef.current = writer;

    return () => {
      writerRef.current = null;
    };
  }, [character, size]);

  const handlePlay = () => {
    if (!writerRef.current) return;
    setIsPlaying(true);
    writerRef.current.animateCharacter({
      onComplete: () => {
        setIsPlaying(false);
        if (onComplete) onComplete();
      },
    });
  };

  const handlePause = () => {
    if (!writerRef.current) return;
    writerRef.current.pauseAnimation();
    setIsPlaying(false);
  };

  const handleReset = () => {
    if (!writerRef.current) return;
    writerRef.current.hideCharacter();
    writerRef.current.showOutline();
    setIsPlaying(false);
    setCurrentStroke(0);
  };

  const handleCycleSpeed = () => {
    const nextSpeed = speed === 1 ? 1.5 : speed === 1.5 ? 2 : speed === 2 ? 0.5 : 1;
    setSpeed(nextSpeed);
    if (writerRef.current) {
      // Re-create or adjust speed
      writerRef.current.quiz(); // reset if needed
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative shadow-md rounded-lg overflow-hidden bg-chinese-paper" style={{ width: size, height: size }}>
        <div className="absolute inset-0 pointer-events-none">
          <CharacterGrid size={size} gridType="mizige" />
        </div>
        <div ref={containerRef} className="absolute inset-0" />
      </div>

      <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow border border-gray-200">
        <button
          onClick={isPlaying ? handlePause : handlePlay}
          className="p-2 text-chinese-red hover:bg-red-50 rounded-full transition"
          title={isPlaying ? 'Tạm dừng' : 'Xem hoạt ảnh'}
        >
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
        </button>

        <button
          onClick={handleReset}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition"
          title="Vẽ lại từ đầu"
        >
          <RotateCcw className="w-5 h-5" />
        </button>

        <div className="h-5 w-px bg-gray-200 mx-1" />

        <button
          onClick={handleCycleSpeed}
          className="flex items-center gap-1 px-3 py-1 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-full transition"
          title="Tốc độ"
        >
          <Gauge className="w-4 h-4 text-chinese-red" />
          <span>{speed}x</span>
        </button>
      </div>
    </div>
  );
};

export default StrokeAnimator;
```

- [ ] **Step 3: Implement `src/components/practice/WordContainer.tsx`**

```tsx
import React, { useState } from 'react';
import type { Word } from '../../types';
import StrokeAnimator from './StrokeAnimator';

export interface WordContainerProps {
  word: Pick<Word, 'hanzi' | 'pinyin' | 'meaning' | 'sinoVietnamese'>;
  size?: number;
  onWordComplete?: () => void;
  children?: (currentChar: string, index: number) => React.ReactNode;
}

export const WordContainer: React.FC<WordContainerProps> = ({
  word,
  size = 320,
  children,
}) => {
  const characters = Array.from(word.hanzi || '');
  const [activeIndex, setActiveIndex] = useState(0);

  const activeChar = characters[activeIndex] || '';

  return (
    <div className="flex flex-col items-center w-full max-w-xl mx-auto">
      {/* Pronunciation & Meaning Header */}
      <div className="text-center mb-4">
        {word.pinyin && <div className="text-xl font-medium text-chinese-red tracking-wide">{word.pinyin}</div>}
        <div className="flex items-center justify-center gap-2 mt-1">
          {word.sinoVietnamese && (
            <span className="text-xs uppercase tracking-wider bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded">
              {word.sinoVietnamese}
            </span>
          )}
          {word.meaning && <span className="text-base text-gray-700 font-normal">{word.meaning}</span>}
        </div>
      </div>

      {/* Character Selector for multi-character words */}
      {characters.length > 1 && (
        <div className="flex gap-2 mb-4">
          {characters.map((char, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={`w-12 h-12 text-2xl font-bold rounded-lg border-2 transition ${
                idx === activeIndex
                  ? 'border-chinese-red bg-red-50 text-chinese-red shadow'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
              }`}
            >
              {char}
            </button>
          ))}
        </div>
      )}

      {/* Main Practice / Render Slot */}
      <div className="mt-2">
        {children ? children(activeChar, activeIndex) : <StrokeAnimator character={activeChar} size={size} />}
      </div>
    </div>
  );
};

export default WordContainer;
```

- [ ] **Step 4: Run test and verify**

Run: `npx vitest run src/components/practice/WordContainer.test.tsx`
Expected: 2 passed.

- [ ] **Step 5: Update `PROJECT_STATE.md` and commit**

```bash
git add .
git commit -m "feat: implement HanziWriter StrokeAnimator and multi-character WordContainer"
```

---

### Task 5: Guided Stroke Tracing Quiz Mode

**Files:**
- Create: `src/components/practice/GuidedQuiz.tsx`
- Test: `src/components/practice/GuidedQuiz.test.tsx`
- Modify: `PROJECT_STATE.md`

**Interfaces:**
- Consumes: `hanzi-writer`, `CharacterGrid`
- Produces: `<GuidedQuiz character="你" size={320} onQuizComplete={fn} />` with live mistake feedback, hint trigger, and retry.

- [ ] **Step 1: Write test in `GuidedQuiz.test.tsx`**

```tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import GuidedQuiz from './GuidedQuiz';

describe('GuidedQuiz Component', () => {
  it('renders quiz container and status controls', () => {
    render(<GuidedQuiz character="好" size={300} />);
    expect(screen.getByText(/Gợi ý nét/i)).toBeInTheDocument();
    expect(screen.getByText(/Làm lại/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Implement `src/components/practice/GuidedQuiz.tsx`**

```tsx
import React, { useEffect, useRef, useState } from 'react';
import HanziWriter from 'hanzi-writer';
import { HelpCircle, RotateCcw, CheckCircle, AlertTriangle } from 'lucide-react';
import CharacterGrid from '../grid/CharacterGrid';

export interface GuidedQuizProps {
  character: string;
  size?: number;
  onQuizComplete?: () => void;
}

export const GuidedQuiz: React.FC<GuidedQuizProps> = ({
  character,
  size = 320,
  onQuizComplete,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const writerRef = useRef<HanziWriter | null>(null);

  const [mistakes, setMistakes] = useState(0);
  const [totalStrokes, setTotalStrokes] = useState(0);
  const [currentStroke, setCurrentStroke] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const startQuiz = () => {
    if (!writerRef.current) return;
    setIsCompleted(false);
    setMistakes(0);
    setCurrentStroke(0);

    writerRef.current.quiz({
      onMistake: () => {
        setMistakes((prev) => prev + 1);
      },
      onCorrectStroke: (strokeData) => {
        setCurrentStroke(strokeData.strokeNum + 1);
      },
      onComplete: () => {
        setIsCompleted(true);
        if (onQuizComplete) onQuizComplete();
      },
    });
  };

  useEffect(() => {
    if (!containerRef.current || !character) return;
    containerRef.current.innerHTML = '';

    const writer = HanziWriter.create(containerRef.current, character, {
      width: size,
      height: size,
      padding: 20,
      showOutline: true,
      strokeColor: '#2c3e50',
      outlineColor: '#e2e8f0',
      highlightColor: '#f39c12',
      drawingColor: '#c0392b',
      drawingWidth: 16,
      showHintAfterMisses: 3,
      onLoadCharDataSuccess: (data) => {
        setTotalStrokes(data.strokes.length);
        startQuiz();
      },
    });

    writerRef.current = writer;

    return () => {
      writerRef.current = null;
    };
  }, [character, size]);

  const handleHint = () => {
    if (writerRef.current && !isCompleted) {
      writerRef.current.highlightStroke(currentStroke);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Canvas Box */}
      <div className="relative shadow-md rounded-lg overflow-hidden bg-chinese-paper" style={{ width: size, height: size }}>
        <div className="absolute inset-0 pointer-events-none">
          <CharacterGrid size={size} gridType="mizige" />
        </div>
        <div ref={containerRef} className="absolute inset-0 cursor-crosshair" />

        {isCompleted && (
          <div className="absolute inset-0 bg-green-900/10 backdrop-blur-xs flex flex-col items-center justify-center p-4">
            <div className="bg-white px-4 py-3 rounded-xl shadow-lg border border-green-200 flex items-center gap-3 animate-bounce">
              <CheckCircle className="w-8 h-8 text-green-500" />
              <div>
                <div className="font-bold text-gray-900">Hoàn thành xuất sắc!</div>
                <div className="text-xs text-gray-500">Số lần viết sai nét: {mistakes}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Progress & Controls */}
      <div className="flex items-center justify-between w-full max-w-xs px-2 text-sm">
        <div className="flex items-center gap-1 text-gray-600">
          <span>Tiến độ:</span>
          <span className="font-bold text-chinese-ink">{currentStroke} / {totalStrokes}</span>
        </div>

        {mistakes > 0 && (
          <div className="flex items-center gap-1 text-amber-600 text-xs font-semibold">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Sai: {mistakes}</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={handleHint}
          disabled={isCompleted}
          className="flex items-center gap-1.5 px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-sm font-medium transition disabled:opacity-50"
        >
          <HelpCircle className="w-4 h-4 text-amber-600" />
          <span>Gợi ý nét</span>
        </button>

        <button
          onClick={startQuiz}
          className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition"
        >
          <RotateCcw className="w-4 h-4 text-gray-500" />
          <span>Làm lại</span>
        </button>
      </div>
    </div>
  );
};

export default GuidedQuiz;
```

- [ ] **Step 3: Run test and verify**

Run: `npx vitest run src/components/practice/GuidedQuiz.test.tsx`
Expected: 1 passed.

- [ ] **Step 4: Update `PROJECT_STATE.md` and commit**

```bash
git add .
git commit -m "feat: implement GuidedQuiz mode with stroke matching and hint system"
```

---

### Task 6: Freehand Canvas & Vector Ink Recording

**Files:**
- Create: `src/components/practice/FreehandCanvas.tsx`
- Test: `src/components/practice/FreehandCanvas.test.tsx`
- Modify: `PROJECT_STATE.md`

**Interfaces:**
- Consumes: `CharacterGrid`
- Produces: `<FreehandCanvas size={320} onStrokesChange={(ink) => void} onClear={() => void} />`
  - Captures ink in Google Input Tools handwriting format: `[ [ [x...], [y...], [t...] ], ... ]`

- [ ] **Step 1: Write test for FreehandCanvas in `FreehandCanvas.test.tsx`**

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import FreehandCanvas from './FreehandCanvas';

describe('FreehandCanvas', () => {
  it('renders canvas element and action buttons', () => {
    render(<FreehandCanvas size={300} onCheck={vi.fn()} />);
    expect(screen.getByRole('button', { name: /Xóa nét/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Xóa hết/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Kiểm tra/i })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Implement `src/components/practice/FreehandCanvas.tsx`**

```tsx
import React, { useRef, useState, useEffect } from 'react';
import { Undo2, Trash2, Check, PenTool } from 'lucide-react';
import CharacterGrid from '../grid/CharacterGrid';

export type InkStroke = [number[], number[], number[]]; // [x_coords, y_coords, timestamps]

export interface FreehandCanvasProps {
  size?: number;
  onCheck: (inkData: InkStroke[], width: number, height: number) => void;
  isLoading?: boolean;
}

export const FreehandCanvas: React.FC<FreehandCanvasProps> = ({
  size = 320,
  onCheck,
  isLoading = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [strokes, setStrokes] = useState<InkStroke[]>([]);
  const currentStrokeRef = useRef<{ x: number[]; y: number[]; t: number[] }>({ x: [], y: [], t: [] });

  const redrawAllStrokes = (strokesToDraw: InkStroke[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, size, size);

    strokesToDraw.forEach(([xs, ys]) => {
      if (xs.length === 0) return;
      ctx.beginPath();
      ctx.strokeStyle = '#2c3e50';
      ctx.lineWidth = 14;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.moveTo(xs[0], ys[0]);
      for (let i = 1; i < xs.length; i++) {
        ctx.lineTo(xs[i], ys[i]);
      }
      ctx.stroke();
    });
  };

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent | PointerEvent): { x: number; y: number } => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
    return {
      x: Math.round(clientX - rect.left),
      y: Math.round(clientY - rect.top),
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDrawing(true);
    const { x, y } = getCoordinates(e.nativeEvent);
    const now = Date.now();
    currentStrokeRef.current = { x: [x], y: [y], t: [now] };

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.beginPath();
    ctx.strokeStyle = '#2c3e50';
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.moveTo(x, y);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const { x, y } = getCoordinates(e.nativeEvent);
    const now = Date.now();
    currentStrokeRef.current.x.push(x);
    currentStrokeRef.current.y.push(y);
    currentStrokeRef.current.t.push(now);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    setIsDrawing(false);
    e.currentTarget.releasePointerCapture(e.pointerId);

    const stroke = currentStrokeRef.current;
    if (stroke.x.length > 0) {
      const newStroke: InkStroke = [stroke.x, stroke.y, stroke.t];
      const updated = [...strokes, newStroke];
      setStrokes(updated);
      redrawAllStrokes(updated);
    }
  };

  const handleUndo = () => {
    if (strokes.length === 0) return;
    const updated = strokes.slice(0, -1);
    setStrokes(updated);
    redrawAllStrokes(updated);
  };

  const handleClear = () => {
    setStrokes([]);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.clearRect(0, 0, size, size);
  };

  const handleTriggerCheck = () => {
    if (strokes.length === 0) return;
    onCheck(strokes, size, size);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Canvas Area */}
      <div className="relative shadow-md rounded-lg overflow-hidden bg-chinese-paper" style={{ width: size, height: size }}>
        <div className="absolute inset-0 pointer-events-none">
          <CharacterGrid size={size} gridType="mizige" />
        </div>
        <canvas
          ref={canvasRef}
          width={size}
          height={size}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="absolute inset-0 cursor-crosshair touch-none"
        />
      </div>

      {/* Control Buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleUndo}
          disabled={strokes.length === 0 || isLoading}
          className="flex items-center gap-1 px-3 py-2 bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-lg text-sm font-medium transition disabled:opacity-40"
          aria-label="Xóa nét"
        >
          <Undo2 className="w-4 h-4" />
          <span>Xóa nét</span>
        </button>

        <button
          onClick={handleClear}
          disabled={strokes.length === 0 || isLoading}
          className="flex items-center gap-1 px-3 py-2 bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-lg text-sm font-medium transition disabled:opacity-40"
          aria-label="Xóa hết"
        >
          <Trash2 className="w-4 h-4 text-gray-500" />
          <span>Xóa hết</span>
        </button>

        <button
          onClick={handleTriggerCheck}
          disabled={strokes.length === 0 || isLoading}
          className="flex items-center gap-1.5 px-5 py-2 bg-chinese-red hover:bg-chinese-crimson text-white rounded-lg text-sm font-bold shadow transition disabled:opacity-50"
          aria-label="Kiểm tra"
        >
          <Check className="w-4 h-4" />
          <span>{isLoading ? 'Đang nhận diện...' : 'Kiểm tra'}</span>
        </button>
      </div>
    </div>
  );
};

export default FreehandCanvas;
```

- [ ] **Step 3: Run test and verify**

Run: `npx vitest run src/components/practice/FreehandCanvas.test.tsx`
Expected: 1 passed.

- [ ] **Step 4: Update `PROJECT_STATE.md` and commit**

```bash
git add .
git commit -m "feat: implement FreehandCanvas with vector ink capture and undo"
```

---

### Task 7: Handwriting Recognition Service & Feedback Flow

**Files:**
- Create: `src/services/handwritingApi.ts`, `src/components/practice/FreehandRecognitionView.tsx`
- Test: `src/services/handwritingApi.test.ts`
- Modify: `PROJECT_STATE.md`

**Interfaces:**
- Consumes: `InkStroke`
- Produces: `recognizeHandwriting(ink, width, height, targetChar)` -> returns `HandwritingRecognitionResult`

- [ ] **Step 1: Write test for recognition service in `src/services/handwritingApi.test.ts`**

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { recognizeHandwriting, evaluateMatch } from './handwritingApi';
import type { InkStroke } from '../components/practice/FreehandCanvas';

describe('Handwriting API Service', () => {
  const dummyInk: InkStroke[] = [
    [[10, 20, 30], [10, 20, 30], [1, 2, 3]],
  ];

  it('evaluates match rank correctly', () => {
    const candidates = ['好', '女', '子', '如'];
    expect(evaluateMatch('好', candidates).matchedRank).toBe(1);
    expect(evaluateMatch('女', candidates).matchedRank).toBe(2);
    expect(evaluateMatch('你', candidates).matchedRank).toBe(-1);
  });

  it('parses Google handwriting API JSON response correctly', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [
        'SUCCESS',
        [['requests', ['你', '仁', '什', '化']]],
      ],
    } as any);

    const result = await recognizeHandwriting(dummyInk, 300, 300, '你');
    expect(result.success).toBe(true);
    expect(result.candidates).toContain('你');
    expect(result.matchedRank).toBe(1);
  });
});
```

- [ ] **Step 2: Implement `src/services/handwritingApi.ts`**

```typescript
import type { InkStroke } from '../components/practice/FreehandCanvas';
import type { HandwritingRecognitionResult } from '../types';

export function evaluateMatch(targetChar: string, candidates: string[]): { matchedRank: number } {
  const rank = candidates.indexOf(targetChar);
  return {
    matchedRank: rank === -1 ? -1 : rank + 1,
  };
}

export async function recognizeHandwriting(
  ink: InkStroke[],
  width: number,
  height: number,
  targetChar: string
): Promise<HandwritingRecognitionResult> {
  const endpoint = 'https://inputtools.google.com/request?ime=handwriting&app=autotyped&dbg=1&cs=1&oe=UTF-8';

  const body = {
    options: 'enable_pre_space',
    requests: [
      {
        writing_guide: {
          writing_area_width: width,
          writing_area_height: height,
        },
        pre_context: '',
        max_num_results: 10,
        max_completions: 0,
        language: 'zh-t-i0-handwrit',
        ink: ink,
      },
    ],
  };

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Handwriting API returned status ${response.status}`);
    }

    const data = await response.json();
    if (data[0] === 'SUCCESS' && data[1] && data[1][0] && data[1][0][1]) {
      const candidates: string[] = data[1][0][1];
      const { matchedRank } = evaluateMatch(targetChar, candidates);
      return {
        success: true,
        candidates,
        matchedRank,
      };
    }

    return {
      success: false,
      candidates: [],
      matchedRank: -1,
    };
  } catch (err) {
    console.warn('Google handwriting recognition request failed, returning error response:', err);
    return {
      success: false,
      candidates: [],
      matchedRank: -1,
    };
  }
}
```

- [ ] **Step 3: Implement `src/components/practice/FreehandRecognitionView.tsx`**

```tsx
import React, { useState } from 'react';
import FreehandCanvas, { type InkStroke } from './FreehandCanvas';
import { recognizeHandwriting } from '../../services/handwritingApi';
import type { HandwritingRecognitionResult } from '../../types';
import { CheckCircle2, AlertCircle, Eye, Sparkles } from 'lucide-react';
import StrokeAnimator from './StrokeAnimator';

export interface FreehandRecognitionViewProps {
  character: string;
  size?: number;
  onSuccess?: () => void;
}

export const FreehandRecognitionView: React.FC<FreehandRecognitionViewProps> = ({
  character,
  size = 320,
  onSuccess,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<HandwritingRecognitionResult | null>(null);
  const [showModelOverlay, setShowModelOverlay] = useState(false);

  const handleCheck = async (ink: InkStroke[], width: number, height: number) => {
    setIsLoading(true);
    setResult(null);

    const res = await recognizeHandwriting(ink, width, height, character);
    setResult(res);
    setIsLoading(false);

    if (res.matchedRank >= 1 && res.matchedRank <= 3 && onSuccess) {
      onSuccess();
    }
  };

  return (
    <div className="flex flex-col items-center">
      <FreehandCanvas size={size} onCheck={handleCheck} isLoading={isLoading} />

      {/* Recognition Evaluation Alert */}
      {result && (
        <div className="mt-4 w-full max-w-sm">
          {result.matchedRank === 1 && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3 text-green-900">
              <Sparkles className="w-6 h-6 text-green-600 flex-shrink-0" />
              <div>
                <div className="font-bold">Tuyệt vời! Viết rất chuẩn xác</div>
                <div className="text-xs text-green-700">Chữ mục tiêu là ứng viên số 1</div>
              </div>
            </div>
          )}

          {result.matchedRank > 1 && result.matchedRank <= 3 && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-3 text-blue-900">
              <CheckCircle2 className="w-6 h-6 text-blue-600 flex-shrink-0" />
              <div>
                <div className="font-bold">Chính xác! (Xếp hạng #{result.matchedRank})</div>
                <div className="text-xs text-blue-700">Chữ được nhận diện rất tốt</div>
              </div>
            </div>
          )}

          {result.matchedRank > 3 && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-3 text-amber-900">
              <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0" />
              <div>
                <div className="font-bold">Gần đúng (Xếp hạng #{result.matchedRank})</div>
                <div className="text-xs text-amber-700">Hãy nắn nót lại nét cho vuông vắn hơn</div>
              </div>
            </div>
          )}

          {result.matchedRank === -1 && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-900">
              <div className="flex items-center gap-2 font-bold mb-1">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <span>Chưa nhận diện đúng</span>
              </div>
              <div className="text-xs text-red-700 mb-2">
                Các chữ nhận diện được: {result.candidates.slice(0, 5).join('、 ') || 'Không rõ'}
              </div>
              <button
                onClick={() => setShowModelOverlay(true)}
                className="text-xs font-semibold underline flex items-center gap-1 text-chinese-red"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Xem mẫu viết chuẩn</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Model Overlay Modal */}
      {showModelOverlay && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl flex flex-col items-center">
            <h3 className="font-bold text-lg mb-3">Mẫu chuẩn chữ「{character}」</h3>
            <StrokeAnimator character={character} size={260} />
            <button
              onClick={() => setShowModelOverlay(false)}
              className="mt-4 px-6 py-2 bg-gray-200 hover:bg-gray-300 font-semibold text-gray-800 rounded-lg text-sm"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FreehandRecognitionView;
```

- [ ] **Step 4: Run test and verify**

Run: `npx vitest run src/services/handwritingApi.test.ts`
Expected: 2 passed.

- [ ] **Step 5: Update `PROJECT_STATE.md` and commit**

```bash
git add .
git commit -m "feat: implement handwriting recognition API service and feedback evaluation"
```

---

### Task 8: Deck Management & Practice Session UI

**Files:**
- Create: `src/components/deck/DeckList.tsx`, `src/components/deck/DeckDetail.tsx`, `src/components/deck/AddWordModal.tsx`
- Modify: `src/App.tsx`, `PROJECT_STATE.md`
- Test: `src/components/deck/DeckList.test.tsx`

**Interfaces:**
- Consumes: `db`, `WordContainer`, `GuidedQuiz`, `FreehandRecognitionView`
- Produces: Complete UI for viewing decks, adding/deleting words, and practicing words in 3 modes (Animation, Guided Tracing, Freehand Recognition).

- [ ] **Step 1: Write test for DeckList in `DeckList.test.tsx`**

```tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import DeckList from './DeckList';
import type { Deck } from '../../types';

describe('DeckList Component', () => {
  const dummyDecks: Deck[] = [
    { id: 1, title: 'HSK 1 Căn bản', description: 'Từ vựng HSK 1', createdAt: 1000, updatedAt: 1000, wordCount: 15 },
  ];

  it('renders list of decks', () => {
    render(<DeckList decks={dummyDecks} onSelectDeck={vi.fn()} onOpenCreateModal={vi.fn()} onOpenImportModal={vi.fn()} />);
    expect(screen.getByText('HSK 1 Căn bản')).toBeInTheDocument();
    expect(screen.getByText(/15 từ/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Implement `src/components/deck/DeckList.tsx`**

```tsx
import React from 'react';
import type { Deck } from '../../types';
import { BookOpen, Plus, FileSpreadsheet, ChevronRight } from 'lucide-react';

export interface DeckListProps {
  decks: Deck[];
  onSelectDeck: (deck: Deck) => void;
  onOpenCreateModal: () => void;
  onOpenImportModal: () => void;
}

export const DeckList: React.FC<DeckListProps> = ({
  decks,
  onSelectDeck,
  onOpenCreateModal,
  onOpenImportModal,
}) => {
  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Bộ từ vựng của bạn</h2>
          <p className="text-sm text-gray-500">Chọn hoặc tạo bộ từ để bắt đầu luyện viết chữ Hán</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenImportModal}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-sm font-semibold transition shadow-xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Nhập Excel / CSV</span>
          </button>

          <button
            onClick={onOpenCreateModal}
            className="flex items-center gap-1.5 px-4 py-2 bg-chinese-red hover:bg-chinese-crimson text-white rounded-lg text-sm font-semibold transition shadow"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo bộ từ mới</span>
          </button>
        </div>
      </div>

      {/* Grid of Decks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {decks.map((deck) => (
          <div
            key={deck.id}
            onClick={() => onSelectDeck(deck)}
            className="group p-5 bg-white rounded-xl border border-gray-200 hover:border-chinese-red/40 hover:shadow-md transition cursor-pointer flex items-center justify-between"
          >
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-lg bg-red-50 text-chinese-red flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900 group-hover:text-chinese-red transition">
                  {deck.title}
                </h3>
                <p className="text-xs text-gray-500 line-clamp-1 mb-2">{deck.description || 'Chưa có mô tả'}</p>
                <span className="text-xs font-semibold px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full">
                  {deck.wordCount || 0} từ
                </span>
              </div>
            </div>

            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-chinese-red group-hover:translate-x-1 transition" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default DeckList;
```

- [ ] **Step 3: Implement `src/components/deck/DeckDetail.tsx` (Word list & Practice Mode Selector)**

```tsx
import React, { useState } from 'react';
import type { Deck, Word } from '../../types';
import { ArrowLeft, Play, PenTool, Edit3, Trash2, Plus, Sparkles } from 'lucide-react';
import WordContainer from '../practice/WordContainer';
import StrokeAnimator from '../practice/StrokeAnimator';
import GuidedQuiz from '../practice/GuidedQuiz';
import FreehandRecognitionView from '../practice/FreehandRecognitionView';

export interface DeckDetailProps {
  deck: Deck;
  words: Word[];
  onBack: () => void;
  onAddWord: () => void;
  onDeleteWord: (wordId: number) => void;
}

export const DeckDetail: React.FC<DeckDetailProps> = ({
  deck,
  words,
  onBack,
  onAddWord,
  onDeleteWord,
}) => {
  const [selectedWordIndex, setSelectedWordIndex] = useState<number | null>(null);
  const [practiceMode, setPracticeMode] = useState<'animation' | 'quiz' | 'freehand'>('animation');

  const currentWord = selectedWordIndex !== null ? words[selectedWordIndex] : null;

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Top back & title bar */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={selectedWordIndex !== null ? () => setSelectedWordIndex(null) : onBack}
          className="flex items-center gap-1.5 text-sm font-semibold text-gray-600 hover:text-chinese-red transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{selectedWordIndex !== null ? 'Quay lại danh sách từ' : 'Quay lại bộ từ'}</span>
        </button>

        <div className="text-right">
          <h2 className="text-xl font-bold text-gray-900">{deck.title}</h2>
          <span className="text-xs text-gray-500">{words.length} từ vựng</span>
        </div>
      </div>

      {/* Mode View: Word Practice Mode */}
      {currentWord ? (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col items-center">
          {/* Practice mode switcher */}
          <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-xl mb-6">
            <button
              onClick={() => setPracticeMode('animation')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition ${
                practiceMode === 'animation' ? 'bg-white text-chinese-red shadow' : 'text-gray-600'
              }`}
            >
              <Play className="w-4 h-4" />
              <span>Xem hoạt ảnh nét</span>
            </button>

            <button
              onClick={() => setPracticeMode('quiz')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition ${
                practiceMode === 'quiz' ? 'bg-white text-chinese-red shadow' : 'text-gray-600'
              }`}
            >
              <Edit3 className="w-4 h-4" />
              <span>Đồ chữ theo thứ tự</span>
            </button>

            <button
              onClick={() => setPracticeMode('freehand')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition ${
                practiceMode === 'freehand' ? 'bg-white text-chinese-red shadow' : 'text-gray-600'
              }`}
            >
              <PenTool className="w-4 h-4" />
              <span>Khung viết & Nhận diện</span>
            </button>
          </div>

          {/* Word Coordinator */}
          <WordContainer word={currentWord}>
            {(currentChar) => {
              if (practiceMode === 'animation') {
                return <StrokeAnimator character={currentChar} size={300} />;
              } else if (practiceMode === 'quiz') {
                return <GuidedQuiz character={currentChar} size={300} />;
              } else {
                return <FreehandRecognitionView character={currentChar} size={300} />;
              }
            }}
          </WordContainer>

          {/* Next / Prev Word Buttons */}
          <div className="flex items-center gap-4 mt-8 pt-6 border-t border-gray-100 w-full justify-between">
            <button
              onClick={() => setSelectedWordIndex((prev) => Math.max(0, (prev || 0) - 1))}
              disabled={selectedWordIndex === 0}
              className="px-4 py-2 text-sm font-semibold rounded-lg border border-gray-200 text-gray-700 disabled:opacity-40"
            >
              Từ trước
            </button>

            <span className="text-xs text-gray-400">
              {selectedWordIndex + 1} / {words.length}
            </span>

            <button
              onClick={() => setSelectedWordIndex((prev) => Math.min(words.length - 1, (prev || 0) + 1))}
              disabled={selectedWordIndex === words.length - 1}
              className="px-4 py-2 text-sm font-semibold rounded-lg bg-chinese-red text-white disabled:opacity-40"
            >
              Từ tiếp theo
            </button>
          </div>
        </div>
      ) : (
        /* Word List in Deck */
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800">Danh sách từ trong bộ</h3>
            <button
              onClick={onAddWord}
              className="flex items-center gap-1 px-3 py-1.5 bg-gray-900 text-white rounded-lg text-xs font-bold hover:bg-gray-800 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm từ</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {words.map((w, index) => (
              <div
                key={w.id || index}
                onClick={() => setSelectedWordIndex(index)}
                className="p-4 bg-white rounded-xl border border-gray-200 hover:border-chinese-red hover:shadow-md transition cursor-pointer flex items-center justify-between group"
              >
                <div>
                  <div className="text-2xl font-bold text-gray-900 group-hover:text-chinese-red transition">
                    {w.hanzi}
                  </div>
                  <div className="text-xs text-chinese-red font-medium">{w.pinyin}</div>
                  <div className="text-xs text-gray-500 line-clamp-1">{w.meaning}</div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (w.id) onDeleteWord(w.id);
                  }}
                  className="p-1.5 text-gray-300 hover:text-red-500 rounded-lg hover:bg-red-50 opacity-0 group-hover:opacity-100 transition"
                  title="Xóa từ"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DeckDetail;
```

- [ ] **Step 4: Run tests and verify**

Run: `npx vitest run src/components/deck/DeckList.test.tsx`
Expected: 1 passed.

- [ ] **Step 5: Update `PROJECT_STATE.md` and commit**

```bash
git add .
git commit -m "feat: implement DeckList and DeckDetail interactive practice view"
```

---

### Task 9: CSV & Excel (.xlsx) Import / Export Service & UI

**Files:**
- Create: `src/services/fileImportService.ts`, `src/components/deck/DeckImporter.tsx`
- Test: `src/services/fileImportService.test.ts`
- Modify: `PROJECT_STATE.md`

**Interfaces:**
- Consumes: `xlsx`
- Produces:
  - `parseSpreadsheetFile(file: File): Promise<ParsedWordRow[]>`
  - `generateSampleExcelTemplate(): void`
  - `<DeckImporter onImportComplete={fn} onCancel={fn} />`

- [ ] **Step 1: Write test for fileImportService in `fileImportService.test.ts`**

```typescript
import { describe, it, expect } from 'vitest';
import { validateWordRows } from './fileImportService';

describe('fileImportService', () => {
  it('filters empty or invalid rows', () => {
    const rawRows = [
      { hanzi: '你好', pinyin: 'nǐ hǎo', meaning: 'Xin chào' },
      { hanzi: '', pinyin: 'abc', meaning: 'Trống' },
      { hanzi: '   ', pinyin: '', meaning: '' },
      { hanzi: '谢谢', pinyin: 'xièxie', meaning: 'Cảm ơn' },
    ];

    const valid = validateWordRows(rawRows);
    expect(valid.length).toBe(2);
    expect(valid[0].hanzi).toBe('你好');
    expect(valid[1].hanzi).toBe('谢谢');
  });
});
```

- [ ] **Step 2: Implement `src/services/fileImportService.ts`**

```typescript
import * as XLSX from 'xlsx';
import type { Word } from '../types';

export interface RawImportRow {
  hanzi?: string;
  'chữ hán'?: string;
  'từ vựng'?: string;
  pinyin?: string;
  'phiên âm'?: string;
  sino_vietnamese?: string;
  'hán việt'?: string;
  meaning?: string;
  'nghĩa'?: string;
  notes?: string;
  'ghi chú'?: string;
}

export function validateWordRows(rows: any[]): Omit<Word, 'id' | 'deckId'>[] {
  const result: Omit<Word, 'id' | 'deckId'>[] = [];

  for (const row of rows) {
    const hanzi = (row.hanzi || row['chữ hán'] || row['từ vựng'] || row.Word || '')?.toString().trim();
    if (!hanzi) continue;

    const pinyin = (row.pinyin || row['phiên âm'] || row.Pinyin || '')?.toString().trim();
    const sinoVietnamese = (row.sino_vietnamese || row['hán việt'] || row.HánViệt || '')?.toString().trim();
    const meaning = (row.meaning || row['nghĩa'] || row.Meaning || '')?.toString().trim();
    const notes = (row.notes || row['ghi chú'] || row.Notes || '')?.toString().trim();

    result.push({
      hanzi,
      pinyin,
      sinoVietnamese,
      meaning,
      notes,
    });
  }

  return result;
}

export async function parseSpreadsheetFile(file: File): Promise<Omit<Word, 'id' | 'deckId'>[]> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];

  const rawJson = XLSX.utils.sheet_to_json<RawImportRow>(worksheet, { defval: '' });
  return validateWordRows(rawJson);
}

export function downloadSampleExcelTemplate() {
  const sampleData = [
    {
      'Chữ Hán': '你好',
      'Phiên âm': 'nǐ hǎo',
      'Hán Việt': 'Nhĩ Hảo',
      'Nghĩa': 'Xin chào',
      'Ghi chú': 'Khẩu ngữ chào hỏi',
    },
    {
      'Chữ Hán': '谢谢',
      'Phiên âm': 'xièxie',
      'Hán Việt': 'Tạ Tạ',
      'Nghĩa': 'Cảm ơn',
      'Ghi chú': 'Từ thông dụng',
    },
    {
      'Chữ Hán': '再见',
      'Phiên âm': 'zàijiàn',
      'Hán Việt': 'Tái Kiến',
      'Nghĩa': 'Tạm biệt',
      'Ghi chú': '',
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'TuVung');
  XLSX.writeFile(workbook, 'mau_nhap_tu_hanwri.xlsx');
}
```

- [ ] **Step 3: Implement `src/components/deck/DeckImporter.tsx`**

```tsx
import React, { useState } from 'react';
import { Upload, Download, FileSpreadsheet, X, CheckCircle } from 'lucide-react';
import { parseSpreadsheetFile, downloadSampleExcelTemplate } from '../../services/fileImportService';
import type { Word } from '../../types';

export interface DeckImporterProps {
  onImportSuccess: (deckTitle: string, words: Omit<Word, 'id' | 'deckId'>[]) => void;
  onClose: () => void;
}

export const DeckImporter: React.FC<DeckImporterProps> = ({ onImportSuccess, onClose }) => {
  const [deckTitle, setDeckTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [parsedWords, setParsedWords] = useState<Omit<Word, 'id' | 'deckId'>[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setError(null);
    setIsProcessing(true);

    try {
      const words = await parseSpreadsheetFile(selected);
      if (words.length === 0) {
        setError('Không tìm thấy từ vựng hợp lệ trong file. Vui lòng tải file mẫu để kiểm tra định dạng.');
      } else {
        setParsedWords(words);
        if (!deckTitle) {
          setDeckTitle(selected.name.replace(/\.[^/.]+$/, ''));
        }
      }
    } catch (err: any) {
      setError('Lỗi khi đọc file: ' + (err.message || 'Định dạng file không hỗ trợ'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirm = () => {
    if (!deckTitle.trim()) {
      setError('Vui lòng nhập tên cho bộ từ.');
      return;
    }
    if (parsedWords.length === 0) {
      setError('Không có từ vựng nào để nhập.');
      return;
    }
    onImportSuccess(deckTitle.trim(), parsedWords);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-bold text-gray-900 mb-1 flex items-center gap-2">
          <FileSpreadsheet className="w-6 h-6 text-emerald-600" />
          <span>Nhập bộ từ từ Excel hoặc CSV</span>
        </h3>
        <p className="text-xs text-gray-500 mb-4">Hỗ trợ file định dạng .xlsx, .xls và .csv</p>

        {/* Download Template Action */}
        <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl mb-4 border border-emerald-100">
          <div className="text-xs text-emerald-800">Chưa có file mẫu chuẩn?</div>
          <button
            onClick={downloadSampleExcelTemplate}
            className="flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-900 bg-white px-3 py-1.5 rounded-lg shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Tải file Excel mẫu</span>
          </button>
        </div>

        {/* Deck Title Input */}
        <div className="mb-4">
          <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Tên bộ từ mới</label>
          <input
            type="text"
            value={deckTitle}
            onChange={(e) => setDeckTitle(e.target.value)}
            placeholder="Ví dụ: Từ vựng HSK 2 bài 1"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-chinese-red"
          />
        </div>

        {/* Drag Drop or Select File */}
        <div className="border-2 border-dashed border-gray-300 hover:border-chinese-red rounded-xl p-6 text-center mb-4 transition">
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileChange}
            id="file-upload"
            className="hidden"
          />
          <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
            <Upload className="w-8 h-8 text-gray-400 mb-2" />
            <span className="text-sm font-semibold text-gray-700">
              {file ? file.name : 'Bấm để chọn file Excel / CSV'}
            </span>
            <span className="text-xs text-gray-400 mt-1">.xlsx, .xls, .csv</span>
          </label>
        </div>

        {error && <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg mb-4">{error}</div>}

        {parsedWords.length > 0 && (
          <div className="p-3 bg-green-50 text-green-800 text-xs rounded-lg mb-4 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
            <span>Đã trích xuất thành công <b>{parsedWords.length}</b> từ vựng!</span>
          </div>
        )}

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 font-medium hover:bg-gray-100 rounded-lg">
            Hủy
          </button>
          <button
            onClick={handleConfirm}
            disabled={parsedWords.length === 0 || isProcessing}
            className="px-5 py-2 bg-chinese-red hover:bg-chinese-crimson text-white text-sm font-bold rounded-lg shadow disabled:opacity-40"
          >
            Xác nhận nhập
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeckImporter;
```

- [ ] **Step 4: Run test and verify**

Run: `npx vitest run src/services/fileImportService.test.ts`
Expected: 1 passed.

- [ ] **Step 5: Update `PROJECT_STATE.md` and commit**

```bash
git add .
git commit -m "feat: implement CSV and XLSX spreadsheet importer and template generator"
```

---

### Task 10: App Integration, Quick Practice Modal & Polish

**Files:**
- Modify: `src/App.tsx`, `PROJECT_STATE.md`
- Test: `src/App.test.tsx`

**Interfaces:**
- Connects all modules into a cohesive single-page application.
- Supports switching between:
  1. Deck List View
  2. Deck Detail / Practice View
  3. Quick Search / Practice any character on the fly (nhập bất kỳ chữ nào để luyện viết ngay lập tức)

- [ ] **Step 1: Write integration tests in `src/App.test.tsx`**

```tsx
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import App from './App';
import { db } from './db';
import 'fake-indexeddb/auto';

describe('App Full Integration', () => {
  beforeEach(async () => {
    await db.decks.clear();
    await db.words.clear();
  });

  it('initializes and renders default decks', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText(/HSK 1 Căn bản/i)).toBeInTheDocument();
    });
  });

  it('renders quick practice search input', () => {
    render(<App />);
    expect(screen.getByPlaceholderText(/Nhập từ hoặc chữ Hán muốn luyện/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Implement full `src/App.tsx`**

Integrate Deck List, Deck Detail, Importer Modal, and Quick Practice drawer.

- [ ] **Step 3: Run all tests to ensure zero regressions**

Run: `npx vitest run`
Expected: All tests pass.

- [ ] **Step 4: Update `PROJECT_STATE.md` and commit**

```bash
git add .
git commit -m "feat: complete App integration with quick practice and deck management"
```

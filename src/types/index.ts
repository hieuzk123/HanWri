export interface Deck {
  id?: number;
  title: string;
  description: string;
  createdAt: number;
  updatedAt: number;
  wordCount: number;
}

export type ReviewRating = 1 | 2 | 3 | 4; // 1: Quên rồi, 2: Khó, 3: Tốt, 4: Dễ

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
  nextReviewDate?: number; // Timestamp (ms) for next scheduled review
  interval?: number; // Current interval in days
  easeFactor?: number; // SM-2 ease factor (default 2.5)
  repetitions?: number; // Consecutive successful reviews
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

export interface PracticeStats {
  totalPracticed: number;
  correctCount: number;
  accuracy: number;
}

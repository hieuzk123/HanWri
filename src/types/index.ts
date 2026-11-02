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

export interface PracticeStats {
  totalPracticed: number;
  correctCount: number;
  accuracy: number;
}

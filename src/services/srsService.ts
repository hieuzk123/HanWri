import type { Word, ReviewRating } from '../types';

export interface SRSReviewResult {
  nextReviewDate: number;
  interval: number;
  easeFactor: number;
  repetitions: number;
  intervalLabel: string;
}

export interface ReviewOption {
  rating: ReviewRating;
  label: string;
  timeLabel: string;
}

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const TEN_MIN_MS = 10 * 60 * 1000;

export function calculateNextReview(
  word: Partial<Word>,
  rating: ReviewRating,
  now: number = Date.now()
): SRSReviewResult {
  const currentInterval = word.interval ?? 0;
  const currentEase = word.easeFactor ?? 2.5;
  const currentReps = word.repetitions ?? 0;

  if (rating === 1) {
    // 1 - Quên rồi
    return {
      nextReviewDate: now + TEN_MIN_MS,
      interval: 0,
      easeFactor: Math.max(1.3, currentEase - 0.2),
      repetitions: 0,
      intervalLabel: '10 phút',
    };
  }

  if (rating === 2) {
    // 2 - Khó
    const interval =
      currentInterval === 0 ? 1 : Math.max(1, Math.round(currentInterval * 1.2));
    return {
      nextReviewDate: now + interval * ONE_DAY_MS,
      interval,
      easeFactor: Math.max(1.3, currentEase - 0.15),
      repetitions: currentReps + 1,
      intervalLabel: `${interval} ngày`,
    };
  }

  if (rating === 3) {
    // 3 - Tốt
    const interval =
      currentInterval === 0 ? 3 : Math.max(3, Math.round(currentInterval * currentEase));
    return {
      nextReviewDate: now + interval * ONE_DAY_MS,
      interval,
      easeFactor: currentEase,
      repetitions: currentReps + 1,
      intervalLabel: `${interval} ngày`,
    };
  }

  // 4 - Dễ
  const interval =
    currentInterval === 0
      ? 7
      : Math.max(7, Math.round(currentInterval * currentEase * 1.3));
  return {
    nextReviewDate: now + interval * ONE_DAY_MS,
    interval,
    easeFactor: currentEase + 0.15,
    repetitions: currentReps + 1,
    intervalLabel: `${interval} ngày`,
  };
}

export function getReviewOptions(
  word: Partial<Word>,
  now: number = Date.now()
): ReviewOption[] {
  const labels: Record<ReviewRating, string> = {
    1: 'Quên rồi',
    2: 'Khó',
    3: 'Tốt',
    4: 'Dễ',
  };

  return ([1, 2, 3, 4] as ReviewRating[]).map((rating) => {
    const calc = calculateNextReview(word, rating, now);
    return {
      rating,
      label: labels[rating],
      timeLabel: calc.intervalLabel,
    };
  });
}

export function isWordDue(word: Word, now: number = Date.now()): boolean {
  if (!word.nextReviewDate) return true;
  return word.nextReviewDate <= now;
}

export function getDueWords(words: Word[], now: number = Date.now()): Word[] {
  return words.filter((w) => isWordDue(w, now));
}

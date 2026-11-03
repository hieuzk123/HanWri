import { describe, it, expect } from 'vitest';
import {
  calculateNextReview,
  getReviewOptions,
  isWordDue,
  getDueWords,
} from './srsService';
import type { Word } from '../types';

describe('SRS Service (Spaced Repetition)', () => {
  const fixedNow = 1700000000000;
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;
  const TEN_MIN_MS = 10 * 60 * 1000;

  describe('calculateNextReview for first-time review', () => {
    const freshWord: Partial<Word> = {
      hanzi: '你好',
    };

    it('calculates rating 1 (Quên rồi) -> 10 minutes, resets interval & repetitions', () => {
      const res = calculateNextReview(freshWord, 1, fixedNow);
      expect(res.interval).toBe(0);
      expect(res.repetitions).toBe(0);
      expect(res.nextReviewDate).toBe(fixedNow + TEN_MIN_MS);
      expect(res.intervalLabel).toBe('10 phút');
      expect(res.easeFactor).toBeCloseTo(2.3);
    });

    it('calculates rating 2 (Khó) -> 1 day on first review', () => {
      const res = calculateNextReview(freshWord, 2, fixedNow);
      expect(res.interval).toBe(1);
      expect(res.repetitions).toBe(1);
      expect(res.nextReviewDate).toBe(fixedNow + 1 * ONE_DAY_MS);
      expect(res.intervalLabel).toBe('1 ngày');
      expect(res.easeFactor).toBeCloseTo(2.35);
    });

    it('calculates rating 3 (Tốt) -> 3 days on first review', () => {
      const res = calculateNextReview(freshWord, 3, fixedNow);
      expect(res.interval).toBe(3);
      expect(res.repetitions).toBe(1);
      expect(res.nextReviewDate).toBe(fixedNow + 3 * ONE_DAY_MS);
      expect(res.intervalLabel).toBe('3 ngày');
      expect(res.easeFactor).toBeCloseTo(2.5);
    });

    it('calculates rating 4 (Dễ) -> 7 days on first review', () => {
      const res = calculateNextReview(freshWord, 4, fixedNow);
      expect(res.interval).toBe(7);
      expect(res.repetitions).toBe(1);
      expect(res.nextReviewDate).toBe(fixedNow + 7 * ONE_DAY_MS);
      expect(res.intervalLabel).toBe('7 ngày');
      expect(res.easeFactor).toBeCloseTo(2.65);
    });
  });

  describe('calculateNextReview for progressive reviews', () => {
    const reviewedWord: Partial<Word> = {
      hanzi: '学习',
      interval: 3,
      easeFactor: 2.5,
      repetitions: 1,
    };

    it('scales interval progressively on rating 2 (Khó), 3 (Tốt), 4 (Dễ)', () => {
      const hardRes = calculateNextReview(reviewedWord, 2, fixedNow);
      expect(hardRes.interval).toBe(4); // round(3 * 1.2) = 4
      expect(hardRes.intervalLabel).toBe('4 ngày');

      const goodRes = calculateNextReview(reviewedWord, 3, fixedNow);
      expect(goodRes.interval).toBe(8); // round(3 * 2.5) = 8
      expect(goodRes.intervalLabel).toBe('8 ngày');

      const easyRes = calculateNextReview(reviewedWord, 4, fixedNow);
      expect(easyRes.interval).toBe(10); // round(3 * 2.5 * 1.3) = round(9.75) = 10
      expect(easyRes.intervalLabel).toBe('10 ngày');
    });

    it('resets progress if rating 1 (Quên rồi) is chosen on previously learned word', () => {
      const againRes = calculateNextReview(reviewedWord, 1, fixedNow);
      expect(againRes.interval).toBe(0);
      expect(againRes.repetitions).toBe(0);
      expect(againRes.intervalLabel).toBe('10 phút');
    });
  });

  describe('getReviewOptions', () => {
    it('returns 4 options with Vietnamese labels and time intervals', () => {
      const options = getReviewOptions({ hanzi: '水' }, fixedNow);
      expect(options).toEqual([
        { rating: 1, label: 'Quên rồi', timeLabel: '10 phút' },
        { rating: 2, label: 'Khó', timeLabel: '1 ngày' },
        { rating: 3, label: 'Tốt', timeLabel: '3 ngày' },
        { rating: 4, label: 'Dễ', timeLabel: '7 ngày' },
      ]);
    });
  });

  describe('isWordDue & getDueWords', () => {
    const words: Word[] = [
      { id: 1, deckId: 1, hanzi: '一' }, // Never reviewed -> due
      { id: 2, deckId: 1, hanzi: '二', nextReviewDate: fixedNow - 1000 }, // Past due -> due
      { id: 3, deckId: 1, hanzi: '三', nextReviewDate: fixedNow + ONE_DAY_MS }, // Future -> not due
    ];

    it('identifies words that have no nextReviewDate or past nextReviewDate as due', () => {
      expect(isWordDue(words[0], fixedNow)).toBe(true);
      expect(isWordDue(words[1], fixedNow)).toBe(true);
      expect(isWordDue(words[2], fixedNow)).toBe(false);
    });

    it('filters only due words via getDueWords', () => {
      const due = getDueWords(words, fixedNow);
      expect(due.map((w) => w.hanzi)).toEqual(['一', '二']);
    });
  });
});

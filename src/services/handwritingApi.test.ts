import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { recognizeHandwriting, evaluateMatch } from './handwritingApi';
import type { InkStroke } from '../components/practice/FreehandCanvas';

describe('Handwriting API Service', () => {
  const dummyInk: InkStroke[] = [
    [[10, 20, 30], [10, 20, 30], [1000, 1020, 1040]],
  ];

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  describe('evaluateMatch', () => {
    it('evaluates match rank correctly', () => {
      const candidates = ['好', '女', '子', '如'];
      expect(evaluateMatch('好', candidates).matchedRank).toBe(1);
      expect(evaluateMatch('女', candidates).matchedRank).toBe(2);
      expect(evaluateMatch('子', candidates).matchedRank).toBe(3);
      expect(evaluateMatch('你', candidates).matchedRank).toBe(-1);
    });

    it('returns -1 for empty candidates array', () => {
      expect(evaluateMatch('好', []).matchedRank).toBe(-1);
    });
  });

  describe('recognizeHandwriting', () => {
    it('parses Google handwriting API JSON response correctly', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => [
          'SUCCESS',
          [['requests', ['你', '仁', '什', '化']]],
        ],
      } as unknown as Response);
      vi.stubGlobal('fetch', mockFetch);

      const result = await recognizeHandwriting(dummyInk, 300, 300, '你');
      expect(result.success).toBe(true);
      expect(result.candidates).toEqual(['你', '仁', '什', '化']);
      expect(result.matchedRank).toBe(1);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('https://inputtools.google.com/request?ime=handwriting'),
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: expect.stringContaining('zh-t-i0-handwrit'),
        })
      );
    });

    it('calculates matchedRank when target is lower in candidate list', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => [
          'SUCCESS',
          [['requests', ['仁', '什', '你', '化']]],
        ],
      } as unknown as Response);
      vi.stubGlobal('fetch', mockFetch);

      const result = await recognizeHandwriting(dummyInk, 300, 300, '你');
      expect(result.success).toBe(true);
      expect(result.matchedRank).toBe(3);
    });

    it('returns matchedRank -1 when target is not found in candidates', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => [
          'SUCCESS',
          [['requests', ['木', '本', '禾']]],
        ],
      } as unknown as Response);
      vi.stubGlobal('fetch', mockFetch);

      const result = await recognizeHandwriting(dummyInk, 300, 300, '你');
      expect(result.success).toBe(true);
      expect(result.candidates).toEqual(['木', '本', '禾']);
      expect(result.matchedRank).toBe(-1);
    });

    it('handles HTTP error status gracefully', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
      } as unknown as Response);
      vi.stubGlobal('fetch', mockFetch);

      const result = await recognizeHandwriting(dummyInk, 300, 300, '你');
      expect(result.success).toBe(false);
      expect(result.candidates).toEqual([]);
      expect(result.matchedRank).toBe(-1);
    });

    it('handles network fetch exception gracefully', async () => {
      const mockFetch = vi.fn().mockRejectedValue(new Error('Network error'));
      vi.stubGlobal('fetch', mockFetch);

      const result = await recognizeHandwriting(dummyInk, 300, 300, '你');
      expect(result.success).toBe(false);
      expect(result.candidates).toEqual([]);
      expect(result.matchedRank).toBe(-1);
    });

    it('handles unexpected response JSON format gracefully', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ['FAILED', []],
      } as unknown as Response);
      vi.stubGlobal('fetch', mockFetch);

      const result = await recognizeHandwriting(dummyInk, 300, 300, '你');
      expect(result.success).toBe(false);
      expect(result.candidates).toEqual([]);
      expect(result.matchedRank).toBe(-1);
    });

    it('returns empty failure when ink array is empty without network call', async () => {
      const fetchMock = vi.fn();
      vi.stubGlobal('fetch', fetchMock);

      const result = await recognizeHandwriting([], 300, 300, '你');
      expect(result.success).toBe(false);
      expect(result.candidates).toEqual([]);
      expect(result.matchedRank).toBe(-1);
      expect(fetchMock).not.toHaveBeenCalled();
    });
  });
});

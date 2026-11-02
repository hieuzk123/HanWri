import { describe, it, expect, beforeEach } from 'vitest';
import 'fake-indexeddb/auto';
import {
  db,
  seedInitialDecks,
  getDeckWithWords,
  createDeck,
  addWordToDeck,
  deleteWord,
} from './index';

describe('Database & Seed', () => {
  beforeEach(async () => {
    await db.decks.clear();
    await db.words.clear();
  });

  describe('seedInitialDecks', () => {
    it('seeds default HSK 1 deck with basic words', async () => {
      await seedInitialDecks();
      const decks = await db.decks.toArray();
      expect(decks.length).toBeGreaterThan(0);
      expect(decks[0].title).toContain('HSK 1');

      const words = await db.words.where('deckId').equals(decks[0].id!).toArray();
      expect(words.length).toBe(8);
      expect(words.some((w) => w.hanzi === '你好')).toBe(true);
      expect(words.some((w) => w.hanzi === '谢谢')).toBe(true);
      expect(decks[0].wordCount).toBe(8);
    });

    it('is idempotent and does not duplicate decks or words when called multiple times', async () => {
      await seedInitialDecks();
      await seedInitialDecks();

      const decks = await db.decks.toArray();
      expect(decks.length).toBe(1);

      const words = await db.words.toArray();
      expect(words.length).toBe(8);
    });
  });

  describe('CRUD helper functions', () => {
    it('createDeck creates a deck with wordCount 0 and timestamps', async () => {
      const nowBefore = Date.now();
      const deckId = await createDeck('HSK 2 Mở rộng', 'Bộ từ vựng HSK 2');
      const nowAfter = Date.now();

      const deck = await db.decks.get(deckId);
      expect(deck).toBeDefined();
      expect(deck?.title).toBe('HSK 2 Mở rộng');
      expect(deck?.description).toBe('Bộ từ vựng HSK 2');
      expect(deck?.wordCount).toBe(0);
      expect(deck?.createdAt).toBeGreaterThanOrEqual(nowBefore);
      expect(deck?.createdAt).toBeLessThanOrEqual(nowAfter);
      expect(deck?.updatedAt).toBeGreaterThanOrEqual(nowBefore);
    });

    it('addWordToDeck adds a word and updates deck wordCount', async () => {
      const deckId = await createDeck('Bộ từ mới');

      const wordId = await addWordToDeck({
        deckId,
        hanzi: '水',
        pinyin: 'shuǐ',
        sinoVietnamese: 'Thủy',
        meaning: 'Nước',
      });

      expect(wordId).toBeDefined();

      const word = await db.words.get(wordId);
      expect(word?.hanzi).toBe('水');
      expect(word?.deckId).toBe(deckId);

      const deck = await db.decks.get(deckId);
      expect(deck?.wordCount).toBe(1);
    });

    it('getDeckWithWords returns deck and all words belonging to it', async () => {
      const deckId = await createDeck('Từ vựng Du lịch');
      await addWordToDeck({ deckId, hanzi: '飞机', pinyin: 'fēijī', meaning: 'Máy bay' });
      await addWordToDeck({ deckId, hanzi: '机场', pinyin: 'jīchǎng', meaning: 'Sân bay' });

      const result = await getDeckWithWords(deckId);
      expect(result).not.toBeNull();
      expect(result?.deck.id).toBe(deckId);
      expect(result?.words.length).toBe(2);
      expect(result?.words.map((w) => w.hanzi)).toEqual(['飞机', '机场']);
    });

    it('getDeckWithWords returns null if deck does not exist', async () => {
      const result = await getDeckWithWords(99999);
      expect(result).toBeNull();
    });

    it('deleteWord removes word and updates deck wordCount', async () => {
      const deckId = await createDeck('Bộ thử nghiệm xóa');
      const word1Id = await addWordToDeck({ deckId, hanzi: '猫', pinyin: 'māo', meaning: 'Con mèo' });
      const word2Id = await addWordToDeck({ deckId, hanzi: '狗', pinyin: 'gǒu', meaning: 'Con chó' });

      let deck = await db.decks.get(deckId);
      expect(deck?.wordCount).toBe(2);

      await deleteWord(word1Id);

      const deletedWord = await db.words.get(word1Id);
      expect(deletedWord).toBeUndefined();

      deck = await db.decks.get(deckId);
      expect(deck?.wordCount).toBe(1);

      const remainingWords = await db.words.where('deckId').equals(deckId).toArray();
      expect(remainingWords.length).toBe(1);
      expect(remainingWords[0].id).toBe(word2Id);
    });
  });
});

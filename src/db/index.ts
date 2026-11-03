import Dexie, { type Table } from 'dexie';
import type { Deck, Word, ReviewRating } from '../types';
import { STARTER_WORDS_DATA } from './seed';
import { calculateNextReview } from '../services/srsService';

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

export async function seedInitialDecks(): Promise<void> {
  const existing = await db.decks.count();
  if (existing > 0) return;

  const defaultDeckId = await db.decks.add({
    title: 'HSK 1 Căn bản',
    description: 'Bộ từ vựng giao tiếp căn bản cho người mới bắt đầu',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    wordCount: STARTER_WORDS_DATA.length,
  });

  const starterWords: Omit<Word, 'id'>[] = STARTER_WORDS_DATA.map((item) => ({
    ...item,
    deckId: defaultDeckId,
  }));

  await db.words.bulkAdd(starterWords as Word[]);
}

export async function getDeckWithWords(
  deckId: number
): Promise<{ deck: Deck; words: Word[] } | null> {
  const deck = await db.decks.get(deckId);
  if (!deck) return null;

  const words = await db.words.where('deckId').equals(deckId).toArray();
  return { deck, words };
}

export async function createDeck(
  title: string,
  description: string = ''
): Promise<number> {
  const now = Date.now();
  const id = await db.decks.add({
    title,
    description,
    createdAt: now,
    updatedAt: now,
    wordCount: 0,
  });
  return id;
}

export async function updateDeck(
  deckId: number,
  changes: { title?: string; description?: string }
): Promise<void> {
  const deck = await db.decks.get(deckId);
  if (!deck) return;

  await db.decks.update(deckId, {
    ...changes,
    updatedAt: Date.now(),
  });
}

export async function addWordToDeck(word: Omit<Word, 'id'>): Promise<number> {
  const wordId = await db.words.add(word as Word);
  const count = await db.words.where('deckId').equals(word.deckId).count();
  await db.decks.update(word.deckId, {
    wordCount: count,
    updatedAt: Date.now(),
  });
  return wordId;
}

export async function updateWord(
  wordId: number,
  changes: Partial<Omit<Word, 'id' | 'deckId'>>
): Promise<void> {
  const word = await db.words.get(wordId);
  if (!word) return;

  await db.words.update(wordId, {
    ...changes,
  });

  await db.decks.update(word.deckId, {
    updatedAt: Date.now(),
  });
}

export async function recordWordReview(
  wordId: number,
  rating: ReviewRating,
  now: number = Date.now()
): Promise<Word | null> {
  const word = await db.words.get(wordId);
  if (!word) return null;

  const srsResult = calculateNextReview(word, rating, now);
  const practiceCount = (word.practiceCount ?? 0) + 1;

  await db.words.update(wordId, {
    nextReviewDate: srsResult.nextReviewDate,
    interval: srsResult.interval,
    easeFactor: srsResult.easeFactor,
    repetitions: srsResult.repetitions,
    practiceCount,
  });

  await db.decks.update(word.deckId, {
    updatedAt: now,
  });

  return (await db.words.get(wordId)) ?? null;
}

export async function deleteWord(wordId: number): Promise<void> {
  const word = await db.words.get(wordId);
  if (!word) return;

  await db.words.delete(wordId);
  const count = await db.words.where('deckId').equals(word.deckId).count();
  await db.decks.update(word.deckId, {
    wordCount: count,
    updatedAt: Date.now(),
  });
}

export { STARTER_WORDS_DATA };

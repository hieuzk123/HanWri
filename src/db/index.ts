import Dexie, { type Table } from 'dexie';
import type { Deck, Word } from '../types';
import { STARTER_WORDS_DATA } from './seed';

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

export async function addWordToDeck(word: Omit<Word, 'id'>): Promise<number> {
  const wordId = await db.words.add(word as Word);
  const count = await db.words.where('deckId').equals(word.deckId).count();
  await db.decks.update(word.deckId, {
    wordCount: count,
    updatedAt: Date.now(),
  });
  return wordId;
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

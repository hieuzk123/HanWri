import React, { useState, useEffect } from 'react';
import { Search, Zap, X, Play, Edit3, PenTool, AlertTriangle, Loader2 } from 'lucide-react';
import type { Deck, Word } from './types';
import {
  db,
  seedInitialDecks,
  createDeck,
  addWordToDeck,
  deleteWord,
  getDeckWithWords,
} from './db';
import DeckList from './components/deck/DeckList';
import DeckDetail from './components/deck/DeckDetail';
import CreateDeckModal from './components/deck/CreateDeckModal';
import AddWordModal from './components/deck/AddWordModal';
import DeckImporter from './components/deck/DeckImporter';
import WordContainer from './components/practice/WordContainer';
import StrokeAnimator from './components/practice/StrokeAnimator';
import GuidedQuiz from './components/practice/GuidedQuiz';
import FreehandRecognitionView from './components/practice/FreehandRecognitionView';

export default function App() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null);
  const [selectedDeckWords, setSelectedDeckWords] = useState<Word[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAddWordModalOpen, setIsAddWordModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [wordToDelete, setWordToDelete] = useState<Word | null>(null);

  // Quick Practice state
  const [quickPracticeInput, setQuickPracticeInput] = useState('');
  const [activeQuickWord, setActiveQuickWord] = useState<Word | null>(null);
  const [quickPracticeMode, setQuickPracticeMode] = useState<'animation' | 'quiz' | 'freehand'>('animation');

  const loadDecks = async () => {
    const loadedDecks = await db.decks.toArray();
    setDecks(loadedDecks);
  };

  useEffect(() => {
    const initApp = async () => {
      try {
        await seedInitialDecks();
        await loadDecks();
      } catch (err) {
        console.error('Failed to initialize HanWri database:', err);
      } finally {
        setIsLoading(false);
      }
    };
    initApp();
  }, []);

  const handleSelectDeck = async (deck: Deck) => {
    if (!deck.id) return;
    try {
      const data = await getDeckWithWords(deck.id);
      if (data) {
        setSelectedDeck(data.deck);
        setSelectedDeckWords(data.words);
      }
    } catch (err) {
      console.error('Failed to load deck words:', err);
    }
  };

  const handleBackToDecks = async () => {
    setSelectedDeck(null);
    setSelectedDeckWords([]);
    await loadDecks();
  };

  const handleCreateDeck = async (deckData: { title: string; description: string }) => {
    await createDeck(deckData.title, deckData.description);
    await loadDecks();
    setIsCreateModalOpen(false);
  };

  const handleAddWord = async (wordData: {
    hanzi: string;
    pinyin?: string;
    sinoVietnamese?: string;
    meaning?: string;
    notes?: string;
  }) => {
    if (!selectedDeck?.id) return;
    await addWordToDeck({
      ...wordData,
      deckId: selectedDeck.id,
    });
    const data = await getDeckWithWords(selectedDeck.id);
    if (data) {
      setSelectedDeck(data.deck);
      setSelectedDeckWords(data.words);
    }
    await loadDecks();
    setIsAddWordModalOpen(false);
  };

  const handlePromptDeleteWord = (wordId: number) => {
    const word = selectedDeckWords.find((w) => w.id === wordId);
    if (word) {
      setWordToDelete(word);
    } else {
      setWordToDelete({ id: wordId, deckId: selectedDeck?.id || 0, hanzi: '' });
    }
  };

  const handleConfirmDeleteWord = async () => {
    if (!wordToDelete?.id || !selectedDeck?.id) return;
    await deleteWord(wordToDelete.id);
    const data = await getDeckWithWords(selectedDeck.id);
    if (data) {
      setSelectedDeck(data.deck);
      setSelectedDeckWords(data.words);
    }
    await loadDecks();
    setWordToDelete(null);
  };

  const handleImportSuccess = async (deckTitle: string, words: Omit<Word, 'id' | 'deckId'>[]) => {
    const deckId = await createDeck(deckTitle);
    const wordsWithDeckId: Word[] = words.map((w) => ({
      ...w,
      deckId,
    }));
    await db.words.bulkAdd(wordsWithDeckId);
    await db.decks.update(deckId, {
      wordCount: wordsWithDeckId.length,
      updatedAt: Date.now(),
    });
    await loadDecks();
    setIsImportModalOpen(false);
  };

  const handleLaunchQuickPractice = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = quickPracticeInput.trim();
    if (!trimmed) return;

    setActiveQuickWord({
      deckId: 0,
      hanzi: trimmed,
      meaning: 'Luyện tập nhanh',
    });
    setQuickPracticeMode('animation');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleLaunchQuickPractice();
    }
  };

  return (
    <div className="min-h-screen bg-chinese-paper text-chinese-ink flex flex-col font-sans">
      {/* App Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs sticky top-0 z-30">
        <div
          className="flex items-center gap-3 cursor-pointer select-none"
          onClick={handleBackToDecks}
        >
          <div className="w-10 h-10 rounded-xl bg-chinese-red text-white flex items-center justify-center font-bold text-xl shadow">
            漢
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900 leading-tight">HanWri</h1>
            <p className="text-xs text-gray-500">Luyện viết & Học chữ Hán thông minh</p>
          </div>
        </div>

        {/* Quick Practice Search Bar */}
        <form onSubmit={handleLaunchQuickPractice} className="flex items-center gap-2 max-w-md w-full">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={quickPracticeInput}
              onChange={(e) => setQuickPracticeInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Nhập từ hoặc chữ Hán muốn luyện..."
              className="w-full pl-9 pr-3.5 py-2 text-sm bg-gray-50 hover:bg-gray-100/80 focus:bg-white border border-gray-200 focus:border-chinese-red rounded-xl focus:outline-none focus:ring-2 focus:ring-chinese-red/20 transition"
            />
          </div>
          <button
            type="submit"
            disabled={!quickPracticeInput.trim()}
            className="flex items-center gap-1.5 px-4 py-2 bg-chinese-red hover:bg-chinese-crimson disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl shadow-xs transition cursor-pointer flex-shrink-0"
          >
            <Zap className="w-4 h-4" />
            <span>Luyện ngay</span>
          </button>
        </form>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-8 max-w-6xl w-full mx-auto">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-20 text-gray-400 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-chinese-red" />
            <p className="text-sm font-medium">Đang tải dữ liệu HanWri...</p>
          </div>
        ) : selectedDeck ? (
          <DeckDetail
            deck={selectedDeck}
            words={selectedDeckWords}
            onBack={handleBackToDecks}
            onAddWord={() => setIsAddWordModalOpen(true)}
            onDeleteWord={handlePromptDeleteWord}
          />
        ) : (
          <DeckList
            decks={decks}
            onSelectDeck={handleSelectDeck}
            onOpenCreateModal={() => setIsCreateModalOpen(true)}
            onOpenImportModal={() => setIsImportModalOpen(true)}
          />
        )}
      </main>

      {/* Quick Practice Modal */}
      {activeQuickWord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-chinese-red" />
                <h3 className="font-bold text-gray-900 text-lg">
                  Luyện viết nhanh: <span className="text-chinese-red font-medium">{activeQuickWord.hanzi}</span>
                </h3>
              </div>
              <button
                onClick={() => setActiveQuickWord(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition cursor-pointer"
                aria-label="Đóng luyện nhanh"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex flex-col items-center">
              {/* Practice mode switcher */}
              <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-xl mb-6">
                <button
                  onClick={() => setQuickPracticeMode('animation')}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                    quickPracticeMode === 'animation'
                      ? 'bg-white text-chinese-red shadow'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Play className="w-4 h-4" />
                  <span>Xem hoạt ảnh nét</span>
                </button>

                <button
                  onClick={() => setQuickPracticeMode('quiz')}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                    quickPracticeMode === 'quiz'
                      ? 'bg-white text-chinese-red shadow'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Đồ chữ theo thứ tự</span>
                </button>

                <button
                  onClick={() => setQuickPracticeMode('freehand')}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                    quickPracticeMode === 'freehand'
                      ? 'bg-white text-chinese-red shadow'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <PenTool className="w-4 h-4" />
                  <span>Khung viết & Nhận diện</span>
                </button>
              </div>

              {/* Word Coordinator */}
              <WordContainer word={activeQuickWord}>
                {(currentChar) => {
                  if (quickPracticeMode === 'animation') {
                    return <StrokeAnimator character={currentChar} size={300} />;
                  } else if (quickPracticeMode === 'quiz') {
                    return <GuidedQuiz character={currentChar} size={300} />;
                  } else {
                    return <FreehandRecognitionView character={currentChar} size={300} />;
                  }
                }}
              </WordContainer>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Word Deletion */}
      {wordToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center border border-gray-100">
            <div className="w-12 h-12 rounded-full bg-red-100 text-chinese-red flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-gray-900 mb-2">Xác nhận xóa từ</h4>
            <p className="text-sm text-gray-600 mb-6">
              Bạn có chắc chắn muốn xóa từ vựng này không? Hành động này không thể hoàn tác.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setWordToDelete(null)}
                className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg text-sm font-semibold transition cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleConfirmDeleteWord}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition shadow cursor-pointer"
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Deck Modal */}
      <CreateDeckModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateDeck={handleCreateDeck}
      />

      {/* Add Word Modal */}
      <AddWordModal
        isOpen={isAddWordModalOpen}
        onClose={() => setIsAddWordModalOpen(false)}
        onAddWord={handleAddWord}
      />

      {/* Deck Importer Modal */}
      <DeckImporter
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={handleImportSuccess}
      />
    </div>
  );
}

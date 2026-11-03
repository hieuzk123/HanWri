import React, { useState } from 'react';
import type { Deck, Word } from '../../types';
import { ArrowLeft, Play, PenTool, Edit3, Trash2, Plus, Pencil } from 'lucide-react';
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
  onEditDeck?: (deck: Deck) => void;
  onEditWord?: (word: Word) => void;
}

export const DeckDetail: React.FC<DeckDetailProps> = ({
  deck,
  words,
  onBack,
  onAddWord,
  onDeleteWord,
  onEditDeck,
  onEditWord,
}) => {
  const [selectedWordIndex, setSelectedWordIndex] = useState<number | null>(null);
  const [practiceMode, setPracticeMode] = useState<'animation' | 'quiz' | 'freehand'>('animation');

  const currentWord =
    selectedWordIndex !== null && selectedWordIndex >= 0 && selectedWordIndex < words.length
      ? words[selectedWordIndex]
      : null;

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Top back & title bar */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={selectedWordIndex !== null ? () => setSelectedWordIndex(null) : onBack}
          className="flex items-center gap-1.5 text-sm font-semibold text-gray-600 hover:text-chinese-red transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{selectedWordIndex !== null ? 'Quay lại danh sách từ' : 'Quay lại bộ từ'}</span>
        </button>

        <div className="text-right">
          <div className="flex items-center justify-end gap-1.5">
            <h2 className="text-xl font-bold text-gray-900">{deck.title}</h2>
            {onEditDeck && (
              <button
                onClick={() => onEditDeck(deck)}
                aria-label="Chỉnh sửa bộ từ"
                title="Chỉnh sửa bộ từ"
                className="p-1 text-gray-400 hover:text-chinese-red hover:bg-red-50 rounded-lg transition cursor-pointer"
              >
                <Pencil className="w-4 h-4" />
              </button>
            )}
          </div>
          <span className="text-xs text-gray-500">{words.length} từ vựng</span>
        </div>
      </div>

      {/* Mode View: Word Practice Mode */}
      {currentWord ? (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col items-center relative">
          {/* Practice mode switcher & Edit word shortcut */}
          <div className="w-full flex items-center justify-between mb-6">
            <div className="w-20 hidden sm:block"></div>
            <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-xl mx-auto">
              <button
                onClick={() => setPracticeMode('animation')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                  practiceMode === 'animation'
                    ? 'bg-white text-chinese-red shadow'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Play className="w-4 h-4" />
                <span>Xem hoạt ảnh nét</span>
              </button>

              <button
                onClick={() => setPracticeMode('quiz')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                  practiceMode === 'quiz'
                    ? 'bg-white text-chinese-red shadow'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Edit3 className="w-4 h-4" />
                <span>Đồ chữ theo thứ tự</span>
              </button>

              <button
                onClick={() => setPracticeMode('freehand')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                  practiceMode === 'freehand'
                    ? 'bg-white text-chinese-red shadow'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <PenTool className="w-4 h-4" />
                <span>Khung viết & Nhận diện</span>
              </button>
            </div>

            {onEditWord && (
              <button
                onClick={() => onEditWord(currentWord)}
                aria-label="Sửa từ này"
                title="Sửa thông tin từ này"
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:text-chinese-red hover:bg-red-50 rounded-lg transition border border-gray-200 cursor-pointer"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sửa từ</span>
              </button>
            )}
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
              className="px-4 py-2 text-sm font-semibold rounded-lg border border-gray-200 text-gray-700 disabled:opacity-40 hover:bg-gray-50 transition cursor-pointer disabled:cursor-not-allowed"
            >
              Từ trước
            </button>

            <span className="text-xs text-gray-400 font-medium">
              {(selectedWordIndex ?? 0) + 1} / {words.length}
            </span>

            <button
              onClick={() =>
                setSelectedWordIndex((prev) => Math.min(words.length - 1, (prev || 0) + 1))
              }
              disabled={selectedWordIndex === words.length - 1}
              className="px-4 py-2 text-sm font-semibold rounded-lg bg-chinese-red text-white disabled:opacity-40 hover:bg-chinese-crimson transition cursor-pointer disabled:cursor-not-allowed"
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
              className="flex items-center gap-1 px-3 py-1.5 bg-gray-900 text-white rounded-lg text-xs font-bold hover:bg-gray-800 transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm từ</span>
            </button>
          </div>

          {words.length === 0 ? (
            <div className="bg-white rounded-xl border border-dashed border-gray-300 p-8 text-center">
              <p className="text-sm text-gray-500 mb-3">Chưa có từ nào trong bộ này.</p>
              <button
                onClick={onAddWord}
                className="px-3.5 py-1.5 bg-chinese-red text-white rounded-lg text-xs font-semibold hover:bg-chinese-crimson transition cursor-pointer"
              >
                Thêm từ đầu tiên
              </button>
            </div>
          ) : (
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
                    {w.pinyin && <div className="text-xs text-chinese-red font-medium">{w.pinyin}</div>}
                    {w.meaning && (
                      <div className="text-xs text-gray-500 line-clamp-1">{w.meaning}</div>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    {onEditWord && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditWord(w);
                        }}
                        aria-label={`Chỉnh sửa từ ${w.hanzi}`}
                        className="p-1.5 text-gray-300 hover:text-chinese-red rounded-lg hover:bg-red-50 opacity-0 group-hover:opacity-100 transition cursor-pointer"
                        title="Chỉnh sửa từ"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (w.id) onDeleteWord(w.id);
                      }}
                      aria-label={`Xóa từ ${w.hanzi}`}
                      className="p-1.5 text-gray-300 hover:text-red-500 rounded-lg hover:bg-red-50 opacity-0 group-hover:opacity-100 transition cursor-pointer"
                      title="Xóa từ"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DeckDetail;

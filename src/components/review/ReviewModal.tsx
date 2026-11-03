import React, { useState } from 'react';
import {
  X,
  Brain,
  BookOpen,
  Edit3,
  PenTool,
  Eye,
  CheckCircle2,
  RotateCcw,
  ArrowLeft,
  Trophy,
  Clock,
} from 'lucide-react';
import type { Deck, Word, ReviewRating } from '../../types';
import { getDueWords, getReviewOptions } from '../../services/srsService';
import GuidedQuiz from '../practice/GuidedQuiz';
import FreehandRecognitionView from '../practice/FreehandRecognitionView';
import StrokeAnimator from '../practice/StrokeAnimator';

export interface DeckWithWords {
  deck: Deck;
  words: Word[];
}

export interface ReviewModalProps {
  isOpen: boolean;
  decksWithWords: DeckWithWords[];
  onClose: () => void;
  onRecordReview: (wordId: number, rating: ReviewRating) => void | Promise<void>;
}

const MAX_MISTAKES_ALLOWED = 3;

export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  decksWithWords,
  onClose,
  onRecordReview,
}) => {
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null);
  const [reviewQueue, setReviewQueue] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [practiceMode, setPracticeMode] = useState<'quiz' | 'freehand'>('quiz');
  const [wordStatus, setWordStatus] = useState<'writing' | 'passed' | 'relearn'>('writing');

  if (!isOpen) return null;

  const handleSelectDeck = (item: DeckWithWords, forceAll = false) => {
    if (item.words.length === 0) return;
    const dueWords = getDueWords(item.words);
    const wordsToReview = !forceAll && dueWords.length > 0 ? dueWords : item.words;

    setSelectedDeck(item.deck);
    setReviewQueue([...wordsToReview]);
    setCurrentIndex(0);
    setCharIndex(0);
    setWordStatus('writing');
  };

  const handleBackToDeckSelection = () => {
    setSelectedDeck(null);
    setReviewQueue([]);
    setCurrentIndex(0);
    setCharIndex(0);
    setWordStatus('writing');
  };

  const currentWord =
    selectedDeck && currentIndex < reviewQueue.length ? reviewQueue[currentIndex] : null;
  const characters = currentWord ? Array.from(currentWord.hanzi) : [];
  const activeChar = characters[charIndex] || '';

  const handleMistake = (mistakes: number) => {
    if (mistakes > MAX_MISTAKES_ALLOWED) {
      setWordStatus('relearn');
    }
  };

  const handleCharSuccess = (mistakes: number = 0) => {
    if (mistakes > MAX_MISTAKES_ALLOWED) {
      setWordStatus('relearn');
      return;
    }

    if (charIndex < characters.length - 1) {
      setCharIndex((prev) => prev + 1);
    } else {
      setWordStatus('passed');
    }
  };

  const handleShowAnswer = () => {
    setWordStatus('relearn');
  };

  const handleRateWord = (rating: ReviewRating) => {
    if (!currentWord) return;

    if (currentWord.id) {
      onRecordReview(currentWord.id, rating);
    }

    // If user chose 1 (Quên rồi), re-queue word at the end of current session
    if (rating === 1) {
      setReviewQueue((prev) => [...prev, currentWord]);
    }

    setCurrentIndex((prev) => prev + 1);
    setCharIndex(0);
    setWordStatus('writing');
  };

  const handleConfirmRelearn = () => {
    handleRateWord(1);
  };

  const ratingStyleMap: Record<ReviewRating, string> = {
    1: 'bg-red-50 hover:bg-red-100 text-red-700 border-red-200',
    2: 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200',
    3: 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200',
    4: 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/60">
          <div className="flex items-center gap-2.5">
            {selectedDeck ? (
              <button
                type="button"
                onClick={handleBackToDeckSelection}
                className="p-1.5 rounded-lg text-gray-500 hover:text-chinese-red hover:bg-gray-100 transition cursor-pointer"
                aria-label="Chọn bộ từ khác"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            ) : (
              <Brain className="w-5 h-5 text-chinese-red" />
            )}
            <div>
              <h3 className="font-bold text-gray-900 text-lg leading-tight">
                {selectedDeck ? `Ôn tập: ${selectedDeck.title}` : 'Ôn tập từ vựng'}
              </h3>
              {selectedDeck && reviewQueue.length > 0 && currentIndex < reviewQueue.length && (
                <p className="text-xs text-gray-500">
                  Tiến độ: {currentIndex + 1} / {reviewQueue.length}
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition cursor-pointer"
            aria-label="Đóng ôn tập"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {!selectedDeck ? (
            /* Step 1: Select Deck */
            <div>
              <p className="text-sm text-gray-600 mb-4">
                Chọn bộ từ bạn muốn ôn tập. Hệ thống sẽ ưu tiên các từ đã đến hạn ôn tập theo phương pháp lặp lại ngắt quãng (SRS).
              </p>

              {decksWithWords.length === 0 ? (
                <div className="p-8 text-center text-gray-500 text-sm border border-dashed border-gray-300 rounded-xl">
                  Chưa có bộ từ nào để ôn tập.
                </div>
              ) : (
                <div className="space-y-3">
                  {decksWithWords.map((item) => {
                    const dueWords = getDueWords(item.words);
                    const hasWords = item.words.length > 0;

                    return (
                      <div
                        key={item.deck.id}
                        onClick={() => hasWords && handleSelectDeck(item, false)}
                        className={`p-4 rounded-xl border transition flex items-center justify-between ${
                          hasWords
                            ? 'bg-white border-gray-200 hover:border-chinese-red hover:shadow-sm cursor-pointer group'
                            : 'bg-gray-50 border-gray-200 opacity-60 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex items-center gap-3.5">
                          <div className="w-10 h-10 rounded-lg bg-red-50 text-chinese-red flex items-center justify-center flex-shrink-0">
                            <BookOpen className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900 group-hover:text-chinese-red transition">
                              {item.deck.title}
                            </h4>
                            <p className="text-xs text-gray-500">
                              Tổng số: {item.words.length} từ
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {hasWords ? (
                            <>
                              <span
                                className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 ${
                                  dueWords.length > 0
                                    ? 'bg-red-50 text-chinese-red border border-red-200'
                                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                }`}
                              >
                                <Clock className="w-3.5 h-3.5" />
                                {dueWords.length > 0
                                  ? `${dueWords.length} cần ôn`
                                  : 'Đã ôn xong hôm nay'}
                              </span>

                              {dueWords.length > 0 && dueWords.length < item.words.length && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSelectDeck(item, true);
                                  }}
                                  className="text-xs font-semibold px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition cursor-pointer"
                                >
                                  Ôn tất cả
                                </button>
                              )}
                            </>
                          ) : (
                            <span className="text-xs text-gray-400">Trống</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : currentWord ? (
            /* Step 2: Active Word Review */
            <div className="flex flex-col items-center">
              {/* Mode Switcher (Only Quiz & Freehand, NO Stroke Animation tab) */}
              {wordStatus === 'writing' && (
                <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-xl mb-5">
                  <button
                    type="button"
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
                    type="button"
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
              )}

              {/* Prompt Card: Pinyin + Meaning (Hanzi hidden while writing) */}
              <div className="text-center mb-5 bg-amber-50/50 border border-amber-200/70 rounded-xl px-6 py-4 w-full max-w-md">
                <div className="text-2xl font-bold text-chinese-red tracking-wide mb-1">
                  {currentWord.pinyin || 'Chưa có phiên âm'}
                </div>

                <div className="flex items-center justify-center gap-2 flex-wrap">
                  {currentWord.sinoVietnamese && (
                    <span className="text-xs uppercase tracking-wider bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded">
                      {currentWord.sinoVietnamese}
                    </span>
                  )}
                  {currentWord.meaning && (
                    <span className="text-sm font-medium text-gray-700">
                      {currentWord.meaning}
                    </span>
                  )}
                </div>

                {/* Character progress slots */}
                <div className="flex items-center justify-center gap-2 mt-3">
                  {characters.map((ch, idx) => {
                    const isRevealed =
                      wordStatus !== 'writing' || idx < charIndex;
                    const isActive =
                      wordStatus === 'writing' && idx === charIndex;

                    return (
                      <div
                        key={idx}
                        className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center font-bold text-lg transition ${
                          isRevealed
                            ? 'bg-white border-emerald-400 text-gray-900'
                            : isActive
                            ? 'bg-red-50 border-chinese-red text-chinese-red'
                            : 'bg-gray-100 border-gray-200 text-gray-400'
                        }`}
                      >
                        {isRevealed ? ch : `?`}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Writing Canvas OR Passed SRS Buttons OR Relearn Model */}
              {wordStatus === 'writing' && (
                <div className="flex flex-col items-center">
                  {practiceMode === 'quiz' ? (
                    <GuidedQuiz
                      key={`${currentWord.id}-${charIndex}`}
                      character={activeChar}
                      size={280}
                      showOutline={false}
                      onMistake={handleMistake}
                      onQuizComplete={handleCharSuccess}
                    />
                  ) : (
                    <FreehandRecognitionView
                      key={`${currentWord.id}-${charIndex}`}
                      character={activeChar}
                      size={280}
                      onSuccess={() => handleCharSuccess(0)}
                    />
                  )}

                  <button
                    type="button"
                    onClick={handleShowAnswer}
                    className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-chinese-red transition cursor-pointer"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Không nhớ / Xem đáp án</span>
                  </button>
                </div>
              )}

              {wordStatus === 'passed' && (
                <div className="w-full max-w-md flex flex-col items-center animate-in fade-in duration-150">
                  <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 border border-emerald-200 px-4 py-2.5 rounded-xl mb-4 w-full justify-center">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    <span className="text-sm font-bold">
                      Viết chính xác! Hãy chọn mức độ nhớ từ này:
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full">
                    {getReviewOptions(currentWord).map((opt) => (
                      <button
                        key={opt.rating}
                        type="button"
                        onClick={() => handleRateWord(opt.rating)}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl border font-semibold transition cursor-pointer shadow-2xs ${
                          ratingStyleMap[opt.rating]
                        }`}
                      >
                        <span className="text-sm font-bold">{opt.label}</span>
                        <span className="text-xs opacity-80 mt-0.5">{opt.timeLabel}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {wordStatus === 'relearn' && (
                <div className="w-full max-w-md flex flex-col items-center animate-in fade-in duration-150">
                  <div className="text-center mb-3">
                    <span className="text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-3 py-1 rounded-full">
                      Chưa thuộc chữ — Quan sát mẫu nét viết để học lại
                    </span>
                  </div>

                  <StrokeAnimator character={activeChar} size={260} />

                  <button
                    type="button"
                    onClick={handleConfirmRelearn}
                    className="mt-5 flex items-center gap-2 px-5 py-2.5 bg-chinese-red hover:bg-chinese-crimson text-white rounded-xl text-sm font-bold shadow transition cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Học lại từ này (Cuối phiên)</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Step 3: Session Complete */
            <div className="py-10 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
                <Trophy className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-1">
                Hoàn thành phiên ôn tập!
              </h4>
              <p className="text-sm text-gray-600 max-w-sm mb-6">
                Bạn đã ôn tập xong toàn bộ các từ trong lượt này. Thời gian ôn tập tiếp theo đã được cập nhật cho từng từ.
              </p>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleBackToDeckSelection}
                  className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl text-sm font-semibold transition cursor-pointer"
                >
                  Chọn bộ từ khác
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2 bg-chinese-red hover:bg-chinese-crimson text-white rounded-xl text-sm font-semibold shadow transition cursor-pointer"
                >
                  Hoàn tất
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;

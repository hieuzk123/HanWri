import React, { useEffect, useRef, useState } from 'react';
import HanziWriter from 'hanzi-writer';
import { HelpCircle, RotateCcw, CheckCircle, AlertTriangle } from 'lucide-react';
import CharacterGrid from '../grid/CharacterGrid';

export interface GuidedQuizProps {
  character: string;
  size?: number;
  showOutline?: boolean;
  onQuizComplete?: (mistakes: number) => void;
  onMistake?: (mistakes: number) => void;
  className?: string;
}

export const GuidedQuiz: React.FC<GuidedQuizProps> = ({
  character,
  size = 320,
  showOutline = true,
  onQuizComplete,
  onMistake,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const writerRef = useRef<HanziWriter | null>(null);
  const onQuizCompleteRef = useRef(onQuizComplete);
  const onMistakeRef = useRef(onMistake);
  const mistakesRef = useRef(0);

  useEffect(() => {
    onQuizCompleteRef.current = onQuizComplete;
    onMistakeRef.current = onMistake;
  }, [onQuizComplete, onMistake]);

  const [mistakes, setMistakes] = useState(0);
  const [totalStrokes, setTotalStrokes] = useState(0);
  const [currentStroke, setCurrentStroke] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const startQuiz = (writerInstance?: HanziWriter) => {
    const writer = writerInstance || writerRef.current;
    if (!writer) return;
    setIsCompleted(false);
    setMistakes(0);
    mistakesRef.current = 0;
    setCurrentStroke(0);

    writer.quiz({
      onMistake: () => {
        const nextMistakes = mistakesRef.current + 1;
        mistakesRef.current = nextMistakes;
        setMistakes(nextMistakes);
        if (onMistakeRef.current) {
          onMistakeRef.current(nextMistakes);
        }
      },
      onCorrectStroke: (strokeData) => {
        setCurrentStroke(strokeData.strokeNum + 1);
      },
      onComplete: () => {
        setIsCompleted(true);
        if (onQuizCompleteRef.current) {
          onQuizCompleteRef.current(mistakesRef.current);
        }
      },
    });
  };

  useEffect(() => {
    if (!containerRef.current || !character) return;
    containerRef.current.innerHTML = '';

    const writer = HanziWriter.create(containerRef.current, character, {
      width: size,
      height: size,
      padding: 20,
      showOutline,
      strokeColor: '#2c3e50',
      outlineColor: '#e2e8f0',
      highlightColor: '#f39c12',
      drawingColor: '#c0392b',
      drawingWidth: 16,
      showHintAfterMisses: 3,
      onLoadCharDataSuccess: (data) => {
        if (data && data.strokes) {
          setTotalStrokes(data.strokes.length);
        }
        startQuiz(writer);
      },
    });

    writerRef.current = writer;

    return () => {
      writerRef.current = null;
    };
  }, [character, size, showOutline]);

  const handleHint = () => {
    if (writerRef.current && !isCompleted) {
      writerRef.current.highlightStroke(currentStroke);
    }
  };

  const handleRetry = () => {
    startQuiz();
  };

  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      {/* Canvas Box */}
      <div
        className="relative shadow-md rounded-lg overflow-hidden bg-chinese-paper"
        style={{ width: size, height: size }}
      >
        <div className="absolute inset-0 pointer-events-none">
          <CharacterGrid size={size} gridType="mizige" />
        </div>
        <div
          ref={containerRef}
          className="absolute inset-0 cursor-crosshair"
          data-testid="guided-quiz-canvas"
        />

        {isCompleted && (
          <div className="absolute inset-0 bg-green-900/10 backdrop-blur-xs flex flex-col items-center justify-center p-4">
            <div className="bg-white px-4 py-3 rounded-xl shadow-lg border border-green-200 flex items-center gap-3 animate-bounce">
              <CheckCircle className="w-8 h-8 text-green-500" />
              <div>
                <div className="font-bold text-gray-900">Hoàn thành xuất sắc!</div>
                <div className="text-xs text-gray-500">Số lần viết sai nét: {mistakes}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Progress & Controls */}
      <div className="flex items-center justify-between w-full max-w-xs px-2 text-sm">
        <div className="flex items-center gap-1 text-gray-600">
          <span>Tiến độ:</span>
          <span className="font-bold text-chinese-ink">
            {currentStroke} / {totalStrokes}
          </span>
        </div>

        {mistakes > 0 && (
          <div className="flex items-center gap-1 text-amber-600 text-xs font-semibold">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Sai: {mistakes}</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleHint}
          disabled={isCompleted}
          className="flex items-center gap-1.5 px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-sm font-medium transition disabled:opacity-50"
        >
          <HelpCircle className="w-4 h-4 text-amber-600" />
          <span>Gợi ý nét</span>
        </button>

        <button
          type="button"
          onClick={handleRetry}
          className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition"
        >
          <RotateCcw className="w-4 h-4 text-gray-500" />
          <span>Làm lại</span>
        </button>
      </div>
    </div>
  );
};

export default GuidedQuiz;

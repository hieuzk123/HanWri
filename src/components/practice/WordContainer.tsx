import React, { useState } from 'react';
import type { Word } from '../../types';
import StrokeAnimator from './StrokeAnimator';

export interface WordContainerProps {
  word: Pick<Word, 'hanzi'> & Partial<Pick<Word, 'pinyin' | 'meaning' | 'sinoVietnamese'>>;
  size?: number;
  mode?: 'animation' | 'guided' | 'freehand';
  onWordComplete?: () => void;
  children?: (currentChar: string, index: number) => React.ReactNode;
}

export const WordContainer: React.FC<WordContainerProps> = ({
  word,
  size = 320,
  onWordComplete,
  children,
}) => {
  const characters = Array.from(word?.hanzi || '');
  const [prevHanzi, setPrevHanzi] = useState(word?.hanzi);
  const [activeIndex, setActiveIndex] = useState(0);

  if (word?.hanzi !== prevHanzi) {
    setPrevHanzi(word?.hanzi);
    setActiveIndex(0);
  }

  const activeChar = characters[activeIndex] || '';

  return (
    <div className="flex flex-col items-center w-full max-w-xl mx-auto">
      {/* Pronunciation & Meaning Header */}
      <div className="text-center mb-4">
        {word?.pinyin && (
          <div className="text-xl font-medium text-chinese-red tracking-wide">{word.pinyin}</div>
        )}
        <div className="flex items-center justify-center gap-2 mt-1">
          {word?.sinoVietnamese && (
            <span className="text-xs uppercase tracking-wider bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded">
              {word.sinoVietnamese}
            </span>
          )}
          {word?.meaning && <span className="text-base text-gray-700 font-normal">{word.meaning}</span>}
        </div>
      </div>

      {/* Character Selector for multi-character words */}
      {characters.length > 1 && (
        <div className="flex gap-2 mb-4">
          {characters.map((char, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveIndex(idx)}
              className={`w-12 h-12 text-2xl font-bold rounded-lg border-2 transition ${
                idx === activeIndex
                  ? 'border-chinese-red bg-red-50 text-chinese-red shadow'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
              }`}
            >
              {char}
            </button>
          ))}
        </div>
      )}

      {/* Main Practice / Render Slot */}
      <div className="mt-2">
        {children ? (
          children(activeChar, activeIndex)
        ) : (
          <StrokeAnimator
            character={activeChar}
            size={size}
            onComplete={() => {
              if (activeIndex === characters.length - 1) {
                onWordComplete?.();
              }
            }}
          />
        )}
      </div>
    </div>
  );
};

export default WordContainer;

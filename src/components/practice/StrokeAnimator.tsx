import React, { useEffect, useRef, useState } from 'react';
import HanziWriter from 'hanzi-writer';
import { Play, Pause, RotateCcw, Gauge } from 'lucide-react';
import CharacterGrid from '../grid/CharacterGrid';

export interface StrokeAnimatorProps {
  character: string;
  size?: number;
  speed?: number;
  onComplete?: () => void;
  className?: string;
}

export const StrokeAnimator: React.FC<StrokeAnimatorProps> = ({
  character,
  size = 300,
  speed: initialSpeed = 1,
  onComplete,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const writerRef = useRef<HanziWriter | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [prevInitialSpeed, setPrevInitialSpeed] = useState(initialSpeed);
  const [speed, setSpeed] = useState<number>(initialSpeed);
  const [, setTotalStrokes] = useState<number>(0);
  const [, setCurrentStroke] = useState<number>(0);

  if (initialSpeed !== prevInitialSpeed) {
    setPrevInitialSpeed(initialSpeed);
    setSpeed(initialSpeed);
  }

  const speedRef = useRef(speed);
  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  useEffect(() => {
    if (!containerRef.current || !character) return;

    containerRef.current.innerHTML = '';
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentStroke(0);

    const currentSpeed = speedRef.current;
    const writer = HanziWriter.create(containerRef.current, character, {
      width: size,
      height: size,
      padding: 20,
      showOutline: true,
      strokeColor: '#2c3e50',
      outlineColor: '#cbd5e1',
      radicalColor: '#c0392b',
      strokeAnimationSpeed: currentSpeed,
      delayBetweenStrokes: 250 / currentSpeed,
      onLoadCharDataSuccess: (data) => {
        if (data && data.strokes) {
          setTotalStrokes(data.strokes.length);
        }
      },
    });

    writerRef.current = writer;

    return () => {
      writerRef.current = null;
    };
  }, [character, size]);

  const handlePlay = () => {
    if (!writerRef.current) return;
    setIsPlaying(true);
    if (isPaused && typeof writerRef.current.resumeAnimation === 'function') {
      setIsPaused(false);
      writerRef.current.resumeAnimation();
    } else {
      setIsPaused(false);
      writerRef.current.animateCharacter({
        onComplete: () => {
          setIsPlaying(false);
          setIsPaused(false);
          if (onComplete) onComplete();
        },
      });
    }
  };

  const handlePause = () => {
    if (!writerRef.current) return;
    if (typeof writerRef.current.pauseAnimation === 'function') {
      writerRef.current.pauseAnimation();
    }
    setIsPlaying(false);
    setIsPaused(true);
  };

  const handleReset = () => {
    if (!writerRef.current) return;
    if (typeof writerRef.current.pauseAnimation === 'function') {
      writerRef.current.pauseAnimation();
    }
    if (typeof writerRef.current.hideCharacter === 'function') {
      writerRef.current.hideCharacter();
    }
    if (typeof writerRef.current.showOutline === 'function') {
      writerRef.current.showOutline();
    }
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentStroke(0);
  };

  const handleCycleSpeed = () => {
    const nextSpeed = speed === 1 ? 1.5 : speed === 1.5 ? 2 : speed === 2 ? 0.5 : 1;
    setSpeed(nextSpeed);
    if (writerRef.current) {
      const writer = writerRef.current as unknown as {
        _options?: {
          strokeAnimationSpeed: number;
          delayBetweenStrokes: number;
        };
      };
      if (writer._options) {
        writer._options.strokeAnimationSpeed = nextSpeed;
        writer._options.delayBetweenStrokes = 250 / nextSpeed;
      }
    }
  };

  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      <div
        className="relative shadow-md rounded-lg overflow-hidden bg-chinese-paper"
        style={{ width: size, height: size }}
      >
        <div className="absolute inset-0 pointer-events-none">
          <CharacterGrid size={size} gridType="mizige" />
        </div>
        <div ref={containerRef} className="absolute inset-0" data-testid="hanzi-writer-canvas" />
      </div>

      <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow border border-gray-200">
        <button
          type="button"
          onClick={isPlaying ? handlePause : handlePlay}
          className="p-2 text-chinese-red hover:bg-red-50 rounded-full transition"
          title={isPlaying ? 'Tạm dừng' : 'Xem hoạt ảnh'}
          aria-label={isPlaying ? 'Tạm dừng' : 'Xem hoạt ảnh'}
        >
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
        </button>

        <button
          type="button"
          onClick={handleReset}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition"
          title="Vẽ lại từ đầu"
          aria-label="Vẽ lại từ đầu"
        >
          <RotateCcw className="w-5 h-5" />
        </button>

        <div className="h-5 w-px bg-gray-200 mx-1" />

        <button
          type="button"
          onClick={handleCycleSpeed}
          className="flex items-center gap-1 px-3 py-1 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-full transition"
          title="Tốc độ"
          aria-label="Tốc độ"
        >
          <Gauge className="w-4 h-4 text-chinese-red" />
          <span>{speed}x</span>
        </button>
      </div>
    </div>
  );
};

export default StrokeAnimator;

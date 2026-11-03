import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Undo2, Trash2, Check } from 'lucide-react';
import CharacterGrid from '../grid/CharacterGrid';

export type InkStroke = [number[], number[], number[]]; // [x_coords, y_coords, timestamps]

export interface FreehandCanvasProps {
  size?: number;
  onCheck: (inkData: InkStroke[], width: number, height: number) => void;
  onStrokesChange?: (inkData: InkStroke[]) => void;
  onClear?: () => void;
  isLoading?: boolean;
  className?: string;
}

export const FreehandCanvas: React.FC<FreehandCanvasProps> = ({
  size = 320,
  onCheck,
  onStrokesChange,
  onClear,
  isLoading = false,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [strokes, setStrokes] = useState<InkStroke[]>([]);
  const currentStrokeRef = useRef<{ x: number[]; y: number[]; t: number[] }>({
    x: [],
    y: [],
    t: [],
  });

  const redrawAllStrokes = useCallback(
    (strokesToDraw: InkStroke[]) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, size, size);

      strokesToDraw.forEach(([xs, ys]) => {
        if (xs.length === 0) return;
        ctx.beginPath();
        ctx.strokeStyle = '#2c3e50';
        ctx.lineWidth = 14;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.moveTo(xs[0], ys[0]);
        if (xs.length === 1) {
          ctx.lineTo(xs[0], ys[0]);
        } else {
          for (let i = 1; i < xs.length; i++) {
            ctx.lineTo(xs[i], ys[i]);
          }
        }
        ctx.stroke();
      });
    },
    [size]
  );

  useEffect(() => {
    redrawAllStrokes(strokes);
  }, [redrawAllStrokes, strokes]);

  const getCoordinates = (
    e: React.PointerEvent<HTMLCanvasElement> | PointerEvent | MouseEvent
  ): { x: number; y: number } => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = rect.width > 0 ? canvas.width / rect.width : 1;
    const scaleY = rect.height > 0 ? canvas.height / rect.height : 1;
    const clientX = 'clientX' in e ? e.clientX : 0;
    const clientY = 'clientY' in e ? e.clientY : 0;
    return {
      x: Math.round((clientX - rect.left) * scaleX),
      y: Math.round((clientY - rect.top) * scaleY),
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isLoading) return;
    if (e.currentTarget.setPointerCapture) {
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        // In environments like JSDOM or if pointerId invalid
      }
    }
    setIsDrawing(true);
    const { x, y } = getCoordinates(e);
    const now = Date.now();
    currentStrokeRef.current = { x: [x], y: [y], t: [now] };

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.beginPath();
    ctx.strokeStyle = '#2c3e50';
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.moveTo(x, y);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || isLoading) return;
    const { x, y } = getCoordinates(e);
    const now = Date.now();
    currentStrokeRef.current.x.push(x);
    currentStrokeRef.current.y.push(y);
    currentStrokeRef.current.t.push(now);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (e.currentTarget.releasePointerCapture) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        // In environments like JSDOM or if pointerId invalid
      }
    }

    const stroke = currentStrokeRef.current;
    if (stroke.x.length > 0) {
      const newStroke: InkStroke = [stroke.x, stroke.y, stroke.t];
      const updated = [...strokes, newStroke];
      setStrokes(updated);
      onStrokesChange?.(updated);
      redrawAllStrokes(updated);
    }
    currentStrokeRef.current = { x: [], y: [], t: [] };
  };

  const handlePointerCancel = (e: React.PointerEvent<HTMLCanvasElement>) => {
    handlePointerUp(e);
  };

  const handleUndo = () => {
    if (strokes.length === 0 || isLoading) return;
    const updated = strokes.slice(0, -1);
    setStrokes(updated);
    onStrokesChange?.(updated);
    redrawAllStrokes(updated);
  };

  const handleClear = () => {
    if (strokes.length === 0 || isLoading) return;
    setStrokes([]);
    onStrokesChange?.([]);
    onClear?.();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.clearRect(0, 0, size, size);
  };

  const handleTriggerCheck = () => {
    if (strokes.length === 0 || isLoading) return;
    onCheck(strokes, size, size);
  };

  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      {/* Canvas Area */}
      <div
        className="relative shadow-md rounded-lg overflow-hidden bg-chinese-paper"
        style={{ width: size, height: size }}
      >
        <div className="absolute inset-0 pointer-events-none">
          <CharacterGrid size={size} gridType="mizige" />
        </div>
        <canvas
          ref={canvasRef}
          width={size}
          height={size}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
          className="absolute inset-0 cursor-crosshair touch-none"
        />
      </div>

      {/* Control Buttons */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleUndo}
          disabled={strokes.length === 0 || isLoading}
          className="flex items-center gap-1 px-3 py-2 bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-lg text-sm font-medium transition disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
          aria-label="Xóa nét"
        >
          <Undo2 className="w-4 h-4" />
          <span>Xóa nét</span>
        </button>

        <button
          type="button"
          onClick={handleClear}
          disabled={strokes.length === 0 || isLoading}
          className="flex items-center gap-1 px-3 py-2 bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-lg text-sm font-medium transition disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
          aria-label="Xóa hết"
        >
          <Trash2 className="w-4 h-4 text-gray-500" />
          <span>Xóa hết</span>
        </button>

        <button
          type="button"
          onClick={handleTriggerCheck}
          disabled={strokes.length === 0 || isLoading}
          className="flex items-center gap-1.5 px-5 py-2 bg-chinese-red hover:bg-chinese-crimson text-white rounded-lg text-sm font-bold shadow transition disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
          aria-label="Kiểm tra"
        >
          <Check className="w-4 h-4" />
          <span>{isLoading ? 'Đang nhận diện...' : 'Kiểm tra'}</span>
        </button>
      </div>
    </div>
  );
};

export default FreehandCanvas;

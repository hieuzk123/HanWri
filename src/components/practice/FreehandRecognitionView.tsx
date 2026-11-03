import React, { useState } from 'react';
import FreehandCanvas, { type InkStroke } from './FreehandCanvas';
import { recognizeHandwriting } from '../../services/handwritingApi';
import type { HandwritingRecognitionResult } from '../../types';
import { CheckCircle2, AlertCircle, Eye, Sparkles } from 'lucide-react';
import StrokeAnimator from './StrokeAnimator';

export interface FreehandRecognitionViewProps {
  character: string;
  size?: number;
  onSuccess?: () => void;
  className?: string;
}

export const FreehandRecognitionView: React.FC<FreehandRecognitionViewProps> = ({
  character,
  size = 320,
  onSuccess,
  className = '',
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<HandwritingRecognitionResult | null>(null);
  const [showModelOverlay, setShowModelOverlay] = useState(false);

  const handleCheck = async (ink: InkStroke[], width: number, height: number) => {
    setIsLoading(true);
    setResult(null);

    const res = await recognizeHandwriting(ink, width, height, character);
    setResult(res);
    setIsLoading(false);

    if (res.matchedRank >= 1 && res.matchedRank <= 3 && onSuccess) {
      onSuccess();
    }
  };

  const handleClear = () => {
    setResult(null);
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <FreehandCanvas
        size={size}
        onCheck={handleCheck}
        onClear={handleClear}
        isLoading={isLoading}
      />

      {/* Recognition Evaluation Alert */}
      {result && (
        <div className="mt-4 w-full max-w-sm">
          {result.matchedRank === 1 && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3 text-green-900">
              <Sparkles className="w-6 h-6 text-green-600 flex-shrink-0" />
              <div>
                <div className="font-bold">Tuyệt vời! Viết rất chuẩn xác</div>
                <div className="text-xs text-green-700">Chữ mục tiêu là ứng viên số 1</div>
              </div>
            </div>
          )}

          {result.matchedRank > 1 && result.matchedRank <= 3 && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-3 text-blue-900">
              <CheckCircle2 className="w-6 h-6 text-blue-600 flex-shrink-0" />
              <div>
                <div className="font-bold">Chính xác! (Xếp hạng #{result.matchedRank})</div>
                <div className="text-xs text-blue-700">Chữ được nhận diện rất tốt</div>
              </div>
            </div>
          )}

          {result.matchedRank > 3 && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-3 text-amber-900">
              <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0" />
              <div>
                <div className="font-bold">Gần đúng (Xếp hạng #{result.matchedRank})</div>
                <div className="text-xs text-amber-700">Hãy nắn nót lại nét cho vuông vắn hơn</div>
              </div>
            </div>
          )}

          {result.matchedRank === -1 && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-900">
              <div className="flex items-center gap-2 font-bold mb-1">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <span>Chưa nhận diện đúng</span>
              </div>
              <div className="text-xs text-red-700 mb-2">
                Các chữ nhận diện được: {result.candidates.slice(0, 5).join('、 ') || 'Không rõ'}
              </div>
              <button
                type="button"
                onClick={() => setShowModelOverlay(true)}
                className="text-xs font-semibold underline flex items-center gap-1 text-chinese-red cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Xem mẫu viết chuẩn</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Model Overlay Modal */}
      {showModelOverlay && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl flex flex-col items-center">
            <h3 className="font-bold text-lg mb-3">Mẫu chuẩn chữ「{character}」</h3>
            <StrokeAnimator character={character} size={260} />
            <button
              type="button"
              onClick={() => setShowModelOverlay(false)}
              className="mt-4 px-6 py-2 bg-gray-200 hover:bg-gray-300 font-semibold text-gray-800 rounded-lg text-sm cursor-pointer transition"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FreehandRecognitionView;

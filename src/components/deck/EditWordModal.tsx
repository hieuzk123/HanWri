import React, { useState } from 'react';
import { X, Pencil } from 'lucide-react';
import type { Word } from '../../types';

export interface EditWordModalProps {
  isOpen: boolean;
  word: Word | null;
  onClose: () => void;
  onUpdateWord: (
    wordId: number,
    wordData: {
      hanzi: string;
      pinyin?: string;
      sinoVietnamese?: string;
      meaning?: string;
      notes?: string;
    }
  ) => void | Promise<void>;
}

export const EditWordModal: React.FC<EditWordModalProps> = ({
  isOpen,
  word,
  onClose,
  onUpdateWord,
}) => {
  const [hanzi, setHanzi] = useState(word?.hanzi || '');
  const [pinyin, setPinyin] = useState(word?.pinyin || '');
  const [sinoVietnamese, setSinoVietnamese] = useState(word?.sinoVietnamese || '');
  const [meaning, setMeaning] = useState(word?.meaning || '');
  const [notes, setNotes] = useState(word?.notes || '');
  const [error, setError] = useState('');

  if (!isOpen || !word) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedHanzi = hanzi.trim();

    if (!trimmedHanzi) {
      setError('Vui lòng nhập chữ Hán');
      return;
    }

    if (word.id) {
      onUpdateWord(word.id, {
        hanzi: trimmedHanzi,
        pinyin: pinyin.trim() || undefined,
        sinoVietnamese: sinoVietnamese.trim() || undefined,
        meaning: meaning.trim() || undefined,
        notes: notes.trim() || undefined,
      });
    }

    setError('');
    onClose();
  };

  const handleCancel = () => {
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Pencil className="w-5 h-5 text-chinese-red" />
            <h3 className="font-bold text-gray-900 text-lg">Chỉnh sửa từ vựng</h3>
          </div>
          <button
            onClick={handleCancel}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition cursor-pointer"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 font-medium">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="edit-hanzi-input" className="block text-xs font-semibold text-gray-700 mb-1">
              Chữ Hán <span className="text-chinese-red">*</span>
            </label>
            <input
              id="edit-hanzi-input"
              type="text"
              value={hanzi}
              onChange={(e) => {
                setHanzi(e.target.value);
                if (error) setError('');
              }}
              placeholder="VD: 你好, 学"
              className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-chinese-red/20 focus:border-chinese-red transition"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="edit-pinyin-input" className="block text-xs font-semibold text-gray-700 mb-1">
                Phiên âm (Pinyin)
              </label>
              <input
                id="edit-pinyin-input"
                type="text"
                value={pinyin}
                onChange={(e) => setPinyin(e.target.value)}
                placeholder="VD: nǐ hǎo"
                className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-chinese-red/20 focus:border-chinese-red transition"
              />
            </div>

            <div>
              <label htmlFor="edit-sino-viet-input" className="block text-xs font-semibold text-gray-700 mb-1">
                Âm Hán Việt
              </label>
              <input
                id="edit-sino-viet-input"
                type="text"
                value={sinoVietnamese}
                onChange={(e) => setSinoVietnamese(e.target.value)}
                placeholder="VD: nhĩ hảo"
                className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-chinese-red/20 focus:border-chinese-red transition"
              />
            </div>
          </div>

          <div>
            <label htmlFor="edit-meaning-input" className="block text-xs font-semibold text-gray-700 mb-1">
              Ý nghĩa
            </label>
            <input
              id="edit-meaning-input"
              type="text"
              value={meaning}
              onChange={(e) => setMeaning(e.target.value)}
              placeholder="VD: Xin chào"
              className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-chinese-red/20 focus:border-chinese-red transition"
            />
          </div>

          <div>
            <label htmlFor="edit-notes-input" className="block text-xs font-semibold text-gray-700 mb-1">
              Ghi chú
            </label>
            <textarea
              id="edit-notes-input"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="VD: Dùng khi chào hỏi thông thường..."
              rows={2}
              className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-chinese-red/20 focus:border-chinese-red transition resize-none"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg text-sm font-semibold transition cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-chinese-red hover:bg-chinese-crimson text-white rounded-lg text-sm font-semibold transition shadow cursor-pointer"
            >
              Lưu thay đổi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditWordModal;

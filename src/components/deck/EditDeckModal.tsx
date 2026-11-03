import React, { useState } from 'react';
import { X, Pencil } from 'lucide-react';
import type { Deck } from '../../types';

export interface EditDeckModalProps {
  isOpen: boolean;
  deck: Deck | null;
  onClose: () => void;
  onUpdateDeck: (
    deckId: number,
    deckData: { title: string; description: string }
  ) => void | Promise<void>;
}

export const EditDeckModal: React.FC<EditDeckModalProps> = ({
  isOpen,
  deck,
  onClose,
  onUpdateDeck,
}) => {
  const [title, setTitle] = useState(deck?.title || '');
  const [description, setDescription] = useState(deck?.description || '');
  const [error, setError] = useState('');

  if (!isOpen || !deck) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      setError('Vui lòng nhập tên bộ từ');
      return;
    }

    if (deck.id) {
      onUpdateDeck(deck.id, {
        title: trimmedTitle,
        description: description.trim(),
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
            <h3 className="font-bold text-gray-900 text-lg">Chỉnh sửa bộ từ</h3>
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
            <label htmlFor="edit-deck-title-input" className="block text-xs font-semibold text-gray-700 mb-1">
              Tên bộ từ <span className="text-chinese-red">*</span>
            </label>
            <input
              id="edit-deck-title-input"
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError('');
              }}
              placeholder="VD: HSK 2 Căn bản..."
              className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-chinese-red/20 focus:border-chinese-red transition"
              autoFocus
            />
          </div>

          <div>
            <label htmlFor="edit-deck-desc-input" className="block text-xs font-semibold text-gray-700 mb-1">
              Mô tả
            </label>
            <textarea
              id="edit-deck-desc-input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="VD: Mô tả bộ từ..."
              rows={3}
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

export default EditDeckModal;

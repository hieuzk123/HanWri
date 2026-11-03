import React from 'react';
import type { Deck } from '../../types';
import { BookOpen, Plus, FileSpreadsheet, ChevronRight, Inbox } from 'lucide-react';

export interface DeckListProps {
  decks: Deck[];
  onSelectDeck: (deck: Deck) => void;
  onOpenCreateModal: () => void;
  onOpenImportModal: () => void;
}

export const DeckList: React.FC<DeckListProps> = ({
  decks,
  onSelectDeck,
  onOpenCreateModal,
  onOpenImportModal,
}) => {
  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Bộ từ vựng của bạn</h2>
          <p className="text-sm text-gray-500">Chọn hoặc tạo bộ từ để bắt đầu luyện viết chữ Hán</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenImportModal}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-sm font-semibold transition shadow-xs cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Nhập Excel / CSV</span>
          </button>

          <button
            onClick={onOpenCreateModal}
            className="flex items-center gap-1.5 px-4 py-2 bg-chinese-red hover:bg-chinese-crimson text-white rounded-lg text-sm font-semibold transition shadow cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo bộ từ mới</span>
          </button>
        </div>
      </div>

      {/* List of Decks or Empty State */}
      {decks.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-red-50 text-chinese-red flex items-center justify-center mb-4">
            <Inbox className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-1">Chưa có bộ từ nào</h3>
          <p className="text-sm text-gray-500 max-w-sm mb-6">
            Hãy tạo bộ từ mới hoặc nhập từ file Excel / CSV để bắt đầu luyện viết chữ Hán!
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenCreateModal}
              className="px-4 py-2 bg-chinese-red hover:bg-chinese-crimson text-white rounded-lg text-sm font-semibold transition shadow cursor-pointer"
            >
              Tạo bộ từ đầu tiên
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {decks.map((deck) => (
            <div
              key={deck.id}
              onClick={() => onSelectDeck(deck)}
              className="group p-5 bg-white rounded-xl border border-gray-200 hover:border-chinese-red/40 hover:shadow-md transition cursor-pointer flex items-center justify-between"
            >
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-lg bg-red-50 text-chinese-red flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900 group-hover:text-chinese-red transition">
                    {deck.title}
                  </h3>
                  <p className="text-xs text-gray-500 line-clamp-1 mb-2">
                    {deck.description || 'Chưa có mô tả'}
                  </p>
                  <span className="text-xs font-semibold px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full">
                    {deck.wordCount || 0} từ
                  </span>
                </div>
              </div>

              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-chinese-red group-hover:translate-x-1 transition" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DeckList;

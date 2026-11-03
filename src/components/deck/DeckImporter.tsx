import React, { useState } from 'react';
import { Upload, Download, FileSpreadsheet, X, CheckCircle, Loader2 } from 'lucide-react';
import { parseSpreadsheetFile, downloadSampleExcelTemplate } from '../../services/fileImportService';
import type { Word } from '../../types';

export interface DeckImporterProps {
  isOpen?: boolean;
  onImportSuccess?: (deckTitle: string, words: Omit<Word, 'id' | 'deckId'>[]) => void;
  onClose?: () => void;
  onImportComplete?: (deckTitle: string, words: Omit<Word, 'id' | 'deckId'>[]) => void;
  onCancel?: () => void;
}

export const DeckImporter: React.FC<DeckImporterProps> = ({
  isOpen = true,
  onImportSuccess,
  onClose,
  onImportComplete,
  onCancel,
}) => {
  const [deckTitle, setDeckTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [parsedWords, setParsedWords] = useState<Omit<Word, 'id' | 'deckId'>[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleProcessFile = async (selectedFile: File) => {
    setFile(selectedFile);
    setError(null);
    setIsProcessing(true);

    try {
      const words = await parseSpreadsheetFile(selectedFile);
      if (words.length === 0) {
        setParsedWords([]);
        setError('Không tìm thấy từ vựng hợp lệ trong file. Vui lòng tải file mẫu để kiểm tra định dạng.');
      } else {
        setParsedWords(words);
        if (!deckTitle.trim()) {
          // Default deck title from file name without extension
          setDeckTitle(selectedFile.name.replace(/\.[^/.]+$/, ''));
        }
      }
    } catch (err: any) {
      setParsedWords([]);
      setError('Lỗi khi đọc file: ' + (err?.message || 'Định dạng file không hỗ trợ'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    await handleProcessFile(selected);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      await handleProcessFile(droppedFile);
    }
  };

  const handleConfirm = () => {
    const trimmedTitle = deckTitle.trim();
    if (!trimmedTitle) {
      setError('Vui lòng nhập tên cho bộ từ.');
      return;
    }
    if (parsedWords.length === 0) {
      setError('Không có từ vựng nào để nhập.');
      return;
    }

    onImportSuccess?.(trimmedTitle, parsedWords);
    onImportComplete?.(trimmedTitle, parsedWords);
  };

  const handleClose = () => {
    onClose?.();
    onCancel?.();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl relative border border-gray-100">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition cursor-pointer"
          aria-label="Đóng"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-bold text-gray-900 mb-1 flex items-center gap-2">
          <FileSpreadsheet className="w-6 h-6 text-emerald-600" />
          <span>Nhập bộ từ từ Excel hoặc CSV</span>
        </h3>
        <p className="text-xs text-gray-500 mb-4">Hỗ trợ file định dạng .xlsx, .xls và .csv</p>

        {/* Download Template Action */}
        <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl mb-4 border border-emerald-100">
          <div className="text-xs text-emerald-800 font-medium">Chưa có file mẫu chuẩn?</div>
          <button
            type="button"
            onClick={downloadSampleExcelTemplate}
            className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-900 bg-white hover:bg-emerald-50/50 px-3 py-1.5 rounded-lg shadow-xs border border-emerald-200 transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Tải file Excel mẫu</span>
          </button>
        </div>

        {/* Deck Title Input */}
        <div className="mb-4">
          <label htmlFor="import-deck-title" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
            Tên bộ từ mới <span className="text-chinese-red">*</span>
          </label>
          <input
            id="import-deck-title"
            type="text"
            value={deckTitle}
            onChange={(e) => {
              setDeckTitle(e.target.value);
              if (error) setError(null);
            }}
            placeholder="Ví dụ: Từ vựng HSK 2 bài 1"
            className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-chinese-red/20 focus:border-chinese-red transition"
          />
        </div>

        {/* Drag & Drop or Select File Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-6 text-center mb-4 transition cursor-pointer ${
            isDragging
              ? 'border-chinese-red bg-red-50/40 scale-[1.01]'
              : 'border-gray-300 hover:border-chinese-red hover:bg-gray-50/50'
          }`}
        >
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileChange}
            id="file-upload"
            className="hidden"
          />
          <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
            {isProcessing ? (
              <Loader2 className="w-8 h-8 text-chinese-red animate-spin mb-2" />
            ) : (
              <Upload className={`w-8 h-8 mb-2 ${isDragging ? 'text-chinese-red' : 'text-gray-400'}`} />
            )}
            <span className="text-sm font-semibold text-gray-700">
              {file ? file.name : 'Bấm để chọn file Excel / CSV'}
            </span>
            <span className="text-xs text-gray-400 mt-1">.xlsx, .xls, .csv (hoặc kéo thả file vào đây)</span>
          </label>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg mb-4 font-medium animate-in fade-in">
            {error}
          </div>
        )}

        {/* Extracted word count preview */}
        {parsedWords.length > 0 && !error && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg mb-4 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>
              Đã trích xuất thành công <b>{parsedWords.length}</b> từ vựng!
            </span>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-sm text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition cursor-pointer"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={parsedWords.length === 0 || isProcessing}
            className="px-5 py-2 bg-chinese-red hover:bg-chinese-crimson text-white text-sm font-bold rounded-lg shadow-sm transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            Xác nhận nhập
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeckImporter;

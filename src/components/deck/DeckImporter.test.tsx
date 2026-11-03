import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DeckImporter } from './DeckImporter';
import * as fileImportService from '../../services/fileImportService';

vi.mock('../../services/fileImportService', () => ({
  parseSpreadsheetFile: vi.fn(),
  downloadSampleExcelTemplate: vi.fn(),
  generateSampleExcelTemplate: vi.fn(),
}));

describe('DeckImporter Component', () => {
  const mockOnImportSuccess = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders modal dialog with necessary elements', () => {
    render(<DeckImporter onImportSuccess={mockOnImportSuccess} onClose={mockOnClose} />);

    expect(screen.getByText('Nhập bộ từ từ Excel hoặc CSV')).toBeInTheDocument();
    expect(screen.getByText('Tải file Excel mẫu')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Từ vựng HSK 2/i)).toBeInTheDocument();
    expect(screen.getByText(/Bấm để chọn file Excel \/ CSV/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Xác nhận nhập/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /Hủy/i })).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    const { container } = render(
      <DeckImporter
        isOpen={false}
        onImportSuccess={mockOnImportSuccess}
        onClose={mockOnClose}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('triggers downloadSampleExcelTemplate when clicking download template button', () => {
    render(<DeckImporter onImportSuccess={mockOnImportSuccess} onClose={mockOnClose} />);

    const downloadBtn = screen.getByRole('button', { name: /Tải file Excel mẫu/i });
    fireEvent.click(downloadBtn);

    expect(fileImportService.downloadSampleExcelTemplate).toHaveBeenCalledTimes(1);
  });

  it('parses selected file, sets default title from file name and displays word count', async () => {
    const mockWords = [
      { hanzi: '你好', pinyin: 'nǐ hǎo', meaning: 'Xin chào' },
      { hanzi: '再见', pinyin: 'zàijiàn', meaning: 'Tạm biệt' },
    ];
    vi.mocked(fileImportService.parseSpreadsheetFile).mockResolvedValueOnce(mockWords);

    render(<DeckImporter onImportSuccess={mockOnImportSuccess} onClose={mockOnClose} />);

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const testFile = new File(['dummy content'], 'TuVung_HSK1.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    fireEvent.change(fileInput, { target: { files: [testFile] } });

    await waitFor(() => {
      expect(fileImportService.parseSpreadsheetFile).toHaveBeenCalledWith(testFile);
    });

    expect(await screen.findByText(/Đã trích xuất thành công/i)).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByDisplayValue('TuVung_HSK1')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Xác nhận nhập/i })).toBeEnabled();
  });

  it('handles drag and drop file upload correctly', async () => {
    const mockWords = [{ hanzi: '朋友', pinyin: 'péngyǒu', meaning: 'Bạn bè' }];
    vi.mocked(fileImportService.parseSpreadsheetFile).mockResolvedValueOnce(mockWords);

    render(<DeckImporter onImportSuccess={mockOnImportSuccess} onClose={mockOnClose} />);

    const dropZone = screen.getByText(/Bấm để chọn file Excel \/ CSV/i).closest('div');
    expect(dropZone).toBeInTheDocument();

    const testFile = new File(['content'], 'friends.csv', { type: 'text/csv' });

    // Drag over
    fireEvent.dragOver(dropZone!, { dataTransfer: { files: [testFile] } });

    // Drop file
    fireEvent.drop(dropZone!, {
      dataTransfer: {
        files: [testFile],
      },
    });

    await waitFor(() => {
      expect(fileImportService.parseSpreadsheetFile).toHaveBeenCalledWith(testFile);
    });

    expect(await screen.findByText(/Đã trích xuất thành công/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue('friends')).toBeInTheDocument();
  });

  it('displays error when file has 0 valid words', async () => {
    vi.mocked(fileImportService.parseSpreadsheetFile).mockResolvedValueOnce([]);

    render(<DeckImporter onImportSuccess={mockOnImportSuccess} onClose={mockOnClose} />);

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const testFile = new File(['dummy'], 'empty.xlsx', { type: 'application/octet-stream' });

    fireEvent.change(fileInput, { target: { files: [testFile] } });

    expect(
      await screen.findByText(/Không tìm thấy từ vựng hợp lệ trong file/i)
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Xác nhận nhập/i })).toBeDisabled();
  });

  it('displays error when parseSpreadsheetFile rejects', async () => {
    vi.mocked(fileImportService.parseSpreadsheetFile).mockRejectedValueOnce(new Error('Corrupt file'));

    render(<DeckImporter onImportSuccess={mockOnImportSuccess} onClose={mockOnClose} />);

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const testFile = new File(['bad'], 'bad.xlsx', { type: 'application/octet-stream' });

    fireEvent.change(fileInput, { target: { files: [testFile] } });

    expect(
      await screen.findByText(/Lỗi khi đọc file: Corrupt file/i)
    ).toBeInTheDocument();
  });

  it('shows error if deck title is cleared and confirm is clicked', async () => {
    const mockWords = [{ hanzi: '水', pinyin: 'shuǐ', meaning: 'Nước' }];
    vi.mocked(fileImportService.parseSpreadsheetFile).mockResolvedValueOnce(mockWords);

    render(<DeckImporter onImportSuccess={mockOnImportSuccess} onClose={mockOnClose} />);

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const testFile = new File(['content'], 'water.xlsx', { type: 'application/octet-stream' });
    fireEvent.change(fileInput, { target: { files: [testFile] } });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Xác nhận nhập/i })).toBeEnabled();
    });

    const titleInput = screen.getByDisplayValue('water');
    fireEvent.change(titleInput, { target: { value: '   ' } });

    const confirmBtn = screen.getByRole('button', { name: /Xác nhận nhập/i });
    fireEvent.click(confirmBtn);

    expect(screen.getByText('Vui lòng nhập tên cho bộ từ.')).toBeInTheDocument();
    expect(mockOnImportSuccess).not.toHaveBeenCalled();
  });

  it('calls onImportSuccess and onImportComplete with deckTitle and words on successful confirm', async () => {
    const mockWords = [{ hanzi: '茶', pinyin: 'chá', meaning: 'Trà' }];
    vi.mocked(fileImportService.parseSpreadsheetFile).mockResolvedValueOnce(mockWords);
    const mockOnImportComplete = vi.fn();

    render(
      <DeckImporter
        onImportSuccess={mockOnImportSuccess}
        onImportComplete={mockOnImportComplete}
        onClose={mockOnClose}
      />
    );

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const testFile = new File(['content'], 'tea.xlsx', { type: 'application/octet-stream' });
    fireEvent.change(fileInput, { target: { files: [testFile] } });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Xác nhận nhập/i })).toBeEnabled();
    });

    const confirmBtn = screen.getByRole('button', { name: /Xác nhận nhập/i });
    fireEvent.click(confirmBtn);

    expect(mockOnImportSuccess).toHaveBeenCalledWith('tea', mockWords);
    expect(mockOnImportComplete).toHaveBeenCalledWith('tea', mockWords);
  });

  it('calls onClose and onCancel when close or cancel button is clicked', () => {
    const mockOnCancel = vi.fn();
    render(
      <DeckImporter
        onImportSuccess={mockOnImportSuccess}
        onClose={mockOnClose}
        onCancel={mockOnCancel}
      />
    );

    const cancelBtn = screen.getByRole('button', { name: /Hủy/i });
    fireEvent.click(cancelBtn);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
    expect(mockOnCancel).toHaveBeenCalledTimes(1);

    const closeIconBtn = screen.getByRole('button', { name: /Đóng/i });
    fireEvent.click(closeIconBtn);

    expect(mockOnClose).toHaveBeenCalledTimes(2);
    expect(mockOnCancel).toHaveBeenCalledTimes(2);
  });
});

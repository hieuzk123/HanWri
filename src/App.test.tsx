import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import 'fake-indexeddb/auto';
import App from './App';
import { db } from './db';

vi.mock('./components/practice/StrokeAnimator', () => ({
  default: ({ character }: { character: string }) => (
    <div data-testid="mock-stroke-animator">Animator: {character}</div>
  ),
  StrokeAnimator: ({ character }: { character: string }) => (
    <div data-testid="mock-stroke-animator">Animator: {character}</div>
  ),
}));

vi.mock('./components/practice/GuidedQuiz', () => ({
  default: ({ character }: { character: string }) => (
    <div data-testid="mock-guided-quiz">Quiz: {character}</div>
  ),
  GuidedQuiz: ({ character }: { character: string }) => (
    <div data-testid="mock-guided-quiz">Quiz: {character}</div>
  ),
}));

vi.mock('./components/practice/FreehandRecognitionView', () => ({
  default: ({ character }: { character: string }) => (
    <div data-testid="mock-freehand-view">Freehand: {character}</div>
  ),
  FreehandRecognitionView: ({ character }: { character: string }) => (
    <div data-testid="mock-freehand-view">Freehand: {character}</div>
  ),
}));

describe('App Full Integration', () => {
  beforeEach(async () => {
    await db.decks.clear();
    await db.words.clear();
  });

  it('renders HanWri header and quick practice search input', async () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: /HanWri/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Nhập từ hoặc chữ Hán muốn luyện/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Luyện ngay/i })).toBeInTheDocument();
  });

  it('initializes and renders default seeded decks', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText(/HSK 1 Căn bản/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/Bộ từ vựng của bạn/i)).toBeInTheDocument();
  });

  it('launches quick practice modal when typing a character and clicking Luyện ngay', async () => {
    render(<App />);
    const input = screen.getByPlaceholderText(/Nhập từ hoặc chữ Hán muốn luyện/i);
    const submitBtn = screen.getByRole('button', { name: /Luyện ngay/i });

    fireEvent.change(input, { target: { value: '爱' } });
    fireEvent.click(submitBtn);

    // Quick practice modal should open
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Luyện viết nhanh/i })).toBeInTheDocument();
    });

    // StrokeAnimator mock should be rendered for '爱'
    expect(screen.getByTestId('mock-stroke-animator')).toHaveTextContent('Animator: 爱');

    // Switch to Guided Quiz
    fireEvent.click(screen.getByRole('button', { name: /Đồ chữ theo thứ tự/i }));
    expect(screen.getByTestId('mock-guided-quiz')).toHaveTextContent('Quiz: 爱');

    // Switch to Freehand Recognition
    fireEvent.click(screen.getByRole('button', { name: /Khung viết & Nhận diện/i }));
    expect(screen.getByTestId('mock-freehand-view')).toHaveTextContent('Freehand: 爱');

    // Close quick practice modal
    const closeBtn = screen.getByLabelText(/Đóng luyện nhanh/i);
    fireEvent.click(closeBtn);

    expect(screen.queryByRole('heading', { name: /Luyện viết nhanh/i })).not.toBeInTheDocument();
  });

  it('launches quick practice when pressing Enter in quick practice input', async () => {
    render(<App />);
    const input = screen.getByPlaceholderText(/Nhập từ hoặc chữ Hán muốn luyện/i);

    fireEvent.change(input, { target: { value: '你好' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Luyện viết nhanh/i })).toBeInTheDocument();
    });

    // Multi-character word has tabs, active tab defaults to first char '你'
    expect(screen.getByTestId('mock-stroke-animator')).toHaveTextContent('Animator: 你');
  });

  it('opens CreateDeckModal and creates a new deck', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText(/HSK 1 Căn bản/i)).toBeInTheDocument();
    });

    // Click "Tạo bộ từ mới"
    const openCreateBtn = screen.getByRole('button', { name: /Tạo bộ từ mới/i });
    fireEvent.click(openCreateBtn);

    expect(screen.getByRole('heading', { name: 'Tạo bộ từ mới' })).toBeInTheDocument();

    const titleInput = screen.getByLabelText(/Tên bộ từ/i);
    const descInput = screen.getByLabelText(/Mô tả/i);
    const submitBtn = screen.getByRole('button', { name: 'Tạo bộ từ' });

    fireEvent.change(titleInput, { target: { value: 'HSK 2 Nâng cao' } });
    fireEvent.change(descInput, { target: { value: 'Từ vựng mở rộng HSK 2' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('HSK 2 Nâng cao')).toBeInTheDocument();
    });
  });

  it('opens and closes DeckImporter modal', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText(/HSK 1 Căn bản/i)).toBeInTheDocument();
    });

    const openImportBtn = screen.getByRole('button', { name: /Nhập Excel \/ CSV/i });
    fireEvent.click(openImportBtn);

    expect(screen.getByRole('heading', { name: /Nhập bộ từ từ Excel hoặc CSV/i })).toBeInTheDocument();

    const cancelBtn = screen.getByRole('button', { name: /Hủy/i });
    fireEvent.click(cancelBtn);

    expect(screen.queryByRole('heading', { name: /Nhập bộ từ từ Excel hoặc CSV/i })).not.toBeInTheDocument();
  });

  it('navigates to DeckDetail, adds a word, and navigates back to DeckList', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText(/HSK 1 Căn bản/i)).toBeInTheDocument();
    });

    // Click on HSK 1 deck card
    fireEvent.click(screen.getByText('HSK 1 Căn bản'));

    // Should now be in DeckDetail
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Quay lại bộ từ/i })).toBeInTheDocument();
    });
    expect(screen.getByText('Danh sách từ trong bộ')).toBeInTheDocument();
    expect(screen.getByText('你好')).toBeInTheDocument();

    // Click "Thêm từ"
    fireEvent.click(screen.getByRole('button', { name: /Thêm từ/i }));

    // AddWordModal should open
    expect(screen.getByRole('heading', { name: 'Thêm từ mới vào bộ' })).toBeInTheDocument();

    const hanziInput = screen.getByLabelText(/Chữ Hán/i);
    const pinyinInput = screen.getByLabelText(/Phiên âm/i);
    const meaningInput = screen.getByLabelText(/Ý nghĩa/i);
    const submitBtn = screen.getByRole('button', { name: 'Lưu từ vựng' });

    fireEvent.change(hanziInput, { target: { value: '猫' } });
    fireEvent.change(pinyinInput, { target: { value: 'māo' } });
    fireEvent.change(meaningInput, { target: { value: 'con mèo' } });
    fireEvent.click(submitBtn);

    // Modal closes, new word appears
    await waitFor(() => {
      expect(screen.getByText('猫')).toBeInTheDocument();
      expect(screen.getByText('māo')).toBeInTheDocument();
      expect(screen.getByText('con mèo')).toBeInTheDocument();
    });

    // Navigate back to DeckList
    fireEvent.click(screen.getByRole('button', { name: /Quay lại bộ từ/i }));

    await waitFor(() => {
      expect(screen.getByText(/Bộ từ vựng của bạn/i)).toBeInTheDocument();
    });
  });

  it('prompts confirmation before deleting a word and deletes it when confirmed', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText(/HSK 1 Căn bản/i)).toBeInTheDocument();
    });

    // Open DeckDetail
    fireEvent.click(screen.getByText('HSK 1 Căn bản'));
    await waitFor(() => {
      expect(screen.getByText('你好')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByTitle('Xóa từ');
    expect(deleteButtons.length).toBeGreaterThan(0);

    // Click delete on the first word
    fireEvent.click(deleteButtons[0]);

    // Confirmation dialog should be visible
    await waitFor(() => {
      expect(screen.getByText(/Xác nhận xóa từ/i)).toBeInTheDocument();
      expect(screen.getByText(/Bạn có chắc chắn muốn xóa từ vựng này không/i)).toBeInTheDocument();
    });

    // Cancel first
    fireEvent.click(screen.getByRole('button', { name: /Hủy bỏ/i }));
    expect(screen.queryByText(/Xác nhận xóa từ/i)).not.toBeInTheDocument();
    expect(screen.getByText('你好')).toBeInTheDocument();

    // Click delete again and confirm
    fireEvent.click(deleteButtons[0]);
    await waitFor(() => {
      expect(screen.getByText(/Xác nhận xóa từ/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Xác nhận xóa/i }));

    // Confirmation modal closes and word is removed
    await waitFor(() => {
      expect(screen.queryByText(/Xác nhận xóa từ/i)).not.toBeInTheDocument();
    });
  });
});

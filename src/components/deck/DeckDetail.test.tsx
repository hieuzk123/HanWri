import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import DeckDetail from './DeckDetail';
import type { Deck, Word } from '../../types';

vi.mock('../practice/StrokeAnimator', () => ({
  default: ({ character }: { character: string }) => (
    <div data-testid="mock-stroke-animator">Animator: {character}</div>
  ),
  StrokeAnimator: ({ character }: { character: string }) => (
    <div data-testid="mock-stroke-animator">Animator: {character}</div>
  ),
}));

vi.mock('../practice/GuidedQuiz', () => ({
  default: ({ character }: { character: string }) => (
    <div data-testid="mock-guided-quiz">Quiz: {character}</div>
  ),
  GuidedQuiz: ({ character }: { character: string }) => (
    <div data-testid="mock-guided-quiz">Quiz: {character}</div>
  ),
}));

vi.mock('../practice/FreehandRecognitionView', () => ({
  default: ({ character }: { character: string }) => (
    <div data-testid="mock-freehand-view">Freehand: {character}</div>
  ),
  FreehandRecognitionView: ({ character }: { character: string }) => (
    <div data-testid="mock-freehand-view">Freehand: {character}</div>
  ),
}));

describe('DeckDetail Component', () => {
  const dummyDeck: Deck = {
    id: 1,
    title: 'HSK 1 Căn bản',
    description: 'Từ vựng căn bản',
    createdAt: 1000,
    updatedAt: 1000,
    wordCount: 2,
  };

  const dummyWords: Word[] = [
    {
      id: 101,
      deckId: 1,
      hanzi: '你好',
      pinyin: 'nǐ hǎo',
      sinoVietnamese: 'nhĩ hảo',
      meaning: 'Xin chào',
    },
    {
      id: 102,
      deckId: 1,
      hanzi: '谢谢',
      pinyin: 'xièxie',
      sinoVietnamese: 'tạ tạ',
      meaning: 'Cảm ơn',
    },
  ];

  it('renders deck title and word list', () => {
    render(
      <DeckDetail
        deck={dummyDeck}
        words={dummyWords}
        onBack={vi.fn()}
        onAddWord={vi.fn()}
        onDeleteWord={vi.fn()}
      />
    );

    expect(screen.getByText('HSK 1 Căn bản')).toBeInTheDocument();
    expect(screen.getByText('2 từ vựng')).toBeInTheDocument();
    expect(screen.getByText('你好')).toBeInTheDocument();
    expect(screen.getByText('nǐ hǎo')).toBeInTheDocument();
    expect(screen.getByText('Xin chào')).toBeInTheDocument();
    expect(screen.getByText('谢谢')).toBeInTheDocument();
    expect(screen.getByText('xièxie')).toBeInTheDocument();
    expect(screen.getByText('Cảm ơn')).toBeInTheDocument();
  });

  it('calls onBack when clicking "Quay lại bộ từ"', () => {
    const handleBack = vi.fn();
    render(
      <DeckDetail
        deck={dummyDeck}
        words={dummyWords}
        onBack={handleBack}
        onAddWord={vi.fn()}
        onDeleteWord={vi.fn()}
      />
    );

    fireEvent.click(screen.getByText('Quay lại bộ từ'));
    expect(handleBack).toHaveBeenCalledTimes(1);
  });

  it('calls onAddWord when clicking "Thêm từ"', () => {
    const handleAdd = vi.fn();
    render(
      <DeckDetail
        deck={dummyDeck}
        words={dummyWords}
        onBack={vi.fn()}
        onAddWord={handleAdd}
        onDeleteWord={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /thêm từ/i }));
    expect(handleAdd).toHaveBeenCalledTimes(1);
  });

  it('calls onEditDeck when edit deck button is clicked', () => {
    const handleEditDeck = vi.fn();
    render(
      <DeckDetail
        deck={dummyDeck}
        words={dummyWords}
        onBack={vi.fn()}
        onAddWord={vi.fn()}
        onDeleteWord={vi.fn()}
        onEditDeck={handleEditDeck}
      />
    );

    const editDeckBtn = screen.getByLabelText('Chỉnh sửa bộ từ');
    fireEvent.click(editDeckBtn);
    expect(handleEditDeck).toHaveBeenCalledWith(dummyDeck);
  });

  it('calls onEditWord when edit word button is clicked in word card', () => {
    const handleEditWord = vi.fn();
    render(
      <DeckDetail
        deck={dummyDeck}
        words={dummyWords}
        onBack={vi.fn()}
        onAddWord={vi.fn()}
        onDeleteWord={vi.fn()}
        onEditWord={handleEditWord}
      />
    );

    const editWordBtn = screen.getByLabelText('Chỉnh sửa từ 你好');
    fireEvent.click(editWordBtn);
    expect(handleEditWord).toHaveBeenCalledWith(dummyWords[0]);
  });

  it('calls onEditWord when edit button is clicked inside practice view', () => {
    const handleEditWord = vi.fn();
    render(
      <DeckDetail
        deck={dummyDeck}
        words={dummyWords}
        onBack={vi.fn()}
        onAddWord={vi.fn()}
        onDeleteWord={vi.fn()}
        onEditWord={handleEditWord}
      />
    );

    fireEvent.click(screen.getByText('你好'));
    const editPracticeBtn = screen.getByLabelText('Sửa từ này');
    fireEvent.click(editPracticeBtn);
    expect(handleEditWord).toHaveBeenCalledWith(dummyWords[0]);
  });

  it('calls onDeleteWord with word id when delete button is clicked', () => {
    const handleDelete = vi.fn();
    render(
      <DeckDetail
        deck={dummyDeck}
        words={dummyWords}
        onBack={vi.fn()}
        onAddWord={vi.fn()}
        onDeleteWord={handleDelete}
      />
    );

    const deleteButtons = screen.getAllByTitle('Xóa từ');
    expect(deleteButtons.length).toBe(2);

    fireEvent.click(deleteButtons[0]);
    expect(handleDelete).toHaveBeenCalledWith(101);
  });

  it('shows empty message when deck has no words', () => {
    render(
      <DeckDetail
        deck={dummyDeck}
        words={[]}
        onBack={vi.fn()}
        onAddWord={vi.fn()}
        onDeleteWord={vi.fn()}
      />
    );

    expect(screen.getByText(/chưa có từ nào trong bộ này/i)).toBeInTheDocument();
  });

  it('enters practice session when a word is clicked and allows mode switching', () => {
    render(
      <DeckDetail
        deck={dummyDeck}
        words={dummyWords}
        onBack={vi.fn()}
        onAddWord={vi.fn()}
        onDeleteWord={vi.fn()}
      />
    );

    // Click on first word card
    fireEvent.click(screen.getByText('你好'));

    // Should now be in practice mode
    expect(screen.getByText('Quay lại danh sách từ')).toBeInTheDocument();

    // Default mode is stroke animator
    expect(screen.getByTestId('mock-stroke-animator')).toBeInTheDocument();

    // Switch to Guided Quiz
    fireEvent.click(screen.getByText('Đồ chữ theo thứ tự'));
    expect(screen.getByTestId('mock-guided-quiz')).toBeInTheDocument();

    // Switch to Freehand Recognition
    fireEvent.click(screen.getByText('Khung viết & Nhận diện'));
    expect(screen.getByTestId('mock-freehand-view')).toBeInTheDocument();

    // Switch back to Animation
    fireEvent.click(screen.getByText('Xem hoạt ảnh nét'));
    expect(screen.getByTestId('mock-stroke-animator')).toBeInTheDocument();
  });

  it('navigates next and previous words in practice mode', () => {
    render(
      <DeckDetail
        deck={dummyDeck}
        words={dummyWords}
        onBack={vi.fn()}
        onAddWord={vi.fn()}
        onDeleteWord={vi.fn()}
      />
    );

    fireEvent.click(screen.getByText('你好'));

    const prevButton = screen.getByRole('button', { name: /từ trước/i });
    const nextButton = screen.getByRole('button', { name: /từ tiếp theo/i });

    // On word 1: Prev disabled, Next enabled, count is 1 / 2
    expect(prevButton).toBeDisabled();
    expect(nextButton).not.toBeDisabled();
    expect(screen.getByText('1 / 2')).toBeInTheDocument();

    // Click Next
    fireEvent.click(nextButton);

    // On word 2: Prev enabled, Next disabled, count is 2 / 2
    expect(prevButton).not.toBeDisabled();
    expect(nextButton).toBeDisabled();
    expect(screen.getByText('2 / 2')).toBeInTheDocument();

    // Click Prev
    fireEvent.click(prevButton);
    expect(screen.getByText('1 / 2')).toBeInTheDocument();

    // Return to list view
    fireEvent.click(screen.getByText('Quay lại danh sách từ'));
    expect(screen.getByText('Danh sách từ trong bộ')).toBeInTheDocument();
  });
});

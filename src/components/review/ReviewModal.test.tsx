import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ReviewModal, { type DeckWithWords } from './ReviewModal';

vi.mock('../practice/GuidedQuiz', () => ({
  default: ({
    character,
    showOutline,
    onQuizComplete,
    onMistake,
  }: {
    character: string;
    showOutline?: boolean;
    onQuizComplete?: (mistakes: number) => void;
    onMistake?: (mistakes: number) => void;
  }) => (
    <div data-testid="mock-guided-quiz" data-outline={String(showOutline)}>
      <span>GuidedQuiz: {character}</span>
      <button
        type="button"
        onClick={() => onQuizComplete && onQuizComplete(0)}
      >
        Simulate Pass Quiz
      </button>
      <button
        type="button"
        onClick={() => onMistake && onMistake(4)}
      >
        Simulate Too Many Mistakes
      </button>
    </div>
  ),
}));

vi.mock('../practice/FreehandRecognitionView', () => ({
  default: ({
    character,
    onSuccess,
  }: {
    character: string;
    onSuccess?: () => void;
  }) => (
    <div data-testid="mock-freehand-view">
      <span>Freehand: {character}</span>
      <button type="button" onClick={() => onSuccess && onSuccess()}>
        Simulate Pass Freehand
      </button>
    </div>
  ),
}));

vi.mock('../practice/StrokeAnimator', () => ({
  default: ({ character }: { character: string }) => (
    <div data-testid="mock-stroke-animator">Animator: {character}</div>
  ),
}));

describe('ReviewModal Component', () => {
  const sampleDecks: DeckWithWords[] = [
    {
      deck: {
        id: 1,
        title: 'HSK 1 Căn bản',
        description: 'Bộ từ HSK 1',
        createdAt: 1000,
        updatedAt: 1000,
        wordCount: 2,
      },
      words: [
        {
          id: 101,
          deckId: 1,
          hanzi: '水',
          pinyin: 'shuǐ',
          sinoVietnamese: 'thủy',
          meaning: 'Nước',
        },
        {
          id: 102,
          deckId: 1,
          hanzi: '好',
          pinyin: 'hǎo',
          sinoVietnamese: 'hảo',
          meaning: 'Tốt',
        },
      ],
    },
  ];

  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <ReviewModal
        isOpen={false}
        decksWithWords={sampleDecks}
        onClose={vi.fn()}
        onRecordReview={vi.fn()}
      />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders deck selection list when opened', () => {
    render(
      <ReviewModal
        isOpen={true}
        decksWithWords={sampleDecks}
        onClose={vi.fn()}
        onRecordReview={vi.fn()}
      />
    );

    expect(screen.getByRole('heading', { name: /Ôn tập từ vựng/i })).toBeInTheDocument();
    expect(screen.getByText('HSK 1 Căn bản')).toBeInTheDocument();
    expect(screen.getByText(/2 cần ôn/i)).toBeInTheDocument();
  });

  it('starts review session on deck click, hides hanzi, shows pinyin & only Guided/Freehand modes with showOutline=false', () => {
    render(
      <ReviewModal
        isOpen={true}
        decksWithWords={sampleDecks}
        onClose={vi.fn()}
        onRecordReview={vi.fn()}
      />
    );

    // Select deck
    fireEvent.click(screen.getByText('HSK 1 Căn bản'));

    // Should show Pinyin and meaning for first word '水'
    expect(screen.getByText('shuǐ')).toBeInTheDocument();
    expect(screen.getByText('Nước')).toBeInTheDocument();

    // Should only have 'Đồ chữ theo thứ tự' and 'Khung viết & Nhận diện', NOT 'Xem hoạt ảnh nét'
    expect(screen.getByRole('button', { name: /Đồ chữ theo thứ tự/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Khung viết & Nhận diện/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Xem hoạt ảnh nét/i })).not.toBeInTheDocument();

    // GuidedQuiz should be rendered with showOutline=false
    const quizEl = screen.getByTestId('mock-guided-quiz');
    expect(quizEl).toHaveAttribute('data-outline', 'false');
  });

  it('shows 4 SRS rating buttons (Quên rồi, Khó, Tốt, Dễ) with specific intervals when word is passed', () => {
    const handleRecordReview = vi.fn();
    render(
      <ReviewModal
        isOpen={true}
        decksWithWords={sampleDecks}
        onClose={vi.fn()}
        onRecordReview={handleRecordReview}
      />
    );

    fireEvent.click(screen.getByText('HSK 1 Căn bản'));

    // Pass first word
    fireEvent.click(screen.getByText('Simulate Pass Quiz'));

    // 4 SRS buttons should appear
    expect(screen.getByRole('button', { name: /Quên rồi/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Khó/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Tốt/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Dễ/i })).toBeInTheDocument();

    // Time intervals should be visible
    expect(screen.getByText(/10 phút/i)).toBeInTheDocument();
    expect(screen.getByText(/1 ngày/i)).toBeInTheDocument();
    expect(screen.getByText(/3 ngày/i)).toBeInTheDocument();
    expect(screen.getByText(/7 ngày/i)).toBeInTheDocument();

    // Click 'Tốt' (rating 3)
    fireEvent.click(screen.getByRole('button', { name: /Tốt/i }));

    expect(handleRecordReview).toHaveBeenCalledWith(101, 3);

    // Advances to second word 'hǎo'
    expect(screen.getByText('hǎo')).toBeInTheDocument();
  });

  it('triggers relearn state when user makes too many mistakes or clicks Xem đáp án, and re-queues the word', () => {
    const handleRecordReview = vi.fn();
    render(
      <ReviewModal
        isOpen={true}
        decksWithWords={sampleDecks}
        onClose={vi.fn()}
        onRecordReview={handleRecordReview}
      />
    );

    fireEvent.click(screen.getByText('HSK 1 Căn bản'));

    // Simulate > 3 mistakes on first word '水'
    fireEvent.click(screen.getByText('Simulate Too Many Mistakes'));

    // Should enter relearn state and show StrokeAnimator model
    expect(screen.getByTestId('mock-stroke-animator')).toHaveTextContent('Animator: 水');
    expect(screen.getByRole('button', { name: /Học lại từ này/i })).toBeInTheDocument();

    // Confirm relearn -> records rating 1 and appends word to the end of queue (queue length becomes 3)
    fireEvent.click(screen.getByRole('button', { name: /Học lại từ này/i }));
    expect(handleRecordReview).toHaveBeenCalledWith(101, 1);

    // Now on word 2 ('hǎo'), progress shows 2 / 3 because word 1 was re-queued
    expect(screen.getByText('hǎo')).toBeInTheDocument();
    expect(screen.getByText(/2 \/ 3/i)).toBeInTheDocument();
  });

  it('supports switching to Freehand mode and completing the review session', () => {
    const handleRecordReview = vi.fn();
    render(
      <ReviewModal
        isOpen={true}
        decksWithWords={sampleDecks}
        onClose={vi.fn()}
        onRecordReview={handleRecordReview}
      />
    );

    fireEvent.click(screen.getByText('HSK 1 Căn bản'));

    // Switch to Freehand mode
    fireEvent.click(screen.getByRole('button', { name: /Khung viết & Nhận diện/i }));
    expect(screen.getByTestId('mock-freehand-view')).toBeInTheDocument();

    // Pass word 1
    fireEvent.click(screen.getByText('Simulate Pass Freehand'));
    fireEvent.click(screen.getByRole('button', { name: /Dễ/i }));
    expect(handleRecordReview).toHaveBeenCalledWith(101, 4);

    // Pass word 2
    fireEvent.click(screen.getByText('Simulate Pass Freehand'));
    fireEvent.click(screen.getByRole('button', { name: /Tốt/i }));
    expect(handleRecordReview).toHaveBeenCalledWith(102, 3);

    // Session should now be complete
    expect(screen.getByText(/Hoàn thành phiên ôn tập/i)).toBeInTheDocument();
  });
});

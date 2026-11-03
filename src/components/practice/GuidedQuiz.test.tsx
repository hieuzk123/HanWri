import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import GuidedQuiz from './GuidedQuiz';
import HanziWriter from 'hanzi-writer';

let mockWriterInstance: {
  quiz: ReturnType<typeof vi.fn>;
  highlightStroke: ReturnType<typeof vi.fn>;
  cancelQuiz: ReturnType<typeof vi.fn>;
  _quizOptions?: any;
};
let lastCreateOptions: any;

vi.mock('hanzi-writer', () => {
  return {
    default: {
      create: vi.fn((_element: HTMLElement, _char: string, options: any) => {
        lastCreateOptions = options;
        mockWriterInstance = {
          quiz: vi.fn((quizOpts: any) => {
            mockWriterInstance._quizOptions = quizOpts;
          }),
          highlightStroke: vi.fn(),
          cancelQuiz: vi.fn(),
        };
        return mockWriterInstance;
      }),
    },
  };
});

describe('GuidedQuiz Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    lastCreateOptions = undefined;
  });

  it('renders quiz container and status controls', () => {
    render(<GuidedQuiz character="好" size={300} />);
    expect(screen.getByText(/Gợi ý nét/i)).toBeInTheDocument();
    expect(screen.getByText(/Làm lại/i)).toBeInTheDocument();
    expect(screen.getByText(/Tiến độ:/i)).toBeInTheDocument();
  });

  it('initializes HanziWriter with correct configuration', () => {
    render(<GuidedQuiz character="你" size={320} />);

    expect(HanziWriter.create).toHaveBeenCalledTimes(1);
    const [, charArg, options] = vi.mocked(HanziWriter.create).mock.calls[0];
    expect(charArg).toBe('你');
    expect(options).toMatchObject({
      width: 320,
      height: 320,
      padding: 20,
      showOutline: true,
      strokeColor: '#2c3e50',
      outlineColor: '#e2e8f0',
      highlightColor: '#f39c12',
      drawingColor: '#c0392b',
      drawingWidth: 16,
      showHintAfterMisses: 3,
    });
  });

  it('supports showOutline={false} for blind review mode', () => {
    render(<GuidedQuiz character="你" size={300} showOutline={false} />);

    const [, , options] = vi.mocked(HanziWriter.create).mock.calls[0];
    expect(options?.showOutline).toBe(false);
  });

  it('handles onLoadCharDataSuccess and updates total strokes', () => {
    render(<GuidedQuiz character="好" size={300} />);

    expect(lastCreateOptions).toBeDefined();
    expect(typeof lastCreateOptions.onLoadCharDataSuccess).toBe('function');

    act(() => {
      lastCreateOptions.onLoadCharDataSuccess({
        strokes: ['stroke1', 'stroke2', 'stroke3', 'stroke4', 'stroke5', 'stroke6'],
      });
    });

    expect(screen.getByText('0 / 6')).toBeInTheDocument();
    expect(mockWriterInstance.quiz).toHaveBeenCalledTimes(1);
  });

  it('tracks mistakes and correct strokes during the quiz', () => {
    const onMistake = vi.fn();
    render(<GuidedQuiz character="好" size={300} onMistake={onMistake} />);

    act(() => {
      lastCreateOptions.onLoadCharDataSuccess({
        strokes: ['stroke1', 'stroke2', 'stroke3'],
      });
    });

    // Simulate mistake
    expect(mockWriterInstance._quizOptions?.onMistake).toBeDefined();
    act(() => {
      mockWriterInstance._quizOptions.onMistake({
        strokeNum: 0,
        mistakesOnStroke: 1,
        totalMistakes: 1,
      });
    });

    expect(screen.getByText(/Sai: 1/i)).toBeInTheDocument();
    expect(onMistake).toHaveBeenCalledWith(1);

    // Simulate correct stroke
    act(() => {
      mockWriterInstance._quizOptions.onCorrectStroke({
        strokeNum: 0,
        mistakesOnStroke: 1,
        totalMistakes: 1,
        strokesRemaining: 2,
      });
    });

    expect(screen.getByText('1 / 3')).toBeInTheDocument();
  });

  it('triggers highlightStroke when "Gợi ý nét" button is clicked', () => {
    render(<GuidedQuiz character="好" size={300} />);

    act(() => {
      lastCreateOptions.onLoadCharDataSuccess({
        strokes: ['stroke1', 'stroke2'],
      });
    });

    const hintBtn = screen.getByText(/Gợi ý nét/i).closest('button')!;
    expect(hintBtn).toBeEnabled();

    fireEvent.click(hintBtn);
    expect(mockWriterInstance.highlightStroke).toHaveBeenCalledWith(0);

    // After 1 stroke is completed
    act(() => {
      mockWriterInstance._quizOptions.onCorrectStroke({
        strokeNum: 0,
        mistakesOnStroke: 0,
        totalMistakes: 0,
        strokesRemaining: 1,
      });
    });

    fireEvent.click(hintBtn);
    expect(mockWriterInstance.highlightStroke).toHaveBeenCalledWith(1);
  });

  it('resets quiz when "Làm lại" button is clicked', () => {
    render(<GuidedQuiz character="好" size={300} />);

    act(() => {
      lastCreateOptions.onLoadCharDataSuccess({
        strokes: ['stroke1', 'stroke2'],
      });
    });

    // Make a mistake and complete one stroke
    act(() => {
      mockWriterInstance._quizOptions.onMistake({});
      mockWriterInstance._quizOptions.onCorrectStroke({ strokeNum: 0 });
    });

    expect(screen.getByText(/Sai: 1/i)).toBeInTheDocument();
    expect(screen.getByText('1 / 2')).toBeInTheDocument();

    // Click retry
    const retryBtn = screen.getByText(/Làm lại/i).closest('button')!;
    fireEvent.click(retryBtn);

    expect(screen.queryByText(/Sai: 1/i)).not.toBeInTheDocument();
    expect(screen.getByText('0 / 2')).toBeInTheDocument();
    expect(mockWriterInstance.quiz).toHaveBeenCalledTimes(2);
  });

  it('displays completion overlay and triggers onQuizComplete callback with mistake count', () => {
    const onComplete = vi.fn();
    render(<GuidedQuiz character="好" size={300} onQuizComplete={onComplete} />);

    act(() => {
      lastCreateOptions.onLoadCharDataSuccess({
        strokes: ['stroke1', 'stroke2'],
      });
    });

    // Cause 2 mistakes
    act(() => {
      mockWriterInstance._quizOptions.onMistake({});
      mockWriterInstance._quizOptions.onMistake({});
    });

    // Complete quiz
    act(() => {
      mockWriterInstance._quizOptions.onComplete();
    });

    expect(screen.getByText(/Hoàn thành xuất sắc!/i)).toBeInTheDocument();
    expect(screen.getByText(/Số lần viết sai nét: 2/i)).toBeInTheDocument();
    expect(onComplete).toHaveBeenCalledWith(2);

    // Hint button should be disabled when completed
    const hintBtn = screen.getByText(/Gợi ý nét/i).closest('button')!;
    expect(hintBtn).toBeDisabled();
  });
});

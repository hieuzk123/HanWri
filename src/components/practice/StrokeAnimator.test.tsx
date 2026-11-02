import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import StrokeAnimator from './StrokeAnimator';
import HanziWriter from 'hanzi-writer';

vi.mock('hanzi-writer', () => {
  const mockWriterInstance = {
    animateCharacter: vi.fn(),
    pauseAnimation: vi.fn(),
    resumeAnimation: vi.fn(),
    hideCharacter: vi.fn(),
    showOutline: vi.fn(),
    _options: {
      strokeAnimationSpeed: 1,
      delayBetweenStrokes: 250,
    },
  };

  return {
    default: {
      create: vi.fn(() => mockWriterInstance),
    },
  };
});

describe('StrokeAnimator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes HanziWriter with correct configuration', () => {
    render(<StrokeAnimator character="你" size={300} />);

    expect(HanziWriter.create).toHaveBeenCalledTimes(1);
    const [, charArg, options] = vi.mocked(HanziWriter.create).mock.calls[0];
    expect(charArg).toBe('你');
    expect(options).toMatchObject({
      width: 300,
      height: 300,
      padding: 20,
      showOutline: true,
      strokeColor: '#2c3e50',
      outlineColor: '#cbd5e1',
      radicalColor: '#c0392b',
      strokeAnimationSpeed: 1,
    });
  });

  it('renders CharacterGrid in background and hanzi-writer target container', () => {
    const { container } = render(<StrokeAnimator character="中" size={250} />);

    // SVG grid should be rendered
    const svgGrid = container.querySelector('svg');
    expect(svgGrid).toBeInTheDocument();
    expect(svgGrid).toHaveAttribute('width', '250');

    // HanziWriter container
    const canvas = screen.getByTestId('hanzi-writer-canvas');
    expect(canvas).toBeInTheDocument();
  });

  it('controls play and pause animations', () => {
    const onCompleteMock = vi.fn();
    render(<StrokeAnimator character="学" onComplete={onCompleteMock} />);

    const playBtn = screen.getByTitle('Xem hoạt ảnh');
    expect(playBtn).toBeInTheDocument();

    // Click Play
    fireEvent.click(playBtn);
    const mockWriter = vi.mocked(HanziWriter.create).mock.results[0].value;
    expect(mockWriter.animateCharacter).toHaveBeenCalledTimes(1);

    // Button should now show Pause
    const pauseBtn = screen.getByTitle('Tạm dừng');
    expect(pauseBtn).toBeInTheDocument();

    // Click Pause
    fireEvent.click(pauseBtn);
    expect(mockWriter.pauseAnimation).toHaveBeenCalledTimes(1);

    // Button should revert to Play
    expect(screen.getByTitle('Xem hoạt ảnh')).toBeInTheDocument();

    // Click Play again to resume
    fireEvent.click(screen.getByTitle('Xem hoạt ảnh'));
    expect(mockWriter.resumeAnimation).toHaveBeenCalledTimes(1);
  });

  it('resets character on reset button click', () => {
    render(<StrokeAnimator character="汉" />);
    const resetBtn = screen.getByTitle('Vẽ lại từ đầu');
    fireEvent.click(resetBtn);

    const mockWriter = vi.mocked(HanziWriter.create).mock.results[0].value;
    expect(mockWriter.hideCharacter).toHaveBeenCalledTimes(1);
    expect(mockWriter.showOutline).toHaveBeenCalledTimes(1);
  });

  it('cycles playback speed when speed button is clicked', () => {
    render(<StrokeAnimator character="语" />);
    const speedBtn = screen.getByTitle('Tốc độ');

    expect(screen.getByText('1x')).toBeInTheDocument();

    fireEvent.click(speedBtn);
    expect(screen.getByText('1.5x')).toBeInTheDocument();

    fireEvent.click(speedBtn);
    expect(screen.getByText('2x')).toBeInTheDocument();

    fireEvent.click(speedBtn);
    expect(screen.getByText('0.5x')).toBeInTheDocument();

    fireEvent.click(speedBtn);
    expect(screen.getByText('1x')).toBeInTheDocument();
  });
});

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import FreehandRecognitionView from './FreehandRecognitionView';
import * as handwritingApi from '../../services/handwritingApi';

// Mock HanziWriter used by StrokeAnimator inside the modal
vi.mock('hanzi-writer', () => {
  return {
    default: {
      create: vi.fn(() => ({
        animateCharacter: vi.fn(),
        pauseAnimation: vi.fn(),
        resumeAnimation: vi.fn(),
        hideCharacter: vi.fn(),
        showOutline: vi.fn(),
        _options: {
          strokeAnimationSpeed: 1,
          delayBetweenStrokes: 250,
        },
      })),
    },
  };
});

describe('FreehandRecognitionView', () => {
  const mockContext = {
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    clearRect: vi.fn(),
    strokeStyle: '',
    lineWidth: 0,
    lineCap: '',
    lineJoin: '',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
      mockContext as unknown as CanvasRenderingContext2D
    );
    HTMLCanvasElement.prototype.setPointerCapture = vi.fn();
    HTMLCanvasElement.prototype.releasePointerCapture = vi.fn();
    HTMLCanvasElement.prototype.getBoundingClientRect = vi.fn(() => ({
      left: 0,
      top: 0,
      right: 320,
      bottom: 320,
      width: 320,
      height: 320,
      x: 0,
      y: 0,
      toJSON: () => {},
    }));
  });

  const drawStroke = (container: HTMLElement) => {
    const canvas = container.querySelector('canvas')!;
    fireEvent.pointerDown(canvas, { clientX: 20, clientY: 20, pointerId: 1 });
    fireEvent.pointerMove(canvas, { clientX: 50, clientY: 50, pointerId: 1 });
    fireEvent.pointerUp(canvas, { clientX: 50, clientY: 50, pointerId: 1 });
  };

  it('renders FreehandCanvas and control buttons', () => {
    render(<FreehandRecognitionView character="好" size={320} />);
    expect(screen.getByRole('button', { name: /Kiểm tra/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Xóa nét/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Xóa hết/i })).toBeInTheDocument();
  });

  it('evaluates rank 1 match (perfect), shows green feedback and triggers onSuccess', async () => {
    const onSuccess = vi.fn();
    vi.spyOn(handwritingApi, 'recognizeHandwriting').mockResolvedValue({
      success: true,
      candidates: ['好', '女', '子'],
      matchedRank: 1,
    });

    const { container } = render(
      <FreehandRecognitionView character="好" size={320} onSuccess={onSuccess} />
    );

    drawStroke(container);
    fireEvent.click(screen.getByRole('button', { name: /Kiểm tra/i }));

    await waitFor(() => {
      expect(screen.getByText('Tuyệt vời! Viết rất chuẩn xác')).toBeInTheDocument();
      expect(screen.getByText('Chữ mục tiêu là ứng viên số 1')).toBeInTheDocument();
    });

    expect(onSuccess).toHaveBeenCalledTimes(1);
  });

  it('evaluates rank 2 match (good), shows blue feedback and triggers onSuccess', async () => {
    const onSuccess = vi.fn();
    vi.spyOn(handwritingApi, 'recognizeHandwriting').mockResolvedValue({
      success: true,
      candidates: ['女', '好', '子'],
      matchedRank: 2,
    });

    const { container } = render(
      <FreehandRecognitionView character="好" size={320} onSuccess={onSuccess} />
    );

    drawStroke(container);
    fireEvent.click(screen.getByRole('button', { name: /Kiểm tra/i }));

    await waitFor(() => {
      expect(screen.getByText('Chính xác! (Xếp hạng #2)')).toBeInTheDocument();
      expect(screen.getByText('Chữ được nhận diện rất tốt')).toBeInTheDocument();
    });

    expect(onSuccess).toHaveBeenCalledTimes(1);
  });

  it('evaluates rank 5 match (near), shows amber feedback and does not trigger onSuccess', async () => {
    const onSuccess = vi.fn();
    vi.spyOn(handwritingApi, 'recognizeHandwriting').mockResolvedValue({
      success: true,
      candidates: ['女', '子', '如', '妙', '好'],
      matchedRank: 5,
    });

    const { container } = render(
      <FreehandRecognitionView character="好" size={320} onSuccess={onSuccess} />
    );

    drawStroke(container);
    fireEvent.click(screen.getByRole('button', { name: /Kiểm tra/i }));

    await waitFor(() => {
      expect(screen.getByText('Gần đúng (Xếp hạng #5)')).toBeInTheDocument();
      expect(
        screen.getByText('Hãy nắn nót lại nét cho vuông vắn hơn')
      ).toBeInTheDocument();
    });

    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('evaluates rank -1 (unrecognized), shows red feedback and allows opening model modal', async () => {
    const onSuccess = vi.fn();
    vi.spyOn(handwritingApi, 'recognizeHandwriting').mockResolvedValue({
      success: true,
      candidates: ['木', '本', '禾'],
      matchedRank: -1,
    });

    const { container } = render(
      <FreehandRecognitionView character="好" size={320} onSuccess={onSuccess} />
    );

    drawStroke(container);
    fireEvent.click(screen.getByRole('button', { name: /Kiểm tra/i }));

    await waitFor(() => {
      expect(screen.getByText('Chưa nhận diện đúng')).toBeInTheDocument();
      expect(
        screen.getByText(/Các chữ nhận diện được: 木、 本、 禾/)
      ).toBeInTheDocument();
    });

    expect(onSuccess).not.toHaveBeenCalled();

    // Check modal overlay
    const viewGuideBtn = screen.getByRole('button', { name: /Xem mẫu viết chuẩn/i });
    expect(viewGuideBtn).toBeInTheDocument();

    fireEvent.click(viewGuideBtn);

    // Modal should now be open
    expect(screen.getByText('Mẫu chuẩn chữ「好」')).toBeInTheDocument();
    expect(screen.getByTestId('hanzi-writer-canvas')).toBeInTheDocument();

    // Close modal
    const closeBtn = screen.getByRole('button', { name: 'Đóng' });
    fireEvent.click(closeBtn);

    expect(screen.queryByText('Mẫu chuẩn chữ「好」')).not.toBeInTheDocument();
  });
});

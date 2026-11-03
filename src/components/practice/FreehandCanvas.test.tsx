import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import FreehandCanvas from './FreehandCanvas';

describe('FreehandCanvas', () => {
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
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(mockContext as unknown as CanvasRenderingContext2D);
    HTMLCanvasElement.prototype.setPointerCapture = vi.fn();
    HTMLCanvasElement.prototype.releasePointerCapture = vi.fn();
    HTMLCanvasElement.prototype.getBoundingClientRect = vi.fn(() => ({
      left: 0,
      top: 0,
      right: 300,
      bottom: 300,
      width: 300,
      height: 300,
      x: 0,
      y: 0,
      toJSON: () => {},
    }));
  });

  it('renders canvas element and action buttons', () => {
    render(<FreehandCanvas size={300} onCheck={vi.fn()} />);

    expect(screen.getByRole('button', { name: /Xóa nét/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Xóa hết/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Kiểm tra/i })).toBeInTheDocument();
  });

  it('disables control buttons when canvas is empty', () => {
    render(<FreehandCanvas size={300} onCheck={vi.fn()} />);

    expect(screen.getByRole('button', { name: /Xóa nét/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /Xóa hết/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /Kiểm tra/i })).toBeDisabled();
  });

  it('captures vector ink on drawing and enables buttons', () => {
    const onStrokesChange = vi.fn();
    const { container } = render(
      <FreehandCanvas size={300} onCheck={vi.fn()} onStrokesChange={onStrokesChange} />
    );
    const canvas = container.querySelector('canvas')!;
    expect(canvas).toBeInTheDocument();

    // Simulate pointer down, move, up
    fireEvent.pointerDown(canvas, { clientX: 50, clientY: 50, pointerId: 1 });
    fireEvent.pointerMove(canvas, { clientX: 100, clientY: 100, pointerId: 1 });
    fireEvent.pointerUp(canvas, { clientX: 100, clientY: 100, pointerId: 1 });

    expect(mockContext.beginPath).toHaveBeenCalled();
    expect(mockContext.moveTo).toHaveBeenCalledWith(50, 50);
    expect(mockContext.lineTo).toHaveBeenCalledWith(100, 100);
    expect(mockContext.stroke).toHaveBeenCalled();

    // Buttons should now be enabled
    expect(screen.getByRole('button', { name: /Xóa nét/i })).toBeEnabled();
    expect(screen.getByRole('button', { name: /Xóa hết/i })).toBeEnabled();
    expect(screen.getByRole('button', { name: /Kiểm tra/i })).toBeEnabled();

    // onStrokesChange should have received 1 stroke: [[x...], [y...], [t...]]
    expect(onStrokesChange).toHaveBeenCalledTimes(1);
    const strokes = onStrokesChange.mock.calls[0][0];
    expect(strokes).toHaveLength(1);
    expect(strokes[0][0]).toEqual([50, 100]); // xs
    expect(strokes[0][1]).toEqual([50, 100]); // ys
    expect(strokes[0][2]).toHaveLength(2);     // timestamps
  });

  it('triggers onCheck with recorded ink vectors, width, and height', () => {
    const onCheck = vi.fn();
    const { container } = render(<FreehandCanvas size={300} onCheck={onCheck} />);
    const canvas = container.querySelector('canvas')!;

    // Draw first stroke
    fireEvent.pointerDown(canvas, { clientX: 20, clientY: 30, pointerId: 1 });
    fireEvent.pointerMove(canvas, { clientX: 40, clientY: 60, pointerId: 1 });
    fireEvent.pointerUp(canvas, { clientX: 40, clientY: 60, pointerId: 1 });

    // Draw second stroke
    fireEvent.pointerDown(canvas, { clientX: 70, clientY: 80, pointerId: 1 });
    fireEvent.pointerMove(canvas, { clientX: 90, clientY: 100, pointerId: 1 });
    fireEvent.pointerUp(canvas, { clientX: 90, clientY: 100, pointerId: 1 });

    // Click "Kiểm tra"
    fireEvent.click(screen.getByRole('button', { name: /Kiểm tra/i }));

    expect(onCheck).toHaveBeenCalledTimes(1);
    const [inkData, width, height] = onCheck.mock.calls[0];
    expect(width).toBe(300);
    expect(height).toBe(300);
    expect(inkData).toHaveLength(2);
    expect(inkData[0][0]).toEqual([20, 40]);
    expect(inkData[0][1]).toEqual([30, 60]);
    expect(inkData[1][0]).toEqual([70, 90]);
    expect(inkData[1][1]).toEqual([80, 100]);
  });

  it('handles undo ("Xóa nét") by removing the last stroke and redrawing', () => {
    const onCheck = vi.fn();
    const { container } = render(<FreehandCanvas size={300} onCheck={onCheck} />);
    const canvas = container.querySelector('canvas')!;

    // Draw stroke 1
    fireEvent.pointerDown(canvas, { clientX: 10, clientY: 10, pointerId: 1 });
    fireEvent.pointerUp(canvas, { clientX: 10, clientY: 10, pointerId: 1 });

    // Draw stroke 2
    fireEvent.pointerDown(canvas, { clientX: 20, clientY: 20, pointerId: 1 });
    fireEvent.pointerUp(canvas, { clientX: 20, clientY: 20, pointerId: 1 });

    // Undo once
    fireEvent.click(screen.getByRole('button', { name: /Xóa nét/i }));

    // Verify clearRect was called to redraw
    expect(mockContext.clearRect).toHaveBeenCalled();

    // Check submits only stroke 1
    fireEvent.click(screen.getByRole('button', { name: /Kiểm tra/i }));
    expect(onCheck).toHaveBeenCalledWith(
      expect.arrayContaining([expect.any(Array)]),
      300,
      300
    );
    expect(onCheck.mock.calls[0][0]).toHaveLength(1);

    // Undo again (all strokes gone)
    fireEvent.click(screen.getByRole('button', { name: /Xóa nét/i }));
    expect(screen.getByRole('button', { name: /Xóa nét/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /Kiểm tra/i })).toBeDisabled();
  });

  it('handles clear ("Xóa hết") by clearing all strokes and resetting canvas', () => {
    const onClear = vi.fn();
    const { container } = render(<FreehandCanvas size={300} onCheck={vi.fn()} onClear={onClear} />);
    const canvas = container.querySelector('canvas')!;

    fireEvent.pointerDown(canvas, { clientX: 15, clientY: 25, pointerId: 1 });
    fireEvent.pointerUp(canvas, { clientX: 15, clientY: 25, pointerId: 1 });

    expect(screen.getByRole('button', { name: /Xóa hết/i })).toBeEnabled();

    fireEvent.click(screen.getByRole('button', { name: /Xóa hết/i }));

    expect(mockContext.clearRect).toHaveBeenCalledWith(0, 0, 300, 300);
    expect(onClear).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: /Xóa hết/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /Kiểm tra/i })).toBeDisabled();
  });

  it('handles isLoading state appropriately', () => {
    const { container } = render(
      <FreehandCanvas size={300} onCheck={vi.fn()} isLoading={true} />
    );
    const canvas = container.querySelector('canvas')!;

    // Drawing should not start when isLoading is true
    fireEvent.pointerDown(canvas, { clientX: 50, clientY: 50, pointerId: 1 });
    fireEvent.pointerMove(canvas, { clientX: 100, clientY: 100, pointerId: 1 });
    fireEvent.pointerUp(canvas, { clientX: 100, clientY: 100, pointerId: 1 });

    expect(screen.getByRole('button', { name: /Kiểm tra/i })).toBeDisabled();
    expect(screen.getByText('Đang nhận diện...')).toBeInTheDocument();
  });

  it('handles pointer cancel gracefully', () => {
    const onStrokesChange = vi.fn();
    const { container } = render(
      <FreehandCanvas size={300} onCheck={vi.fn()} onStrokesChange={onStrokesChange} />
    );
    const canvas = container.querySelector('canvas')!;

    fireEvent.pointerDown(canvas, { clientX: 20, clientY: 20, pointerId: 1 });
    fireEvent.pointerMove(canvas, { clientX: 50, clientY: 50, pointerId: 1 });
    fireEvent.pointerCancel(canvas, { pointerId: 1 });

    expect(onStrokesChange).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: /Kiểm tra/i })).toBeEnabled();
  });

  it('ignores pointerMove when not drawing', () => {
    const { container } = render(<FreehandCanvas size={300} onCheck={vi.fn()} />);
    const canvas = container.querySelector('canvas')!;

    fireEvent.pointerMove(canvas, { clientX: 80, clientY: 80, pointerId: 1 });

    expect(mockContext.lineTo).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: /Kiểm tra/i })).toBeDisabled();
  });
});

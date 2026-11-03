import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CreateDeckModal from './CreateDeckModal';

describe('CreateDeckModal Component', () => {
  it('does not render when isOpen is false', () => {
    const { container } = render(
      <CreateDeckModal isOpen={false} onClose={vi.fn()} onCreateDeck={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders modal with title and description inputs when isOpen is true', () => {
    render(<CreateDeckModal isOpen={true} onClose={vi.fn()} onCreateDeck={vi.fn()} />);

    expect(screen.getByText('Tạo bộ từ mới')).toBeInTheDocument();
    expect(screen.getByLabelText(/tên bộ từ/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/mô tả/i)).toBeInTheDocument();
  });

  it('calls onClose when cancel button is clicked', () => {
    const handleClose = vi.fn();
    render(<CreateDeckModal isOpen={true} onClose={handleClose} onCreateDeck={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: /hủy/i }));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('validates required title before submitting', () => {
    const handleCreateDeck = vi.fn();
    render(<CreateDeckModal isOpen={true} onClose={vi.fn()} onCreateDeck={handleCreateDeck} />);

    fireEvent.click(screen.getByRole('button', { name: /tạo bộ từ/i }));
    expect(screen.getByText(/vui lòng nhập tên bộ từ/i)).toBeInTheDocument();
    expect(handleCreateDeck).not.toHaveBeenCalled();
  });

  it('submits valid deck data and calls onCreateDeck and onClose', () => {
    const handleCreateDeck = vi.fn();
    const handleClose = vi.fn();
    render(<CreateDeckModal isOpen={true} onClose={handleClose} onCreateDeck={handleCreateDeck} />);

    fireEvent.change(screen.getByLabelText(/tên bộ từ/i), {
      target: { value: 'Bộ từ HSK 2' },
    });
    fireEvent.change(screen.getByLabelText(/mô tả/i), {
      target: { value: 'Từ vựng cấp độ 2' },
    });

    fireEvent.click(screen.getByRole('button', { name: /tạo bộ từ/i }));

    expect(handleCreateDeck).toHaveBeenCalledWith({
      title: 'Bộ từ HSK 2',
      description: 'Từ vựng cấp độ 2',
    });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});

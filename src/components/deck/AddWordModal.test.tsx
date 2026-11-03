import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AddWordModal from './AddWordModal';

describe('AddWordModal Component', () => {
  it('does not render when isOpen is false', () => {
    const { container } = render(
      <AddWordModal isOpen={false} onClose={vi.fn()} onAddWord={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders modal with form inputs when isOpen is true', () => {
    render(<AddWordModal isOpen={true} onClose={vi.fn()} onAddWord={vi.fn()} />);

    expect(screen.getByText('Thêm từ mới vào bộ')).toBeInTheDocument();
    expect(screen.getByLabelText(/chữ hán/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phiên âm/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/hán việt/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/nghĩa/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/ghi chú/i)).toBeInTheDocument();
  });

  it('calls onClose when cancel or close button is clicked', () => {
    const handleClose = vi.fn();
    render(<AddWordModal isOpen={true} onClose={handleClose} onAddWord={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: /hủy/i }));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('validates required Hanzi input before submitting', () => {
    const handleAddWord = vi.fn();
    render(<AddWordModal isOpen={true} onClose={vi.fn()} onAddWord={handleAddWord} />);

    fireEvent.click(screen.getByRole('button', { name: /lưu từ vựng/i }));
    expect(screen.getByText(/vui lòng nhập chữ hán/i)).toBeInTheDocument();
    expect(handleAddWord).not.toHaveBeenCalled();
  });

  it('submits valid word data and calls onAddWord and onClose', () => {
    const handleAddWord = vi.fn();
    const handleClose = vi.fn();
    render(<AddWordModal isOpen={true} onClose={handleClose} onAddWord={handleAddWord} />);

    fireEvent.change(screen.getByLabelText(/chữ hán/i), { target: { value: '老师' } });
    fireEvent.change(screen.getByLabelText(/phiên âm/i), { target: { value: 'lǎoshī' } });
    fireEvent.change(screen.getByLabelText(/hán việt/i), { target: { value: 'lão sư' } });
    fireEvent.change(screen.getByLabelText(/nghĩa/i), { target: { value: 'Thầy cô giáo' } });
    fireEvent.change(screen.getByLabelText(/ghi chú/i), { target: { value: 'Danh từ' } });

    fireEvent.click(screen.getByRole('button', { name: /lưu từ vựng/i }));

    expect(handleAddWord).toHaveBeenCalledWith({
      hanzi: '老师',
      pinyin: 'lǎoshī',
      sinoVietnamese: 'lão sư',
      meaning: 'Thầy cô giáo',
      notes: 'Danh từ',
    });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});

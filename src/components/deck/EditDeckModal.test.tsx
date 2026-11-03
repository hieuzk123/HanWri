import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import EditDeckModal from './EditDeckModal';
import type { Deck } from '../../types';

describe('EditDeckModal', () => {
  const mockDeck: Deck = {
    id: 1,
    title: 'Từ vựng HSK 1',
    description: 'Từ vựng cơ bản',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    wordCount: 8,
  };

  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <EditDeckModal
        isOpen={false}
        deck={mockDeck}
        onClose={vi.fn()}
        onUpdateDeck={vi.fn()}
      />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing when deck is null', () => {
    const { container } = render(
      <EditDeckModal
        isOpen={true}
        deck={null}
        onClose={vi.fn()}
        onUpdateDeck={vi.fn()}
      />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('prefills fields with current deck data when rendered', () => {
    render(
      <EditDeckModal
        isOpen={true}
        deck={mockDeck}
        onClose={vi.fn()}
        onUpdateDeck={vi.fn()}
      />
    );

    const titleInput = screen.getByLabelText(/Tên bộ từ/i) as HTMLInputElement;
    const descInput = screen.getByLabelText(/Mô tả/i) as HTMLTextAreaElement;

    expect(titleInput.value).toBe('Từ vựng HSK 1');
    expect(descInput.value).toBe('Từ vựng cơ bản');
  });

  it('shows error if title is submitted empty', () => {
    const handleUpdate = vi.fn();
    render(
      <EditDeckModal
        isOpen={true}
        deck={mockDeck}
        onClose={vi.fn()}
        onUpdateDeck={handleUpdate}
      />
    );

    const titleInput = screen.getByLabelText(/Tên bộ từ/i);
    fireEvent.change(titleInput, { target: { value: '   ' } });

    const submitBtn = screen.getByRole('button', { name: /Lưu thay đổi/i });
    fireEvent.click(submitBtn);

    expect(screen.getByText('Vui lòng nhập tên bộ từ')).toBeInTheDocument();
    expect(handleUpdate).not.toHaveBeenCalled();
  });

  it('calls onUpdateDeck and onClose with updated data on valid submit', () => {
    const handleUpdate = vi.fn();
    const handleClose = vi.fn();

    render(
      <EditDeckModal
        isOpen={true}
        deck={mockDeck}
        onClose={handleClose}
        onUpdateDeck={handleUpdate}
      />
    );

    const titleInput = screen.getByLabelText(/Tên bộ từ/i);
    fireEvent.change(titleInput, { target: { value: 'Từ vựng HSK 1 Nâng cao' } });

    const descInput = screen.getByLabelText(/Mô tả/i);
    fireEvent.change(descInput, { target: { value: 'Bổ sung thêm ví dụ' } });

    const submitBtn = screen.getByRole('button', { name: /Lưu thay đổi/i });
    fireEvent.click(submitBtn);

    expect(handleUpdate).toHaveBeenCalledWith(1, {
      title: 'Từ vựng HSK 1 Nâng cao',
      description: 'Bổ sung thêm ví dụ',
    });
    expect(handleClose).toHaveBeenCalled();
  });

  it('calls onClose when cancel or close button is clicked', () => {
    const handleClose = vi.fn();

    render(
      <EditDeckModal
        isOpen={true}
        deck={mockDeck}
        onClose={handleClose}
        onUpdateDeck={vi.fn()}
      />
    );

    const cancelBtn = screen.getByRole('button', { name: /Hủy/i });
    fireEvent.click(cancelBtn);

    expect(handleClose).toHaveBeenCalledTimes(1);

    const closeBtn = screen.getByLabelText('Đóng');
    fireEvent.click(closeBtn);

    expect(handleClose).toHaveBeenCalledTimes(2);
  });
});

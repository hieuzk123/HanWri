import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import EditWordModal from './EditWordModal';
import type { Word } from '../../types';

describe('EditWordModal', () => {
  const mockWord: Word = {
    id: 10,
    deckId: 1,
    hanzi: '你好',
    pinyin: 'nǐ hǎo',
    sinoVietnamese: 'nhĩ hảo',
    meaning: 'Xin chào',
    notes: 'Câu chào hỏi thông dụng',
  };

  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <EditWordModal
        isOpen={false}
        word={mockWord}
        onClose={vi.fn()}
        onUpdateWord={vi.fn()}
      />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing when word is null', () => {
    const { container } = render(
      <EditWordModal
        isOpen={true}
        word={null}
        onClose={vi.fn()}
        onUpdateWord={vi.fn()}
      />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('prefills fields with current word data when opened', () => {
    render(
      <EditWordModal
        isOpen={true}
        word={mockWord}
        onClose={vi.fn()}
        onUpdateWord={vi.fn()}
      />
    );

    const hanziInput = screen.getByLabelText(/Chữ Hán/i) as HTMLInputElement;
    const pinyinInput = screen.getByLabelText(/Phiên âm/i) as HTMLInputElement;
    const sinoVietInput = screen.getByLabelText(/Âm Hán Việt/i) as HTMLInputElement;
    const meaningInput = screen.getByLabelText(/Ý nghĩa/i) as HTMLInputElement;
    const notesInput = screen.getByLabelText(/Ghi chú/i) as HTMLTextAreaElement;

    expect(hanziInput.value).toBe('你好');
    expect(pinyinInput.value).toBe('nǐ hǎo');
    expect(sinoVietInput.value).toBe('nhĩ hảo');
    expect(meaningInput.value).toBe('Xin chào');
    expect(notesInput.value).toBe('Câu chào hỏi thông dụng');
  });

  it('shows error if hanzi is submitted empty', () => {
    const handleUpdate = vi.fn();
    render(
      <EditWordModal
        isOpen={true}
        word={mockWord}
        onClose={vi.fn()}
        onUpdateWord={handleUpdate}
      />
    );

    const hanziInput = screen.getByLabelText(/Chữ Hán/i);
    fireEvent.change(hanziInput, { target: { value: '   ' } });

    const submitBtn = screen.getByRole('button', { name: /Lưu thay đổi/i });
    fireEvent.click(submitBtn);

    expect(screen.getByText('Vui lòng nhập chữ Hán')).toBeInTheDocument();
    expect(handleUpdate).not.toHaveBeenCalled();
  });

  it('calls onUpdateWord with updated fields and closes modal on valid submit', () => {
    const handleUpdate = vi.fn();
    const handleClose = vi.fn();

    render(
      <EditWordModal
        isOpen={true}
        word={mockWord}
        onClose={handleClose}
        onUpdateWord={handleUpdate}
      />
    );

    const meaningInput = screen.getByLabelText(/Ý nghĩa/i);
    fireEvent.change(meaningInput, { target: { value: 'Chào bạn (thân mật)' } });

    const notesInput = screen.getByLabelText(/Ghi chú/i);
    fireEvent.change(notesInput, { target: { value: 'Chào người cùng trang lứa' } });

    const submitBtn = screen.getByRole('button', { name: /Lưu thay đổi/i });
    fireEvent.click(submitBtn);

    expect(handleUpdate).toHaveBeenCalledWith(10, {
      hanzi: '你好',
      pinyin: 'nǐ hǎo',
      sinoVietnamese: 'nhĩ hảo',
      meaning: 'Chào bạn (thân mật)',
      notes: 'Chào người cùng trang lứa',
    });
    expect(handleClose).toHaveBeenCalled();
  });

  it('calls onClose when cancel or close button is clicked', () => {
    const handleClose = vi.fn();

    render(
      <EditWordModal
        isOpen={true}
        word={mockWord}
        onClose={handleClose}
        onUpdateWord={vi.fn()}
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

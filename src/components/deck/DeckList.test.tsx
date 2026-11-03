import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import DeckList from './DeckList';
import type { Deck } from '../../types';

describe('DeckList Component', () => {
  const dummyDecks: Deck[] = [
    {
      id: 1,
      title: 'HSK 1 Căn bản',
      description: 'Từ vựng HSK 1',
      createdAt: 1000,
      updatedAt: 1000,
      wordCount: 15,
    },
    {
      id: 2,
      title: 'Chữ Hán phổ dụng',
      description: 'Các từ thông dụng nhất',
      createdAt: 2000,
      updatedAt: 2000,
      wordCount: 30,
    },
  ];

  it('renders list of decks', () => {
    render(
      <DeckList
        decks={dummyDecks}
        onSelectDeck={vi.fn()}
        onOpenCreateModal={vi.fn()}
        onOpenImportModal={vi.fn()}
      />
    );
    expect(screen.getByText('HSK 1 Căn bản')).toBeInTheDocument();
    expect(screen.getByText(/15 từ/i)).toBeInTheDocument();
    expect(screen.getByText('Chữ Hán phổ dụng')).toBeInTheDocument();
    expect(screen.getByText(/30 từ/i)).toBeInTheDocument();
  });

  it('calls onSelectDeck when a deck card is clicked', () => {
    const handleSelect = vi.fn();
    render(
      <DeckList
        decks={dummyDecks}
        onSelectDeck={handleSelect}
        onOpenCreateModal={vi.fn()}
        onOpenImportModal={vi.fn()}
      />
    );

    fireEvent.click(screen.getByText('HSK 1 Căn bản'));
    expect(handleSelect).toHaveBeenCalledWith(dummyDecks[0]);
  });

  it('calls onOpenCreateModal when "Tạo bộ từ mới" is clicked', () => {
    const handleCreate = vi.fn();
    render(
      <DeckList
        decks={dummyDecks}
        onSelectDeck={vi.fn()}
        onOpenCreateModal={handleCreate}
        onOpenImportModal={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /tạo bộ từ mới/i }));
    expect(handleCreate).toHaveBeenCalledTimes(1);
  });

  it('calls onOpenImportModal when "Nhập Excel / CSV" is clicked', () => {
    const handleImport = vi.fn();
    render(
      <DeckList
        decks={dummyDecks}
        onSelectDeck={vi.fn()}
        onOpenCreateModal={vi.fn()}
        onOpenImportModal={handleImport}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /nhập excel \/ csv/i }));
    expect(handleImport).toHaveBeenCalledTimes(1);
  });

  it('renders empty state when decks list is empty', () => {
    render(
      <DeckList
        decks={[]}
        onSelectDeck={vi.fn()}
        onOpenCreateModal={vi.fn()}
        onOpenImportModal={vi.fn()}
      />
    );

    expect(screen.getByText(/chưa có bộ từ nào/i)).toBeInTheDocument();
  });
});

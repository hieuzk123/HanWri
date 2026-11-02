import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import WordContainer from './WordContainer';

vi.mock('hanzi-writer', () => ({
  default: {
    create: vi.fn(() => ({
      animateCharacter: vi.fn((opts) => opts?.onComplete && opts.onComplete()),
      pauseAnimation: vi.fn(),
      hideCharacter: vi.fn(),
      showOutline: vi.fn(),
      quiz: vi.fn(),
    })),
  },
}));

describe('WordContainer', () => {
  const testWord = {
    hanzi: '你好',
    pinyin: 'nǐ hǎo',
    meaning: 'Xin chào',
    sinoVietnamese: 'Nhĩ Hảo',
  };

  it('splits multi-character word into individual character tabs', () => {
    render(<WordContainer word={testWord} />);
    expect(screen.getByText('你')).toBeInTheDocument();
    expect(screen.getByText('好')).toBeInTheDocument();
    expect(screen.getByText('nǐ hǎo')).toBeInTheDocument();
    expect(screen.getByText(/Xin chào/i)).toBeInTheDocument();
    expect(screen.getByText('Nhĩ Hảo')).toBeInTheDocument();
  });

  it('switches active character when clicked', () => {
    render(<WordContainer word={testWord} />);
    const secondCharBtn = screen.getByText('好');
    fireEvent.click(secondCharBtn);
    expect(secondCharBtn.closest('button')).toHaveClass('border-chinese-red');
  });

  it('supports custom render slot via children', () => {
    render(
      <WordContainer word={testWord}>
        {(char, index) => (
          <div data-testid="custom-slot">
            Current: {char} at {index}
          </div>
        )}
      </WordContainer>
    );

    expect(screen.getByTestId('custom-slot')).toHaveTextContent('Current: 你 at 0');

    fireEvent.click(screen.getByText('好'));
    expect(screen.getByTestId('custom-slot')).toHaveTextContent('Current: 好 at 1');
  });

  it('does not render character selector tabs for single character word', () => {
    const singleWord = {
      hanzi: '学',
      pinyin: 'xué',
      meaning: 'Học',
    };

    render(
      <WordContainer word={singleWord}>
        {(char) => <div data-testid="char-view">{char}</div>}
      </WordContainer>
    );

    expect(screen.getByTestId('char-view')).toHaveTextContent('学');
    // Button tabs should not exist for single character
    const buttons = screen.queryAllByRole('button');
    expect(buttons).toHaveLength(0);
  });
});

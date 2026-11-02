import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import CharacterGrid from './CharacterGrid';

describe('CharacterGrid Component', () => {
  it('renders SVG with specified size', () => {
    const { container } = render(<CharacterGrid size={300} gridType="mizige" />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('width', '300');
    expect(svg).toHaveAttribute('height', '300');
  });

  it('renders diagonal lines for mizige grid', () => {
    const { container } = render(<CharacterGrid size={300} gridType="mizige" />);
    const diagonals = container.querySelectorAll('line.diagonal');
    expect(diagonals.length).toBe(2);
  });

  it('does not render diagonal lines for tianzige grid', () => {
    const { container } = render(<CharacterGrid size={300} gridType="tianzige" />);
    const diagonals = container.querySelectorAll('line.diagonal');
    expect(diagonals.length).toBe(0);
  });

  it('renders plain container when gridType is none', () => {
    const { container } = render(<CharacterGrid size={300} gridType="none" />);
    const svg = container.querySelector('svg');
    expect(svg).toBeNull();
    const div = container.firstElementChild;
    expect(div).toHaveStyle({ width: '300px', height: '300px' });
  });

  it('applies custom strokeColor and custom className', () => {
    const { container } = render(
      <CharacterGrid size={200} gridType="mizige" strokeColor="#123456" className="custom-class" />
    );
    const svg = container.querySelector('svg');
    expect(svg).toHaveClass('custom-class');
    const lines = container.querySelectorAll('line');
    lines.forEach((line) => {
      expect(line).toHaveAttribute('stroke', '#123456');
    });
  });
});

import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('App Scaffolding', () => {
  it('renders HanWri header', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: /HanWri/i })).toBeInTheDocument();
  });
});

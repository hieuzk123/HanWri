/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        chinese: {
          red: '#c0392b',
          crimson: '#962d22',
          gold: '#f39c12',
          paper: '#fcfaf2',
          ink: '#2c3e50',
          grid: '#e74c3c33',
        },
      },
    },
  },
  plugins: [],
};

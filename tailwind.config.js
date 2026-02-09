/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#22262D',
        secondary: '#3A3F46',
        accent: '#E4D4B5',
        sand: '#F0EBDF',
        muted: '#6A6A6A',
        border: '#A4A19A',
        hover: '#D6C3A1',
        divider: '#E8E2D8',
      },
    },
  },
  plugins: [],
};

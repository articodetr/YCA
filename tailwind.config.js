/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#0f1c2e',
        secondary: '#1a2d47',
        accent: '#0d9488',
        sand: '#f8fafb',
        muted: '#64748b',
        border: '#e2e8f0',
        hover: '#0f766e',
        divider: '#f1f5f9',
      },
      fontFamily: {
        sans: ['Cairo', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

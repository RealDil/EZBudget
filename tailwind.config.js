/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Display"',
          '"Segoe UI"',
          'Roboto',
          'sans-serif',
        ],
      },
      colors: {
        ios: {
          blue:   '#007AFF',
          green:  '#34C759',
          red:    '#FF3B30',
          orange: '#FF9500',
          yellow: '#FFCC00',
          pink:   '#FF2D55',
          gray:   '#8E8E93',
          bg:     '#F2F2F7',
        },
      },
      borderRadius: {
        xl2: '1.25rem',
      },
    },
  },
  plugins: [],
};

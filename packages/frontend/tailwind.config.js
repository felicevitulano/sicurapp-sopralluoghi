/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Palette SICUR.A.L.A.
        brand: {
          DEFAULT: '#18695A',
          dark: '#124B40',
          darker: '#175B4F',
          light: '#E8F4F1',
        },
        accent: {
          brown: '#554431',
          tan: '#eacb9c',
          beige: '#EFEBE5',
          warm: '#FAF8F6',
        },
        neutral: {
          bg: '#F8F7F5',
        },
        emphasis: '#3F3A64',
      },
      fontFamily: {
        sans: ['Roboto', 'system-ui', 'sans-serif'],
        serif: ['Roboto Slab', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
};

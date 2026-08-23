import type { Config } from 'tailwindcss';

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        gray: {
          50: '#f9f9f9',
          100: '#ececec',
          200: '#d9d9d9',
          300: '#b4b4b4',
          400: '#8e8e8e',
          500: '#676767',
          600: '#424242',
          700: '#383838',
          800: '#2f2f2f',
          850: '#212121',
          900: '#171717',
          950: '#0d0d0d',
        },
        brand: {
          50: '#ecfdf5',
          100: '#d1fae5',
          500: '#10a37f',
          600: '#059669',
          700: '#047857',
        },
      },
    },
  },
  plugins: [],
} satisfies Config;

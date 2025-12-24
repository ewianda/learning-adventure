import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        nunito: ['\"Nunito\"', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;

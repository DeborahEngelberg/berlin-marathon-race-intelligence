import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: '#1C69D4',
          light: '#4A8FE7',
          dark: '#1555B0',
        },
        'accent-red': '#E30613',
        surface: {
          light: '#F5F5F5',
          DEFAULT: '#EAEAEF',
          dark: '#1A1A1A',
          darker: '#111111',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;

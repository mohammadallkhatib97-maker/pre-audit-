/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './lib/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#fdfcf7',
          100: '#f9f6e8',
          200: '#f0e9c5',
          300: '#e4d48e',
          400: '#d4b84a',
          500: '#c9a227',
          600: '#a8841d',
          700: '#856618',
          800: '#634c13',
          900: '#42320d',
        },
        dark: {
          50:  '#f6f6f6',
          100: '#e7e7e7',
          200: '#d1d1d1',
          300: '#b0b0b0',
          400: '#888888',
          500: '#6d6d6d',
          600: '#5d5d5d',
          700: '#4f4f4f',
          800: '#454545',
          900: '#1a1a2e',
          950: '#0f0f1a',
        },
      },
      fontFamily: {
        sans:  ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Georgia', 'serif'],
        mono:  ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'luxury':    '0 4px 24px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)',
        'luxury-lg': '0 8px 48px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)',
        'gold':      '0 4px 24px rgba(201,162,39,0.15)',
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #c9a227 0%, #e4d48e 50%, #c9a227 100%)',
        'dark-gradient': 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
      },
      animation: {
        'fade-in':  'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
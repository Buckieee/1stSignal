/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#060E1A',
          900: '#0A1628',
          800: '#0F2039',
          700: '#152543',
          600: '#1E3254',
          500: '#274678',
        },
        ink: '#E8EDF4',
        slate: {
          DEFAULT: '#8BA3BE',
          muted: '#5A7A9A',
          dim: '#3D5A7A',
        },
        blue: {
          DEFAULT: '#3B82F6',
          bright: '#60A5FA',
          soft: '#1E3A6E',
          glow: '#3B82F620',
        },
        emerald: {
          DEFAULT: '#22C55E',
          soft: '#14532D',
          bg: '#0D2E1A',
        },
        red: {
          DEFAULT: '#EF4444',
          soft: '#450A0A',
          bg: '#2C0A0A',
        },
        amber: {
          DEFAULT: '#F59E0B',
          soft: '#451A03',
          bg: '#2C1500',
        },
        violet: {
          DEFAULT: '#A78BFA',
          soft: '#2E1065',
          bg: '#1E0A42',
        },
      },
      fontFamily: {
        serif: ['"Source Serif 4"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'Fira Code', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-in-right': 'slideInRight 0.3s cubic-bezier(0.16,1,0.3,1)',
        'count-up': 'countUp 0.6s ease-out',
        'bar-fill': 'barFill 0.8s ease-out',
      },
      keyframes: {
        fadeIn: { from: { opacity: 0, transform: 'translateY(4px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        slideInRight: { from: { transform: 'translateX(100%)' }, to: { transform: 'translateX(0)' } },
        barFill: { from: { width: '0%' }, to: {} },
      },
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        nature: {
          50: '#f2fbf5',
          100: '#e1f6e9',
          200: '#c5ebd4',
          300: '#97d9b6',
          400: '#63be91',
          500: '#3ba170',
          600: '#2c8259',
          700: '#256848',
          800: '#21533c',
          900: '#1d4432',
          950: '#0b261b',
        },
        safeguard: {
          amber: '#f59e0b',
          crimson: '#ef4444',
          cyan: '#06b6d4',
          indigo: '#6366f1'
        }
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
      }
    },
  },
  plugins: [],
}

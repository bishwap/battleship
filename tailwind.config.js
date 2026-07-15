/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ocean: '#020617',
        'ocean-light': '#0f172a',
        radar: '#0ea5e9',
        'radar-glow': '#7dd3fc',
        hit: '#ef4444',
        'hit-glow': '#fca5a5',
        miss: '#64748b',
        'miss-glow': '#94a3b8',
        ship: '#22c55e',
        'ship-glow': '#86efac',
        sunk: '#7f1d1d',
        'sunk-glow': '#f87171',
        grid: '#1e293b',
        muted: '#94a3b8',
        accent: '#38bdf8',
      },
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'],
      },
      animation: {
        sink: 'sink 0.6s ease-in forwards',
        splash: 'splash 0.4s ease-out forwards',
        explode: 'explode 0.3s ease-out forwards',
        'pulse-ring': 'pulse-ring 1.5s infinite',
      },
      keyframes: {
        sink: {
          '0%': { transform: 'translateY(0) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(10px) rotate(15deg)', opacity: '0.4' },
        },
        splash: {
          '0%': { transform: 'scale(0)', opacity: '0.8' },
          '100%': { transform: 'scale(1.5)', opacity: '0' },
        },
        explode: {
          '0%': { transform: 'scale(0.5)', opacity: '1' },
          '50%': { transform: 'scale(1.2)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '0.8' },
        },
        'pulse-ring': {
          '0%': { boxShadow: '0 0 0 0 rgba(56, 189, 248, 0.7)' },
          '70%': { boxShadow: '0 0 0 8px rgba(56, 189, 248, 0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(56, 189, 248, 0)' },
        },
      },
    },
  },
  plugins: [],
}


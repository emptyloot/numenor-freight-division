/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [ 
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary-dark': '#0B2545',
        'primary-light': '#4A6572',
        'off-white': '#EDF2F4',
        'accent': '#FFC107',
        'discord-blue': '#5865F2',
        'discord-blue-dark': '#4752C4',
        'gray': {
          100: '#f7fafc',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        },
        'red': {
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          900: '#7f1d1d',
        },
        'green': {
          500: '#22c55e',
        },
        'blue': {
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
      },
      borderRadius: {
        'lg': '0.5rem',
        'full': '9999px',
        'md': '0.375rem',
        '2xl': '1rem',
      },
      borderWidth: {
        '1': '1px',
        '2': '2px',
      },
    },
  },
  plugins: [],
}


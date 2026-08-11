/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './app.js'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ocean: {
          bg: '#020817',
          surface: '#0F172A',
          border: '#1E293B',
          primary: '#1E40AF',
          accent: '#3B82F6',
          highlight: '#0EA5E9',
          cta: '#F59E0B',
        },
      },
      fontFamily: {
        mono: ['Fira Code', 'monospace'],
        sans: ['Fira Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

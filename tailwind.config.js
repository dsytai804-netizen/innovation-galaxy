/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'galaxy-bg': '#0a0e27',
        'tech-blue': '#4A90E2',
        'scenario-green': '#50C878',
        'user-orange': '#FF9F40',
        'core-gold': '#FFD700',
      },
      fontFamily: {
        sans: ['Inter', 'SF Pro Text', 'PingFang SC', 'sans-serif'],
        mono: ['Fira Code', 'Monaco', 'monospace'],
      },
    },
  },
  plugins: [],
}

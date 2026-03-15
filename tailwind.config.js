/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Modern Dark color system
        'bg-deep': '#0A0A0A',
        'bg-base': '#121212',
        'bg-elevated': '#1E1E1E',
        'surface': '#2D2D2D',
        'text-primary': '#FAFAFA',
        'text-secondary': '#B3B3B3',
        'accent': '#6366F1',
        'accent-subtle': '#4F46E5',
        'accent-glow': 'rgba(99, 102, 241, 0.3)',
        'border': 'rgba(255, 255, 255, 0.08)',

        // Linear/Modern color system (legacy for gradual migration)
        'fg': '#EDEDEF',
        'fg-muted': '#8A8F98',
        'fg-subtle': 'rgba(255,255,255,0.60)',
        'accent-bright': '#6872D9',

        // Legacy colors (preserving for 3D universe compatibility)
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
      animation: {
        'shimmer': 'shimmer 1.5s infinite',
        'shine': 'shine 0.7s ease-out',
        'float': 'float 8s ease-in-out infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        shine: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-20px) rotate(1deg)' },
        },
      },
    },
  },
  plugins: [],
}

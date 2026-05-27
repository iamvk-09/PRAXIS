/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0A0A0F',
        surface: '#13131A',
        'surface-elevated': '#1C1C28',
        border: '#2A2A3D',
        primary: '#7C6AF7',
        'primary-hover': '#9B8FFF',
        success: '#34D399',
        warning: '#FBBF24',
        danger: '#F87171',
        'text-primary': '#F0F0FF',
        'text-secondary': '#9090B0',
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        mono: ['Space Grotesk', 'monospace'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
}

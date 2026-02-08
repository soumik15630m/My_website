/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#050608",
        surface: "#12151B",
        surfaceHighlight: "#1A1D23",
        primaryText: "#E6E8EB",
        secondaryText: "#9AA0A6",
        accent: "#8AB4F8",
        border: "rgba(255,255,255,0.08)",
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      }
    },
  },
  plugins: [
    require('tailwind-scrollbar')({ nocompatible: true }),
  ],
}

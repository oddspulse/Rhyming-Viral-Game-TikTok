/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          DEFAULT: '#0a0a0a',
          card: '#121212',
          border: '#1f1f1f',
        },
        neon: {
          pink: '#FF1CF7',
          blue: '#00F0FF',
          green: '#39FF14',
          yellow: '#FFFC00',
          purple: '#BC13FE',
        },
      },
    },
  },
  plugins: [],
}

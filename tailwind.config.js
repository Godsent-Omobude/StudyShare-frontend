/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#031B4E',
          blue: '#0A44A4',
          accent: '#1E64D6',
          light: '#F4F7FE'
        }
      }
    },
  },
  plugins: [],
}

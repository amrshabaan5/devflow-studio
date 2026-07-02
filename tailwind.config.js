/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // لازم تكون class مش 'media'
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
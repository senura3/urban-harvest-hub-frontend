/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        harvest: '#4a7c59',    // custom green
        'harvest-dark': '#385e43',
        earthen: '#c8a96e',    // custom amber
        'earthen-dark': '#b3945b',
        offwhite: '#f9f6f0',   // custom off-white
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        body: ['"DM Sans"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

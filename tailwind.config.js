/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        parch: { light: '#efe0b8', DEFAULT: '#e3cd9a', dark: '#c9ad72', deep: '#a98c50' },
        ink: { light: '#6b4f2a', DEFAULT: '#3b2a14', deep: '#241806' },
        gold: { light: '#f0d488', DEFAULT: '#c9a24a', dark: '#8a6a24' },
        rust: '#8a3b1e',
        sea: '#2e5f6b',
      },
      fontFamily: {
        display: ['Cinzel', 'serif'],
        body: ['"IM Fell English"', 'Georgia', 'serif'],
        accent: ['MedievalSharp', 'cursive'],
      },
    },
  },
  plugins: [],
};

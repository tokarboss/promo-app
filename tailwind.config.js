/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#0B0D10',
          card: '#13161B',
          elevated: '#1A1E26'
        },
        brand: {
          DEFAULT: '#4F7DF3',
          hover: '#3B68DF',
          soft: 'rgba(79, 125, 243, 0.14)'
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif']
      }
    }
  },
  plugins: []
};

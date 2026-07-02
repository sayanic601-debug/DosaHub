/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        saffron: {
          50: '#FDF4F0',
          100: '#FBE6DD',
          200: '#F6CEBF',
          300: '#EDA48E',
          400: '#E17253',
          500: '#D95D39', // Primary Terracotta
          600: '#C24724',
          700: '#A1371B',
          800: '#812E1A',
          900: '#69281A',
          950: '#39120B',
        },
        temple: {
          50: '#F2F7F4',
          100: '#E1EFE7',
          200: '#C4DEC2',
          300: '#99C4A9',
          400: '#69A380',
          500: '#1B4332', // Secondary Green
          600: '#2E5A44',
          700: '#224433',
          800: '#1B3529',
          900: '#152C22',
        },
        brass: {
          50: '#FBF8F2',
          100: '#F4ECE0',
          200: '#E7D8C0',
          300: '#D6BD96',
          400: '#C4A06F',
          500: '#E0A96D', // Golden Accent
          600: '#A37E52',
          700: '#85643F',
          800: '#6A4F32',
          900: '#4D3823',
        },
        coffee: {
          50: '#FAF8F6',
          100: '#F3EDE9',
          200: '#E3D3C9',
          300: '#CEB2A4',
          400: '#B58D7C',
          500: '#3E2723', // Dark Mode Base
          600: '#2D1A17',
          700: '#22110F',
          800: '#170A08',
          900: '#0C0302',
          950: '#060101',
        },
        cream: {
          50: '#FCFBF9',
          100: '#FAF8F5', // Light Mode Base
          200: '#F5EFE7',
          300: '#ECE2D3',
          400: '#DFCEB7',
          500: '#CDB494',
        }
      },
      fontFamily: {
        sans: ['var(--font-outfit)', 'Inter', 'sans-serif'],
        serif: ['var(--font-playfair)', 'Playfair Display', 'serif'],
      },
      boxShadow: {
        'premium': '0 10px 30px -10px rgba(217, 93, 57, 0.15)',
        'premium-lg': '0 20px 40px -15px rgba(217, 93, 57, 0.25)',
        'premium-green': '0 10px 30px -10px rgba(27, 67, 50, 0.15)',
      }
    },
  },
  plugins: [],
}

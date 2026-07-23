/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          main: '#3f51b5',
          light: '#757de8',
          dark: '#002984',
        },
        secondary: {
          main: '#f50057',
          light: '#ff5983',
          dark: '#bb002f',
        }
      }
    },
  },
  plugins: [],
}

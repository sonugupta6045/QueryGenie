/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['selector', '[data-theme="dark"]'],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: 'var(--color-bg)',
        surface: 'var(--color-surface)',
        'surface-secondary': 'var(--color-surface-secondary)',
        border: 'var(--color-border)',
        'text-primary': 'var(--color-text-primary)',
        'text-secondary': 'var(--color-text-secondary)',
        primary: {
          main: 'var(--color-primary-brand)',
          light: '#757de8',
          dark: 'var(--color-primary-hover)',
        },
        success: 'var(--color-success)',
        danger: 'var(--color-danger)',
      }
    },
  },
  plugins: [],
}

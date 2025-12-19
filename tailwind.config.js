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
          start: '#ef4444',
          end: '#b91c1c',
        },
      },
      screens: {
        'xxs': '197px',  // Breakpoint custom para pantallas > 196px
        'xs': '265px',   // Breakpoint custom para pantallas > 264px
      },
    },
  },
  plugins: [],
}

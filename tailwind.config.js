/* eslint-env node */
/** @type {import('tailwindcss').Config} */
module.exports = {
  prefix: "tw-",
  // Iwasang magbanggaan sa Quasar base styles.
  corePlugins: {
    preflight: false,
  },
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
    "./src/index.template.html",
  ],
  theme: {
    extend: {
      colors: {
        tindaTeal: "#0f766e",
        tindaTealDark: "#115e59",
        tindaAmber: "#f59e0b",
        tindaIndigo: "#6366f1",
      },
      borderRadius: {
        xl2: "18px",
      },
      fontFamily: {
        sari: ['"Baloo 2"', "Roboto", "sans-serif"],
      },
    },
  },
  plugins: [],
};

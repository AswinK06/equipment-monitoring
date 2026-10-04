/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./lib/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: "#0B1B47",
          navy2: "#12214F",
          mint: "#22E5A0",
          green: "#2FBF71",
          ink: "#0F1B3D",
        },
      },
    },
  },
  plugins: [],
};
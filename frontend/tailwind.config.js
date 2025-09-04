/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        wb: {
          black: "#0B0B0D",
          white: "#FFFFFF",
          gold: "#D4AF37",
          yellow: "#F5C542",
        },
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "Inter", "sans-serif"],
      },
      boxShadow: {
        gold: "0 10px 30px rgba(212,175,55,0.25)",
      }
    },
  },
  plugins: [],
}
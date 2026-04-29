/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: "#042f2e",     // Richer Deep Teal
          primary: "#059669",  // Emerald
          accent: "#fbbf24",   // Soft Gold
          surface: "#f8fafc",  // Premium Grey-White
          glass: "rgba(255, 255, 255, 0.7)",
        }
      },
      boxShadow: {
        'premium': '0 10px 40px -10px rgba(0, 0, 0, 0.05)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
      }
    },
  },
  plugins: [],
}
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: "#0B0F17",
          card: "#111827",
          border: "#1F2937",
          hover: "#1E293B",
          textPrimary: "#F9FAFB",
          textSecondary: "#9CA3AF"
        },
        brand: {
          blue: "#3B82F6",
          cyan: "#06B6D4",
          purple: "#8B5CF6",
          emerald: "#10B981"
        }
      }
    },
  },
  plugins: [],
}

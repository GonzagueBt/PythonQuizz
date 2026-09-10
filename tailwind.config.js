/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        mono: [
          "JetBrains Mono",
          "Fira Code",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "monospace",
        ],
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      colors: {
        brand: {
          50: "#eefcf6",
          100: "#d5f7e8",
          200: "#adeed4",
          300: "#79e0bc",
          400: "#43cb9e",
          500: "#20b085",
          600: "#148e6c",
          700: "#12715a",
          800: "#125a49",
          900: "#114a3d",
          950: "#062a22",
        },
      },
      animation: {
        "fade-in": "fadeIn 150ms ease-out",
        "pop-in": "popIn 180ms cubic-bezier(0.34,1.56,0.64,1)",
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        popIn: {
          from: { opacity: 0, transform: "scale(0.96)" },
          to: { opacity: 1, transform: "scale(1)" },
        },
      },
    },
  },
  plugins: [],
};

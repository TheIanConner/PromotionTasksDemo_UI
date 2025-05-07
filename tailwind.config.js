/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#0A0A0A",
        foreground: "#ffffff",
        card: "#111111",
        border: {
          DEFAULT: "#1f2937",
          hover: "#374151",
        },
      },
    },
  },
  plugins: [],
};

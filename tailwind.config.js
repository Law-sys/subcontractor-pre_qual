/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}", // adjust if needed
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#f0f2f9",
          100: "#e1e7f3",
          200: "#c3cfe7",
          300: "#a5b7db",
          400: "#879fcf",
          500: "#4361a3",
          600: "#1C295B",
          700: "#162244",
          800: "#101a33",
          900: "#0a1122",
        },
        secondary: {
          50: "#fafafa",
          100: "#f5f5f5",
          200: "#e5e5e5",
          300: "#d4d4d4",
          400: "#a3a3a3",
          500: "#737373",
          600: "#525252",
          700: "#404040",
          800: "#262626",
          900: "#171717",
        },
        success: {
          500: "#22c55e",
        },
      },
    },
  },
  plugins: [],
};

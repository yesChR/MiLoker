const defaultTheme = require('tailwindcss/defaultConfig');
const { heroui } = require("@heroui/react");
const { color } = require('framer-motion');

module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  important: true,
  theme: {
    extend: {
      colors: {
        azulOscuro: "#0D3858",
        primario: "#0b72eb",
        cabecera: "#d7e8ff",
      },
    },
  },
  darkMode: "class",
  plugins: [heroui()],  
};
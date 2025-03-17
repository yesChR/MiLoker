const defaultTheme = require('tailwindcss/defaultConfig');
const { heroui } = require("@heroui/react");

module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  important: true,
  theme: {
    ...defaultTheme,
    colors: {
      ...defaultTheme.colors,
      primary: "#3B81F6",
      white: '#ffffff',
      DEFAULT: "#1F2937",
      light: "#6C7281",
      azulOscuro: "#0D3858",
      gray: "#545454",
      danger: "#f31260",

      light: {
        DEFAULT: "#FAFBFC",
        lighter: "#F3F4F6",
      },
    },
    extend: {},
  },
  plugins: [heroui()],
}
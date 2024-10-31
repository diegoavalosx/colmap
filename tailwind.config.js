module.exports = {
  content: [
    "./src/**/*.{html,js,jsx,ts,tsx}", // Rutas de los archivos donde utilizarás Tailwind
  ],
  theme: {
    extend: {
      colors: {
        "hover-purple": "#7024e4", // Custom color name
      },
      fontFamily: {
        sans: ["Helvetica", "Arial", "sans-serif"], // Adding Helvetica as the primary font
      },
    },
  },
  plugins: [],
};

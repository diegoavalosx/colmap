module.exports = {
  content: [
    "./src/**/*.{html,js,jsx,ts,tsx}", // Rutas de los archivos donde utilizarás Tailwind
  ],
  theme: {
    extend: {
      colors: {
        "hover-purple": "#7024e4",
        "ooh-yeah-pink": "#ff7ccc",
      },
      fontFamily: {
        sans: ['"Helvetica Neue"', "Helvetica", "Arial", "sans-serif"],
      },
      borderRadius: {
        "custom-br": "9.5rem",
      },
    },
  },
  plugins: [],
};

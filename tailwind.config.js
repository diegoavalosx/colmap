module.exports = {
  content: [
    "./src/**/*.{html,js,jsx,ts,tsx}", // Rutas de los archivos donde utilizarás Tailwind
  ],
  theme: {
    extend: {
      colors: {
        "ooh-yeah-pink": "#E91E63",
        "deluxe-gray": "#f9f9f9",
        "deluxe-black": "#121212",
      },
      fontFamily: {
        sans: ['"Helvetica Neue"', "Helvetica", "Arial", "sans-serif"],
      },
      borderRadius: {
        "custom-br": "30rem",
      },

      animation: {
        fadeIn: "fadeIn 0.5s ease-in-out",
        slideUp: "slideUp 1s ease-in-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: 0 },
          "100%": { transform: "translateY(0)", opacity: 1 },
        },
      },
    },
  },
  plugins: [],
};

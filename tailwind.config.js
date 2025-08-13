module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          pink: "#f2133c"
        }
      },
      keyframes: {
        fadeIn: { "0%": { opacity: 0 }, "100%": { opacity: 1 } },
        fadeOut: { "0%": { opacity: 1 }, "100%": { opacity: 0 } }
      },
      animation: {
        fadeIn: "fadeIn 800ms ease-in forwards",
        fadeOut: "fadeOut 800ms ease-out forwards"
      }
    }
  },
  plugins: []
}
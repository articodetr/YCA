/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    // ✅ مهم: هذا هو اللي يحدد عرض الموقع مثل Bootstrap/Strive
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        sm: "1.5rem",
        lg: "2rem",
      },
      screens: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1140px",
        "2xl": "1320px",
      },
    },

    extend: {
      colors: {
        primary: "#22262D",
        secondary: "#3A3F46",
        accent: "#E4D4B5",
        sand: "#F0EBDF",
        muted: "#6A6A6A",
        border: "#A4A19A",
        hover: "#D6C3A1",
        divider: "#E8E2D8",
      },
    },
  },
  plugins: [],
};

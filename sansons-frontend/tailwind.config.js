/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./lib/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#ECE7DC",     // warm stone — primary background
        canvas2: "#E3DDCE",    // deeper stone — section alternation
        ink: "#15150F",        // near-black warm ink — primary text
        ink2: "#4A4A3F",       // muted ink — secondary text
        forest: "#1F3A2E",     // deep bottle green — primary brand / CTA
        forestLight: "#2E5443",
        brass: "#A8823C",      // brass/gold — accents, ratings, highlights
        brassLight: "#C9A96A",
        wine: "#7B2D3B",       // sale / discount accent
        line: "#D5CEBB",       // hairline borders
        paper: "#F7F4EC",      // card surfaces
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      borderRadius: {
        none: "0px",
        sm: "2px",
        DEFAULT: "3px",
        md: "4px",
        lg: "6px",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(21,21,15,0.04), 0 8px 24px -8px rgba(21,21,15,0.10)",
        lift: "0 20px 40px -16px rgba(21,21,15,0.22)",
      },
      transitionTimingFunction: {
        premium: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-400px 0" },
          "100%": { backgroundPosition: "400px 0" },
        },
      },
      animation: {
        fadeUp: "fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) both",
        shimmer: "shimmer 1.6s linear infinite",
      },
    },
  },
  plugins: [],
};

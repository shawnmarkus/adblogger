/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#030b10",
        panel: "#060f18",
        panel2: "#08141e",
        border1: "#0b2236",
        border2: "#12304a",
        accent: "#00ffe7",
        danger: "#ff3355",
        warn: "#ff6600",
        caution: "#ffcc00",
        info: "#8866ff",
        success: "#00e676",
        content: "#c0dce8",
        muted: "#3a6070",
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', "monospace"],
        ui: ["Rajdhani", "sans-serif"],
      },
      animation: {
        glow: "glow 2.5s infinite",
        blink: "blink 0.9s infinite",
        scan: "scan 2.5s linear infinite",
      },
      keyframes: {
        glow: {
          "0%, 100%": { boxShadow: "0 0 14px rgba(0,255,231,0.3)" },
          "50%": { boxShadow: "0 0 28px rgba(0,255,231,0.7)" },
        },
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.15" },
        },
        scan: {
          "0%": { marginLeft: "-25%" },
          "100%": { marginLeft: "125%" },
        },
      },
    },
  },
  plugins: [],
};

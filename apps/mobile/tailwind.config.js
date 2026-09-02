/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: "hsl(222, 47%, 7%)",
        surface: "hsl(222, 44%, 11%)",
        "surface-2": "hsl(220, 38%, 14%)",
        card: "hsl(222, 44%, 11%)",
        "card-foreground": "hsl(210, 40%, 98%)",
        primary: "hsl(162, 97%, 43%)",
        "primary-foreground": "hsl(222, 47%, 7%)",
        "primary-dim": "hsl(160, 80%, 35%)",
        secondary: "hsl(239, 84%, 67%)",
        "secondary-foreground": "hsl(210, 40%, 98%)",
        foreground: "hsl(210, 40%, 98%)",
        muted: "hsl(217, 32%, 17%)",
        "muted-foreground": "hsl(215, 20%, 45%)",
        border: "hsl(217, 32%, 17%)",
        success: "hsl(160, 84%, 39%)",
        warning: "hsl(38, 92%, 50%)",
        error: "hsl(0, 72%, 51%)",
        info: "hsl(217, 91%, 60%)",
      },
    },
  },
  plugins: [],
}

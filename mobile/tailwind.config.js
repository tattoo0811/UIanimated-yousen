/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Pop デザイン カラー
        "primary": "#FF7E5F",
        "primary-dark": "#E65A3E",
        "secondary": "#25f4f4",

        // 背景
        "background-cream": "#FFF9E6",
        "background-dark": "#1a1a1a",
        "surface-dark": "#2d2d2d",
        "surface-light": "#ffffff",

        // 五行カラー
        "gogyo-wood": "#A3E635",
        "gogyo-fire": "#FB7185",
        "gogyo-earth": "#FACC15",
        "gogyo-metal": "#E2E8F0",
        "gogyo-water": "#60A5FA",

        // アクセント
        "accent-cyan": "#00ffff",
        "accent-lime": "#ccff00",
      },
      fontFamily: {
        "display": ["SpaceMono"],
        "body": ["SpaceMono"],
      },
      borderRadius: {
        'pop': '2rem',
        'pop-lg': '3rem',
      },
    },
  },
  plugins: [],
}

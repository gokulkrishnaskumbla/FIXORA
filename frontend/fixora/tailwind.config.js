/** @type {import('tailwindcss').Config} */
import daisyui from "daisyui";

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  plugins: [daisyui],
  daisyui: {
    themes: [
      {
        light: {
          "primary": "#01257D",
          "secondary": "#00FFFF",
          "accent": "#00FFFF",
          "neutral": "#3d4451",
          "base-100": "#ffffff",
          "base-200": "#f9fafb",
          "base-300": "#f3f4f6",
          "info": "#3abff8",
          "success": "#36d399",
          "warning": "#fbbd23",
          "error": "#f87272",
        },
      },
      {
        dark: {
          "primary": "#01257D",
          "secondary": "#00FFFF",
          "accent": "#00FFFF",
          "neutral": "#2a2e37",
          "base-100": "#1d232a",
          "base-200": "#191e24",
          "base-300": "#15191e",
          "info": "#3abff8",
          "success": "#36d399",
          "warning": "#fbbd23",
          "error": "#f87272",
        },
      },
    ],
  },
}

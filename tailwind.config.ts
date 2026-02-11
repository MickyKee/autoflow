import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#7c3aed",
          hover: "#6d28d9",
          light: "#f5f3ff",
          muted: "#ddd6fe",
        },
      },
      animation: {
        "fade-in-up": "fadeInUp 0.4s ease-out forwards",
      },
    },
  },
  plugins: [],
};

export default config;

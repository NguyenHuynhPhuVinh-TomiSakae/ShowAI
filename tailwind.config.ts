import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      keyframes: {
        'data-flow-1': {
          '0%': { transform: 'translate(0, 0)' },
          '25%': { transform: 'translate(100%, 100%)' },
          '50%': { transform: 'translate(200%, 0)' },
          '75%': { transform: 'translate(100%, -100%)' },
          '100%': { transform: 'translate(0, 0)' }
        },
        'data-flow-2': {
          '0%': { transform: 'translate(100%, 100%)' },
          '25%': { transform: 'translate(0, 0)' },
          '50%': { transform: 'translate(-100%, 100%)' },
          '75%': { transform: 'translate(0, 200%)' },
          '100%': { transform: 'translate(100%, 100%)' }
        },
        'data-flow-3': {
          '0%': { transform: 'translate(50%, -50%)' },
          '25%': { transform: 'translate(150%, 50%)' },
          '50%': { transform: 'translate(50%, 150%)' },
          '75%': { transform: 'translate(-50%, 50%)' },
          '100%': { transform: 'translate(50%, -50%)' }
        },
        'data-flow-4': {
          '0%': { transform: 'translate(0, 100%)' },
          '25%': { transform: 'translate(100%, 0)' },
          '50%': { transform: 'translate(200%, 100%)' },
          '75%': { transform: 'translate(100%, 200%)' },
          '100%': { transform: 'translate(0, 100%)' }
        },
        'data-flow-5': {
          '0%': { transform: 'translate(100%, 0)' },
          '25%': { transform: 'translate(0, 100%)' },
          '50%': { transform: 'translate(-100%, 0)' },
          '75%': { transform: 'translate(0, -100%)' },
          '100%': { transform: 'translate(100%, 0)' }
        }
      },
      animation: {
        'data-flow-1': 'data-flow-1 15s infinite linear',
        'data-flow-2': 'data-flow-2 18s infinite linear',
        'data-flow-3': 'data-flow-3 20s infinite linear',
        'data-flow-4': 'data-flow-4 22s infinite linear',
        'data-flow-5': 'data-flow-5 25s infinite linear'
      }
    },
  },
  plugins: [],
};
export default config;

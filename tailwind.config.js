/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: '#1a1a1a',
        card: '#2a2a2a',
        ink: '#ffffff',
        muted: '#cccccc',
        accent: '#4a90e2',
        accent2: '#5ba0f2',
        danger: '#e74c3c',
        ok: '#2ecc71',
        line: '#333333',
        chip: '#2a2a2a',
      },
    },
  },
  plugins: [],
}


/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        scientific: {
          primary: "#0A5BFF",
          secondary: "#00A7A7",
          accent: "#7C5CFC",
          success: "#159947",
          warning: "#D99200",
          danger: "#D94343",
          bg: "#F7FAFC",
          surface: "#FFFFFF",
          text: "#102033",
          muted: "#66758A",
          border: "#E5EAF0",
          cyanLight: "#E8F8FA",
          blueLight: "#EBF3FF",
          purpleLight: "#F2EFFF",
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'monospace'],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(16, 32, 51, 0.05), 0 1px 2px -1px rgba(16, 32, 51, 0.05)',
        'premium': '0 4px 20px -2px rgba(10, 91, 255, 0.08), 0 2px 6px -1px rgba(16, 32, 51, 0.04)',
        'glass': '0 8px 32px 0 rgba(10, 91, 255, 0.06)',
        'card': '0 2px 10px rgba(0, 0, 0, 0.03), 0 0 1px rgba(0, 0, 0, 0.1)',
      }
    },
  },
  plugins: [],
}

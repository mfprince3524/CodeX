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
          bg: "#F4FAF9",
          surface: "#FFFFFF",
          surfaceSubtle: "#EEF7F6",
          text: "#122020",
          muted: "#5A6D6D",
          border: "#D8EAE8",
          borderLight: "#E8F4F3",
          primary: "#006B70",
          primaryHover: "#005559",
          primaryLight: "#E0F5F4",
          sidebarDark: "#002F32",
          sidebarActive: "#08474B",
          sidebarBorder: "#0C4346",
          sidebarText: "#D8ECEB",
          sidebarMuted: "#7FA8A8",
          tealAccent: "#00A896",
          tealLight: "#E2F6F5",
          tealBorder: "#BDEAE7",
          // Evidence classifications
          supporting: "#2E7D5B",
          supportingBg: "#EBF7F1",
          conflicting: "#C05621",
          conflictingBg: "#FEF4EC",
          inconclusive: "#4A5568",
          inconclusiveBg: "#EDF2F7",
        }
      },
      fontFamily: {
        sans: ['Inter', 'Plus Jakarta Sans', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'monospace'],
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(0, 47, 50, 0.04)',
        'card': '0 1px 3px 0 rgba(0, 47, 50, 0.05), 0 1px 2px -1px rgba(0, 47, 50, 0.05)',
        'cardHover': '0 4px 14px 0 rgba(0, 47, 50, 0.08)',
        'modal': '0 16px 36px -4px rgba(0, 47, 50, 0.18)',
      },
      borderRadius: {
        'academic': '12px',
      }
    },
  },
  plugins: [],
}

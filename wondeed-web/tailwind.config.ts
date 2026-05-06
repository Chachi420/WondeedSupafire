import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      colors: {
        // Wondeed brand — Lime + Charcoal
        brand: {
          50:  '#f7fee7',
          100: '#ecfccb',
          200: '#d9f99d',
          300: '#bef264',
          400: '#a3e635',
          500: '#84cc16',
          600: '#65a30d',
          700: '#4d7c0f',
          800: '#365314',
          900: '#1a2e05',
        },
        // Sidebar / charcoal
        sidebar: {
          DEFAULT: '#0a0a0a',
          2:       '#171717',
          fg:      '#d4d4d4',
          muted:   '#737373',
        },
        // Surface / page
        surface: '#ffffff',
        bg:      '#f7f8f5',
        border:  '#e7e7e2',
        'border-strong': '#d4d4d0',
        fg:      '#0a0a0a',
        'fg-muted':  '#525252',
        'fg-faint':  '#a3a3a3',
      },
      borderRadius: {
        sm:  '6px',
        DEFAULT: '10px',
        lg:  '14px',
        xl:  '18px',
      },
      boxShadow: {
        sm:  '0 1px 2px rgba(15,23,42,0.04), 0 1px 1px rgba(15,23,42,0.03)',
        DEFAULT: '0 1px 3px rgba(15,23,42,0.06), 0 4px 12px rgba(15,23,42,0.04)',
        lg:  '0 10px 30px rgba(15,23,42,0.08), 0 2px 6px rgba(15,23,42,0.04)',
        lime: '0 4px 12px rgba(132,204,22,0.4)',
      },
    },
  },
  plugins: [],
}

export default config

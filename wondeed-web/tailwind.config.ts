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
        serif: ['var(--font-fraunces)', 'Fraunces', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      colors: {
        // Wondeed brand — Persimmon + Plum (Paper & Signal identity)
        brand: {
          50:  '#FFF3EC',
          100: '#FFE4D3',
          200: '#FFC6A3',
          300: '#FF9E6B',
          400: '#FF7136',
          500: '#F04E23',
          600: '#D9431B',
          700: '#B23515',
          800: '#8A2A12',
          900: '#5C1E0E',
        },
        iris: {
          100: '#E4DCFF',
          400: '#9D86FF',
          500: '#6D4AFF',
          600: '#5836E0',
          900: '#241547',
        },
        gold: {
          400: '#FFB800',
          500: '#F59E0B',
        },
        // Sidebar / plum
        sidebar: {
          DEFAULT: '#1C1530',
          2:       '#2A2044',
          fg:      '#EDE8F7',
          muted:   '#9A8FB8',
        },
        // Surface / page
        surface: '#FFFDF8',
        bg:      '#FAF6EE',
        border:  '#E9E0D0',
        'border-strong': '#D9CCB2',
        fg:      '#1C1530',
        'fg-muted':  '#5F5570',
        'fg-faint':  '#A79CB8',
      },
      borderRadius: {
        sm:  '8px',
        DEFAULT: '12px',
        lg:  '18px',
        xl:  '26px',
      },
      boxShadow: {
        sm:  '0 1px 2px rgba(28,21,48,0.05), 0 1px 1px rgba(28,21,48,0.04)',
        DEFAULT: '0 1px 3px rgba(28,21,48,0.07), 0 6px 16px rgba(28,21,48,0.05)',
        lg:  '0 16px 40px rgba(28,21,48,0.10), 0 2px 6px rgba(28,21,48,0.05)',
        glow: '0 8px 24px rgba(240,78,35,0.35)',
      },
    },
  },
  plugins: [],
}

export default config

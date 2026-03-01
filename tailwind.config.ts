import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        primary: {
          50: '#fff1f4',
          100: '#ffe4ea',
          200: '#ffcad6',
          300: '#ffa0b8',
          400: '#ff6b93',
          500: '#FF5185',
          600: '#e6296b',
          700: '#c21d5a',
          800: '#a1194d',
          900: '#871845',
        },
      },
    },
  },
  plugins: [],
}
export default config

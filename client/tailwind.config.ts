import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      fontFamily: {
        Inter: ["var(--font-Inter)"],
        Noto_Sans_JP: ["var(--font-Noto_Sans_JP)"],
      },
      colors: {
        green1: '#4CAF4F',
        gray1: '#4D4D4D',
      },
    },
  },
  plugins: [],
}
export default config

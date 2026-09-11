import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cream: '#FBF6EC',
        ink: '#1A1A1A',
        primary: {
          DEFAULT: '#1F3D37',
          dark: '#16302B',
        },
      },
    },
  },
  plugins: [],
};

export default config;

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          navy:        '#00476b',
          'navy-dark': '#003552',
          'navy-mid':  '#005a87',
          mint:        '#a8ebbc',
          'mint-pale': '#e0f8eb',
          pink:        '#f2bbd6',
          'pink-pale': '#fce8f1',
          blue:        '#80d2e4',
          'blue-pale': '#d5f1f8',
          yellow:      '#efe98f',
          'yellow-pale':'#f9f7d3',
          peach:       '#fbbd80',
          'peach-pale': '#fde8ce',
          gray:        '#757575',
        },
        neutral: {
          50:  '#FAFAF9',
          100: '#F5F4F2',
          150: '#EFEDE9',
          200: '#E8E5E0',
          300: '#D4D0CA',
          400: '#A9A39B',
          500: '#78716C',
          600: '#57534E',
          700: '#44403C',
          800: '#292524',
          900: '#1C1917',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '20px',
      },
      boxShadow: {
        card:     '0 1px 3px 0 rgba(0,0,0,0.06), 0 1px 2px -1px rgba(0,0,0,0.04)',
        'card-md':'0 4px 12px -2px rgba(0,0,0,0.08), 0 2px 4px -2px rgba(0,0,0,0.04)',
        'card-lg':'0 8px 24px -4px rgba(0,0,0,0.10), 0 4px 8px -4px rgba(0,0,0,0.06)',
      },
    },
  },
  plugins: [],
};

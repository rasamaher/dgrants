const colors = require('tailwindcss/colors'); // eslint-disable-line @typescript-eslint/no-var-requires

module.exports = {
  purge: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  // Default theme: https://github.com/tailwindlabs/tailwindcss/blob/master/stubs/defaultConfig.stub.js#L7
  theme: {
    fontFamily: {
      sans: ['"Source Code Pro"', 'monospace'],
    },
    fontSize: {
      sm: ['100%', '150%'],
      md: ['100%', '150%'],
      lg: ['100%', '150%'],
      xl: ['110%', '150%'],
      xxl: ['110%', '150%'],
      headline: ['140%', '150%'],
    },
    colors: {
      transparent: 'transparent',
      white: '#ffffff',
      teal: '#02E2AC',
      pink: '#F3587D',
      'grey-100': '#E2E0E7',
      'grey-200': '#C4C1CF',
      'grey-300': '#A7A2B6',
      'grey-400': '#757087',
      'grey-500': '#0E0333',
    },
    stroke: {
      transparent: 'transparent',
      white: '#ffffff',
      teal: '#02E2AC',
      pink: '#F3587D',
      'grey-100': '#E2E0E7',
      'grey-200': '#C4C1CF',
      'grey-300': '#A7A2B6',
      'grey-400': '#757087',
      'grey-500': '#0E0333',
    },
    strokeWidth: {
      1: '1',
      2: '2',
      3: '3',
      4: '4',
    },
    boxShadow: {
      light: '0px 0px 40px 0px rgba(14, 3, 51, .1)',
      none: 'none',
    },
    extend: {
      cursor: {
        crosshair: 'crosshair',
        'zoom-in': 'zoom-in',
        copy: 'copy',
      },
    },
  },
  variants: {
    extend: {
      display: ['group-hover'],
      stroke: ['group-hover', 'hover'],
    },
  },
  plugins: [require('@tailwindcss/forms')],
};

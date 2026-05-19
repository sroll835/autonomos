/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#FFF8E6',
          100: '#FFEDB8',
          500: '#E8AA20',
          600: '#CC8F00',
          900: '#7A5500',
        },
        navy: {
          400: '#1A3A6B',
          500: '#0B1C3D',
          600: '#071428',
        },
        emergency: '#E83A20',
        'auto-success': '#1DB87A',
        'auto-warning': '#E87820',
        'auto-info': '#2E7DE0',
      },
      fontFamily: {
        'inter-regular': ['Inter_400Regular'],
        'inter-medium': ['Inter_500Medium'],
        'inter-semibold': ['Inter_600SemiBold'],
        'inter-bold': ['Inter_700Bold'],
      },
    },
  },
  plugins: [],
};

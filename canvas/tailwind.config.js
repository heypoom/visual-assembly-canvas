import {radixThemePreset} from 'radix-themes-tw'

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  presets: [radixThemePreset],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        mono: '"IBM Plex Mono", monospace',
      },
    },
  },
  plugins: [],
}

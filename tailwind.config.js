/** @type {import('tailwindcss').Config} */
// Design tokens lifted from the ASAŞ "Window Exchange Hub" demo
// (veronikavanivska.github.io/asas): navy + red palette, Inter, soft panels.
// The old "navy" key is kept (remapped) so existing text-navy-*/border-navy-*
// usages follow the new palette; "teal" usages were renamed to "accent".
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#1f3a5f',
          2: '#294f7d',
          soft: '#edf3f9',
          950: '#182f4d',
          900: '#182332',
          800: '#22364f',
          700: '#33485f',
          600: '#4a5d73',
          100: '#e1e7ed',
        },
        accent: {
          400: '#e4586a',
          500: '#d72638',
          600: '#bf1f31',
          700: '#a01a29',
          900: '#7f1521',
          soft: '#fff0f2',
        },
        ok: { DEFAULT: '#16825b', soft: '#edf9f4' },
        surface: { DEFAULT: '#ffffff', soft: '#f8fafc', bg: '#f5f7fa' },
        line: '#e1e7ed',
        muted: { DEFAULT: '#667789', 2: '#929eaa' },
      },
      fontFamily: {
        sans: ['"Inter"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        panel: '0 5px 18px rgba(28,48,70,.045)',
        pop: '0 12px 34px rgba(28,48,70,.07)',
        cta: '0 8px 20px rgba(215,38,56,.22)',
      },
      borderRadius: {
        panel: '17px',
      },
    },
  },
  plugins: [],
}

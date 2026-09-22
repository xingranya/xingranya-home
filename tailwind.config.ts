import type { Config } from 'tailwindcss';
import typography from '@tailwindcss/typography';

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{js,ts,jsx,tsx,md,html}'],
  theme: {
    extend: {
      colors: {
        paper: {
          light: '#FDF6F8',
          card: 'rgba(255, 255, 255, 0.88)',
          dark: '#0B111A',
          'dark-card': 'rgba(18, 27, 44, 0.82)',
          border: 'rgba(255, 192, 203, 0.55)',
          'dark-border': 'rgba(122, 40, 67, 0.45)',
        },
        sakura: {
          50: '#fff5f7',
          100: '#ffe4ea',
          200: '#ffc0cb',
          300: '#ffa8b8',
          400: '#ff8fa6',
          500: '#f4728d',
          600: '#e05676',
          700: '#c43d61',
          800: '#9d3252',
          900: '#7a2843',
          950: '#4a1628',
        },
      },
      borderRadius: {
        none: '0',
        xs: '0.1875rem', // 3px
        sm: '0.25rem', // 4px (徽标、小按钮)
        DEFAULT: '0.3125rem', // 5px (黄金微倒角)
        md: '0.375rem', // 6px (容器、卡片微倒角)
        lg: '0.5rem', // 8px (模态框、下拉面板)
        xl: '0.75rem', // 12px (抽屉、主卡片)
        '2xl': '1rem', // 16px (移动端自适应抽屉)
        full: '9999px',
      },
      fontFamily: {
        serif: ['var(--font-serif)'],
        sans: ['var(--font-sans)'],
        quote: ['var(--font-quote)'],
        mono: [
          '"JetBrains Mono"',
          '"Fira Code"',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          'monospace',
        ],
      },
      typography: () => ({
        paper: {
          css: {
            '--tw-prose-body': '#334155', // slate-700
            '--tw-prose-headings': '#0f172a', // slate-900
            '--tw-prose-lead': '#475569', // slate-600
            '--tw-prose-links': '#0f172a',
            '--tw-prose-bold': '#0f172a',
            '--tw-prose-counters': '#64748b', // slate-500
            '--tw-prose-bullets': '#94a3b8', // slate-400
            '--tw-prose-hr': '#e2e8f0', // slate-200
            '--tw-prose-quotes': '#334155',
            '--tw-prose-quote-borders': '#cbd5e1', // slate-300
            '--tw-prose-captions': '#64748b',
            '--tw-prose-code': '#0f172a',
            '--tw-prose-pre-code': '#f8fafc', // slate-50
            '--tw-prose-pre-bg': '#0f172a',
            '--tw-prose-th-borders': '#cbd5e1',
            '--tw-prose-td-borders': '#e2e8f0',
            '--tw-prose-invert-body': '#cbd5e1',
            '--tw-prose-invert-headings': '#f8fafc',
            '--tw-prose-invert-lead': '#94a3b8',
            '--tw-prose-invert-links': '#f8fafc',
            '--tw-prose-invert-bold': '#f8fafc',
            '--tw-prose-invert-counters': '#94a3b8',
            '--tw-prose-invert-bullets': '#475569',
            '--tw-prose-invert-hr': '#334155',
            '--tw-prose-invert-quotes': '#cbd5e1',
            '--tw-prose-invert-quote-borders': '#334155',
            '--tw-prose-invert-captions': '#94a3b8',
            '--tw-prose-invert-code': '#f8fafc',
            '--tw-prose-invert-pre-code': '#cbd5e1',
            '--tw-prose-invert-pre-bg': '#0b111a',
            '--tw-prose-invert-th-borders': '#334155',
            '--tw-prose-invert-td-borders': '#334155',
            maxWidth: '65ch',
            lineHeight: '1.85',
            letterSpacing: '0.015em',
            fontSize: '1.03rem',
            blockquote: {
              fontStyle: 'italic',
              fontWeight: '400',
              borderLeftWidth: '2px',
              borderLeftColor: 'var(--tw-prose-quote-borders)',
              paddingLeft: '1.25rem',
            },
            h1: {
              fontFamily: 'MiSans, "MiSans Normal", "MiSans-Normal", "MiSans VF", sans-serif',
              fontWeight: '600',
              letterSpacing: '-0.02em',
            },
            h2: {
              fontFamily: 'MiSans, "MiSans Normal", "MiSans-Normal", "MiSans VF", sans-serif',
              fontWeight: '600',
              letterSpacing: '-0.015em',
            },
            h3: {
              fontFamily: 'MiSans, "MiSans Normal", "MiSans-Normal", "MiSans VF", sans-serif',
              fontWeight: '600',
            },
            code: {
              fontFamily:
                '"JetBrains Mono", "Fira Code", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
              fontWeight: '500',
              fontSize: '0.875em',
              padding: '0.2em 0.4em',
              borderRadius: '0.25rem',
              backgroundColor: 'rgba(100, 116, 139, 0.12)',
            },
            'code::before': {
              content: '""',
            },
            'code::after': {
              content: '""',
            },
            'pre code': {
              backgroundColor: 'transparent !important',
              padding: '0 !important',
              borderRadius: '0 !important',
              fontWeight: 'inherit !important',
              fontSize: 'inherit !important',
            },
            'pre code span': {
              backgroundColor: 'transparent !important',
              padding: '0 !important',
              borderRadius: '0 !important',
            },
          },
        },
      }),
    },
  },
  plugins: [typography],
};

export default config;

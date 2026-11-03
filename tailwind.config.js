/**
 * VortexAI - Tailwind CSS configuration
 * ----------------------------------------------------------------------------
 * Design system overview
 *   midnight : cool neutral scale (950 = #0B0F19 is the dark-mode page background)
 *   volt     : Electric Emerald accent  (500 = #10B981)
 *   cyber    : Cyber Purple accent      (500 = #8B5CF6)
 * Primary brand gradient: volt -> cyber (see `bg-vortex-gradient`).
 *
 * Rebuild the stylesheet after editing this file:  npm install && npm run build
 */
const plugin = require('tailwindcss/plugin');

module.exports = {
  darkMode: 'class',                                   // dark mode is switched by the "dark" class on <html>
  content: ['./*.html', './assets/js/app.js'],        // every file that contains Tailwind class names

  theme: {
    extend: {
      /* ---------- Colour palette ---------- */
      colors: {
        midnight: {
          50: '#F5F7FA', 100: '#EAEEF4', 200: '#D5DCE7', 300: '#B3BFD0', 400: '#8493AB', 500: '#5F6E89',
          600: '#465470', 700: '#343F57', 800: '#1E2638', 900: '#131A29', 950: '#0B0F19',
        },
        volt: {
          50: '#E9FEF6', 100: '#C9FBE8', 200: '#98F5D2', 300: '#5BEBB8', 400: '#27D99C', 500: '#10B981',
          600: '#0A9468', 700: '#0B7654', 800: '#0D5E44', 900: '#0C4C39', 950: '#032B21',
        },
        cyber: {
          50: '#F5F2FF', 100: '#EBE5FF', 200: '#D9CEFF', 300: '#BDA9FD', 400: '#A07DFA', 500: '#8B5CF6',
          600: '#7840E8', 700: '#6530CC', 800: '#5329A5', 900: '#422383', 950: '#281456',
        },
      },

      /* ---------- Typography ----------
         System stacks keep the template 100% offline. To use a web font, self-host it and put its
         name first in `display` / `sans` (for example '"Sora"' for headings). */
      fontFamily: {
        sans: ['ui-sans-serif', 'system-ui', '-apple-system', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', 'sans-serif'],
        display: ['ui-rounded', '"SF Pro Rounded"', 'ui-sans-serif', 'system-ui', '"Segoe UI"', 'sans-serif'],
        mono: ['ui-monospace', '"SF Mono"', '"Cascadia Code"', 'Menlo', 'Consolas', 'monospace'],
      },
      fontSize: {
        'display-xl': ['3.5rem', { lineHeight: '1.05', letterSpacing: '-0.035em', fontWeight: '800' }],
        'display-lg': ['2.5rem', { lineHeight: '1.1', letterSpacing: '-0.03em', fontWeight: '800' }],
        'display-md': ['1.875rem', { lineHeight: '1.2', letterSpacing: '-0.025em', fontWeight: '700' }],
        eyebrow: ['0.6875rem', { lineHeight: '1rem', letterSpacing: '0.08em', fontWeight: '600' }],
      },
      letterSpacing: { tightest: '-0.045em' },

      /* ---------- Decorative shadows ---------- */
      boxShadow: {
        card: '0 1px 2px rgb(11 15 25 / 0.04), 0 10px 28px -12px rgb(11 15 25 / 0.12)',
        'card-lg': '0 2px 4px rgb(11 15 25 / 0.05), 0 24px 48px -20px rgb(11 15 25 / 0.22)',
        float: '0 18px 40px -12px rgb(11 15 25 / 0.35)',
        'glow-volt': '0 0 0 1px rgb(16 185 129 / 0.35), 0 8px 28px -4px rgb(16 185 129 / 0.45)',
        'glow-cyber': '0 0 0 1px rgb(139 92 246 / 0.35), 0 8px 28px -4px rgb(139 92 246 / 0.45)',
        neon: '0 0 0 1px rgb(16 185 129 / 0.5), 0 0 22px rgb(16 185 129 / 0.35), 0 0 52px rgb(139 92 246 / 0.25)',
        'inner-glow': 'inset 0 1px 0 rgb(255 255 255 / 0.12), inset 0 0 24px rgb(16 185 129 / 0.08)',
      },

      /* ---------- Background images ---------- */
      backgroundImage: {
        'vortex-gradient': 'linear-gradient(135deg, #0A9468 0%, #8B5CF6 100%)',
        'vortex-radial': 'radial-gradient(60% 60% at 50% 0%, rgb(16 185 129 / 0.22) 0%, rgb(139 92 246 / 0.12) 45%, transparent 100%)',
        'grid-fade': 'linear-gradient(to right, rgb(148 163 184 / 0.08) 1px, transparent 1px), linear-gradient(to bottom, rgb(148 163 184 / 0.08) 1px, transparent 1px)',
      },
      backgroundSize: { grid: '32px 32px' },

      /* ---------- Motion ---------- */
      transitionTimingFunction: { 'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)' },
      keyframes: {
        'gradient-shift': { '0%, 100%': { backgroundPosition: '0% 50%' }, '50%': { backgroundPosition: '100% 50%' } },
        'glow-pulse': { '0%, 100%': { opacity: '0.55' }, '50%': { opacity: '1' } },
        'neon-pulse': {
          '0%': { boxShadow: '0 0 0 0 rgb(16 185 129 / 0.55)' },
          '70%': { boxShadow: '0 0 0 10px rgb(16 185 129 / 0)' },
          '100%': { boxShadow: '0 0 0 0 rgb(16 185 129 / 0)' },
        },
        float: { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
        'slide-up': { '0%': { opacity: '0', transform: 'translateY(14px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        'slide-in-right': { '0%': { opacity: '0', transform: 'translateX(100%)' }, '100%': { opacity: '1', transform: 'translateX(0)' } },
        'fade-in': { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        orbit: { '0%': { transform: 'rotate(0deg)' }, '100%': { transform: 'rotate(360deg)' } },
      },
      animation: {
        'gradient-shift': 'gradient-shift 10s ease infinite',
        'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
        'neon-pulse': 'neon-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        float: 'float 6s ease-in-out infinite',
        'slide-up': 'slide-up 0.55s cubic-bezier(0.16, 1, 0.3, 1) both',          // use with [animation-delay:Nms] to stagger lists
        'slide-in-right': 'slide-in-right 0.45s cubic-bezier(0.16, 1, 0.3, 1) both', // slide-over panels and toasts
        'fade-in': 'fade-in 0.4s ease-out both',
        shimmer: 'shimmer 2.5s linear infinite',
        orbit: 'orbit 18s linear infinite',
      },
    },
  },

  plugins: [
    /* Small custom utilities used by the dashboard */
    plugin(function ({ addUtilities }) {
      addUtilities({
        '.scrollbar-subtle': { 'scrollbar-width': 'thin', 'scrollbar-color': 'rgb(132 147 171 / 0.4) transparent' },
        '.bg-grid': { 'background-image': 'var(--tw-bg-grid, linear-gradient(to right, rgb(148 163 184 / 0.08) 1px, transparent 1px), linear-gradient(to bottom, rgb(148 163 184 / 0.08) 1px, transparent 1px))', 'background-size': '32px 32px' },
        '.tabular': { 'font-variant-numeric': 'tabular-nums' },
      });
    }),
  ],
};

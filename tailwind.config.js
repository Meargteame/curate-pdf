/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          DEFAULT: '#0F3D2E',
          50: '#F0F6F3',
          100: '#E0EDE6',
          200: '#C2DCCF',
          300: '#95C1AD',
          400: '#5F9F83',
          500: '#3A7D5F',
          600: '#2A6148',
          700: '#1F4B38',
          800: '#173D2D',
          900: '#0F3D2E',
          950: '#07241A',
        },
        sage: {
          DEFAULT: '#3A7D5F',
          light: '#569C7B',
          dark: '#2A6148',
        },
        mint: {
          DEFAULT: '#A7C957',
          light: '#C4E17F',
          dark: '#8BAF3F',
          subtle: '#F3F8E9',
        },
        paper: {
          DEFAULT: '#F7F6F2',
          warm: '#F7F6F2',
          subtle: '#F0F0E9',
          border: '#E5E7EB',
        },
        ink: {
          DEFAULT: '#1F2937',
          light: '#374151',
          subtle: '#4B5563',
          muted: '#6B7280',
        },
        slate: {
          DEFAULT: '#6B7280',
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          subtle: '#F0F0E9',
          muted: '#F7F6F2',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Sora', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        'doc': '0 4px 20px -2px rgba(15, 61, 46, 0.08), 0 2px 6px -1px rgba(0, 0, 0, 0.04)',
        'doc-lg': '0 12px 36px -4px rgba(15, 61, 46, 0.12), 0 4px 12px -2px rgba(0, 0, 0, 0.05)',
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.04)',
        'card-hover': '0 6px 16px -2px rgba(15, 61, 46, 0.06), 0 2px 6px -1px rgba(0, 0, 0, 0.04)',
        'sheet': '0 1px 3px rgba(0,0,0,0.05), 0 20px 40px -15px rgba(15, 61, 46, 0.15)',
      },
      borderRadius: {
        'card': '12px',
        'sheet': '4px',
      }
    },
  },
  plugins: [],
}

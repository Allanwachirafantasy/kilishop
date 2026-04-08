/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FF6B2B',
          dark: '#E55A1F',
          light: '#FF8C5A',
          50: 'rgba(255,107,43,0.05)',
          100: 'rgba(255,107,43,0.1)',
          200: 'rgba(255,107,43,0.2)',
          400: 'rgba(255,107,43,0.4)',
        },
        accent: {
          DEFAULT: '#FFB800',
          dark: '#E6A600',
        },
        kili: {
          bg: '#0A0A0F',
          card: '#141418',
          elevated: '#1C1C24',
          border: 'rgba(255,255,255,0.08)',
          fg: '#F8F8F8',
          muted: '#A0A0B0',
          subtle: '#5A5A70',
        },
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        display: ['Fraunces', 'serif'],
      },
      borderRadius: {
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '24px',
      },
      boxShadow: {
        'glow': '0 0 20px -5px rgba(255, 107, 43, 0.5)',
        'glow-lg': '0 0 40px -10px rgba(255, 107, 43, 0.4)',
        'card': '0 4px 20px rgba(0,0,0,0.3)',
        'card-hover': '0 20px 40px -15px rgba(0,0,0,0.5), 0 0 20px -10px rgba(255,107,43,0.2)',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #FF6B2B 0%, #FFB800 100%)',
        'gradient-hero': 'linear-gradient(135deg, rgba(255,107,43,0.15) 0%, rgba(255,184,0,0.05) 100%)',
        'gradient-card': 'linear-gradient(180deg, transparent 40%, rgba(10,10,15,0.95) 100%)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 4s ease-in-out infinite',
        'shimmer': 'shimmer 1.5s infinite',
        'fade-in-up': 'fadeInUp 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards',
        'fade-in': 'fadeIn 0.4s ease forwards',
        'slide-right': 'slideInRight 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideInRight: {
          from: { opacity: '0', transform: 'translateX(20px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
      },
      screens: {
        'xs': '375px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
    },
  },
  plugins: [],
};
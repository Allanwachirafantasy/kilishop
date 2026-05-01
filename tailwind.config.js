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
          DEFAULT: '#F97316',
          dark: '#EA6C0A',
          light: '#FB923C',
          50: 'rgba(249,115,22,0.05)',
          100: 'rgba(249,115,22,0.1)',
          200: 'rgba(249,115,22,0.2)',
          400: 'rgba(249,115,22,0.4)',
        },
        accent: {
          DEFAULT: '#D97706',
          dark: '#B45309',
        },
        kili: {
          bg: '#F5F5F5',
          card: '#FFFFFF',
          elevated: '#EEEEEE',
          border: 'rgba(0,0,0,0.08)',
          fg: '#111111',
          muted: '#555555',
          subtle: '#999999',
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
        'glow': '0 0 20px -5px rgba(249, 115, 22, 0.3)',
        'glow-lg': '0 0 40px -10px rgba(249, 115, 22, 0.25)',
        'card': '0 2px 12px rgba(0,0,0,0.08)',
        'card-hover': '0 8px 30px rgba(0,0,0,0.12), 0 0 0 1px rgba(249,115,22,0.15)',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #F97316 0%, #D97706 100%)',
        'gradient-hero': 'linear-gradient(135deg, rgba(249,115,22,0.08) 0%, rgba(217,119,6,0.04) 100%)',
        'gradient-card': 'linear-gradient(180deg, transparent 40%, rgba(245,245,245,0.95) 100%)',
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
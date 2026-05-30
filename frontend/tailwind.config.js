module.exports = {
  content: [
    './src/**/*.{js,jsx}',
    './public/index.html'
  ],
  theme: {
    extend: {
      colors: {
        milk: '#F5EDE0',
        cream: '#FAF6F0',
        tea: {
          DEFAULT: '#6B5344',
          dark: '#4A3829',
          light: '#8B6F47',
          muted: '#A68B6F'
        },
        brew: {
          gold: '#C9A227',
          caramel: '#D4A574',
          foam: '#E8D5B7'
        },
        /* legacy aliases — admin components */
        teaLight: '#D4A574',
        surface: {
          DEFAULT: '#FFFFFF',
          soft: '#F8F4EF',
          border: '#E8DFD4'
        }
      },
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        display: ['"Fraunces"', 'Georgia', 'serif']
      },
      boxShadow: {
        soft: '0 4px 24px -4px rgba(107, 83, 68, 0.12)',
        card: '0 8px 32px -8px rgba(74, 56, 41, 0.15)',
        glow: '0 0 40px -8px rgba(212, 165, 116, 0.45)',
        nav: '0 4px 20px rgba(74, 56, 41, 0.2)'
      },
      borderRadius: {
        '4xl': '2rem'
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.35s ease-out',
        'float': 'float 6s ease-in-out infinite'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' }
        }
      }
    }
  },
  plugins: []
};

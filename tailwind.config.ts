import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        duo: {
          green: '#58CC02',
          greendark: '#46A302',
          greenlight: '#D7FFB8',
          blue: '#1CB0F6',
          bluedark: '#1899D6',
          bluelight: '#DDF4FF',
          red: '#FF4B4B',
          reddark: '#EA2B2B',
          redlight: '#FFDFE0',
          yellow: '#FFC800',
          yellowdark: '#E6AC00',
          yellowlight: '#FFF4CC',
          purple: '#CE82FF',
          purpledark: '#A568CC',
          purplelight: '#F7E8FF',
          ink: '#4B4B4B',
          gray: '#AFAFAF',
          night: {
            900: '#0F181F',
            800: '#131F24',
            700: '#1B2A32',
            600: '#233944',
            border: '#2E4A57'
          }
        }
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Ubuntu', 'sans-serif']
      },
      keyframes: {
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%': { transform: 'translateX(-8px)' },
          '40%': { transform: 'translateX(8px)' },
          '60%': { transform: 'translateX(-5px)' },
          '80%': { transform: 'translateX(5px)' }
        },
        popin: {
          '0%': { transform: 'scale(.85)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        },
        slideup: {
          '0%': { transform: 'translateY(24px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        floaty: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        fall: {
          '0%': { transform: 'translateY(-10vh) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(110vh) rotate(720deg)', opacity: '0' }
        },
        pulsering: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(88,204,2,.45)' },
          '50%': { boxShadow: '0 0 0 12px rgba(88,204,2,0)' }
        }
      },
      animation: {
        shake: 'shake .45s ease',
        popin: 'popin .25s ease-out',
        slideup: 'slideup .35s ease-out',
        floaty: 'floaty 4s ease-in-out infinite',
        fall: 'fall linear forwards',
        pulsering: 'pulsering 1.6s ease-in-out infinite'
      }
    }
  },
  plugins: []
}

export default config

module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}'
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        fill: {
          transparent: 'var(--fill-transparent, rgba(0,0,0,0))',
          'transparent-hover': 'var(--fill-transparent-hover, rgba(0,0,0,0.05))',
          'transparent-active': 'var(--fill-transparent-active, rgba(0,0,0,0.1))',
          success: 'var(--fill-success, rgb(34, 197, 94))',
          'success-hover': 'var(--fill-success-hover, rgb(22, 163, 74))',
          'success-active': 'var(--fill-success-active, rgb(21, 128, 61))',
        },
        'success-on-bg-fill': 'var(--success-on-bg-fill, white)',
        'primary': 'var(--primary, rgb(59, 130, 246))',
      },
      backgroundColor: {
        'fill-transparent': 'var(--fill-transparent, rgba(0,0,0,0))',
        'fill-transparent-hover': 'var(--fill-transparent-hover, rgba(0,0,0,0.05))',
        'fill-transparent-active': 'var(--fill-transparent-active, rgba(0,0,0,0.1))',
        'fill-success': 'var(--fill-success, rgb(34, 197, 94))',
        'fill-success-hover': 'var(--fill-success-hover, rgb(22, 163, 74))',
        'fill-success-active': 'var(--fill-success-active, rgb(21, 128, 61))',
      },
      textColor: {
        'primary': 'var(--primary, rgb(59, 130, 246))',
        'success-on-bg-fill': 'var(--success-on-bg-fill, white)',
      },
      borderColor: {
        'primary': 'var(--primary, rgb(59, 130, 246))',
      },
      spacing: {
        '1': '0.25rem',
        '2': '0.5rem',
        '3': '0.75rem',
        '4': '1rem',
        '5': '1.25rem',
        '6': '1.5rem',
      },
      transitionDuration: {
        '100': '100ms',
        '200': '200ms',
      },
    },
  },
  plugins: [],
}

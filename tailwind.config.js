/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./templates/**/*.html",
    "./static/js/**/*.js"
  ],
  theme: {
    extend: {
      colors: {
        background:            'hsl(var(--background))',
        foreground:            'hsl(var(--foreground))',
        card:                  'hsl(var(--card))',
        'card-foreground':     'hsl(var(--card-foreground))',
        primary:               'hsl(var(--primary))',
        'primary-foreground':  'hsl(var(--primary-foreground))',
        secondary:             'hsl(var(--secondary))',
        'secondary-foreground':'hsl(var(--secondary-foreground))',
        muted:                 'hsl(var(--muted))',
        'muted-foreground':    'hsl(var(--muted-foreground))',
        accent:                'hsl(var(--accent))',
        'accent-foreground':   'hsl(var(--accent-foreground))',
        border:                'hsl(var(--border))',
        input:                 'hsl(var(--input))',
        ring:                  'hsl(var(--ring))',
        gold:                  'hsl(var(--gold))',
        bronze:                'hsl(var(--bronze))',
        terracotta:            'hsl(var(--terracotta))',
      },
      fontFamily: {
        sans:    ['Inter', 'sans-serif'],
        display: ['Fraunces', 'serif'],
      }
    }
  },
  plugins: [],
}

import type { Config } from "tailwindcss";
import daisyui from "daisyui"

// globals.css stores each colour as an RGB triplet so opacity modifiers such as bg-ink/10 work.
const token = (name: string) => `rgb(var(--c-${name}) / <alpha-value>)`;

export default {
    darkMode: ["class"],
    content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		fontFamily: {
  			sans: ['var(--font-landing-sans)', 'Arial', 'Helvetica', 'sans-serif'],
  			display: ['var(--font-landing-display)', 'Arial', 'Helvetica', 'sans-serif'],
  			mono: ['var(--font-geist-mono)', 'ui-monospace', 'monospace']
  		},
  		colors: {
  			paper: token('paper'),
  			raised: token('raised'),
  			line: token('line'),
  			ink: {
  				DEFAULT: token('ink'),
  				soft: token('ink-soft'),
  				faint: token('ink-faint')
  			},
  			'on-ink': token('on-ink'),
  			brand: {
  				DEFAULT: token('brand'),
  				text: token('accent')
  			},
  			danger: token('danger'),
  			sheet: {
  				DEFAULT: token('sheet'),
  				raised: token('sheet-raised'),
  				line: token('sheet-line'),
  				edge: token('sheet-edge'),
  				text: token('sheet-text'),
  				soft: token('sheet-soft')
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	}
  },
  plugins: [
    daisyui,
      require("tailwindcss-animate")
],
} satisfies Config;

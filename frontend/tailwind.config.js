/** @type {import('tailwindcss').Config} */
import { colors, typeScale } from './src/theme/tokens.ts';

// -----------------------------------------------------------------------------
// Tema Material Design 3. As cores e a tipografia ficam em src/theme/tokens.ts;
// aqui elas viram classes (`bg-primary`, `text-body-medium`), junto com a escala
// de formas (cantos) e a elevação.
// -----------------------------------------------------------------------------
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors,
      fontFamily: {
        sans: ['Roboto', 'system-ui', 'Segoe UI', 'sans-serif'],
        mono: ['"Roboto Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      fontSize: typeScale,
      borderRadius: {
        xs: '4px', // campos de texto
        DEFAULT: '8px', // etiquetas, alertas, notificações
        sm: '8px',
        md: '12px', // cards
        lg: '16px', // painéis flutuantes
        xl: '28px', // diálogos
      },
      boxShadow: {
        // Superfícies se diferenciam pela cor; sombra só no que flutua de fato
        // (diálogo, notificação, painel).
        flyout: '0 2px 6px 2px rgb(31 31 31 / 0.15), 0 1px 2px 0 rgb(31 31 31 / 0.3)',
      },
    },
  },
  plugins: [],
};

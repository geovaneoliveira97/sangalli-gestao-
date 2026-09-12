/** @type {import('tailwindcss').Config} */
// -----------------------------------------------------------------------------
// Design tokens — Sangalli Gestão
//
// Identidade visual própria para um sistema de oficina mecânica e funilaria:
// tudo o que define a "cara" do produto (cor, tipografia, raio de borda) fica
// centralizado neste arquivo. Para reskinar o sistema inteiro, mexa só aqui.
//
// - `brand`  → cor primária: laranja-ferrugem ("primer"), referência ao
//              ambiente automotivo sem cair no azul/roxo genérico de SaaS.
// - `slate`  → escala neutra sobrescrita: grafite quente (não o cinza-azulado
//              padrão do Tailwind), para fugir do visual "admin template".
// - `status` → cores semânticas fixas: sucesso, atenção, informação, crítico.
// -----------------------------------------------------------------------------
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#FBF3EC',
          100: '#F5DFC7',
          200: '#EAC096',
          300: '#DA9C64',
          400: '#C97B3C',
          500: '#B15F22',
          600: '#984E1A',
          700: '#7A3F17',
          800: '#5C3115',
          900: '#452510',
          950: '#281508',
        },
        // Neutro grafite quente — substitui o "slate" padrão do Tailwind em
        // TODO o app (todas as classes slate-* já usadas nas telas herdam
        // este tom automaticamente).
        slate: {
          50: '#F7F6F4',
          100: '#EDEBE6',
          200: '#DBD7CF',
          300: '#C2BCB0',
          400: '#9C9284',
          500: '#797064',
          600: '#5D564B',
          700: '#494339',
          800: '#332F28',
          900: '#211E19',
          950: '#15130F',
        },
        status: {
          info: '#1F5FA8',
          'info-soft': '#E7F0FA',
          success: '#1E7A46',
          'success-soft': '#E5F4EB',
          warning: '#B4790A',
          'warning-soft': '#FBF0DD',
          danger: '#B3392C',
          'danger-soft': '#FAE9E6',
          neutral: '#5D564B',
          'neutral-soft': '#EDEBE6',
        },
      },
      fontFamily: {
        sans: ['"IBM Plex Sans"', 'system-ui', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      fontSize: {
        // Escala levemente mais contida que o padrão do Tailwind — evita
        // títulos gigantes; prioriza densidade de informação.
        xs: ['0.75rem', { lineHeight: '1.1rem' }],
        sm: ['0.8125rem', { lineHeight: '1.25rem' }],
        base: ['0.875rem', { lineHeight: '1.4rem' }],
        lg: ['1rem', { lineHeight: '1.5rem' }],
        xl: ['1.125rem', { lineHeight: '1.6rem' }],
        '2xl': ['1.375rem', { lineHeight: '1.8rem' }],
      },
      borderRadius: {
        // Raio reduzido globalmente: ferramenta técnica, não bolha de SaaS.
        DEFAULT: '4px',
        sm: '3px',
        md: '5px',
        lg: '6px',
        xl: '8px',
        '2xl': '10px',
      },
      boxShadow: {
        // Sombras discretas — o produto usa borda como separador primário;
        // sombra só para elementos flutuantes de fato (modal, toast, menu).
        card: '0 1px 2px 0 rgb(21 19 15 / 0.05)',
        flyout: '0 8px 24px -8px rgb(21 19 15 / 0.35)',
      },
    },
  },
  plugins: [],
};

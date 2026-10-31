// -----------------------------------------------------------------------------
// Design tokens — Material Design 3, tema claro em branco e azul.
//
// Fonte única das cores do sistema: o Tailwind (tailwind.config.js) e os
// gráficos (utils/chartColors.ts) leem daqui. Para mudar a cor de qualquer
// tela, mude só este arquivo e use sempre os papéis (`bg-primary`,
// `text-on-surface`...), nunca um valor hexadecimal.
//
// `success` e `warning` não fazem parte da paleta base do Material 3: são papéis
// extras, no mesmo formato, porque os status das ordens de serviço dependem deles.
// -----------------------------------------------------------------------------
export const colors = {
  primary: '#0B57D0',
  'on-primary': '#FFFFFF',
  'primary-container': '#D3E3FD',
  'on-primary-container': '#041E49',

  secondary: '#00639B',
  'on-secondary': '#FFFFFF',
  'secondary-container': '#C2E7FF',
  'on-secondary-container': '#001D35',

  background: '#FFFFFF',
  'on-background': '#1F1F1F',
  surface: '#FFFFFF',
  'on-surface': '#1F1F1F',
  'surface-container': '#F0F4F9',
  'surface-container-high': '#E9EEF6',
  'on-surface-variant': '#444746',

  outline: '#747775',
  'outline-variant': '#C4C7C5',

  error: '#B3261E',
  'on-error': '#FFFFFF',
  'error-container': '#F9DEDC',
  'on-error-container': '#410E0B',

  success: '#146C2E',
  'on-success': '#FFFFFF',
  'success-container': '#C4EED0',
  'on-success-container': '#072711',

  warning: '#7C5800',
  'on-warning': '#FFFFFF',
  'warning-container': '#FFDEA6',
  'on-warning-container': '#271900',
} as const;

// Escala tipográfica do Material 3: [tamanho, { altura de linha, peso }].
export const typeScale = {
  'display-small': ['2.25rem', { lineHeight: '2.75rem', fontWeight: '400' }],
  'headline-medium': ['1.75rem', { lineHeight: '2.25rem', fontWeight: '400' }],
  'headline-small': ['1.5rem', { lineHeight: '2rem', fontWeight: '400' }],
  'title-large': ['1.375rem', { lineHeight: '1.75rem', fontWeight: '400' }],
  'title-medium': ['1rem', { lineHeight: '1.5rem', fontWeight: '500' }],
  'title-small': ['0.875rem', { lineHeight: '1.25rem', fontWeight: '500' }],
  'body-large': ['1rem', { lineHeight: '1.5rem', fontWeight: '400' }],
  'body-medium': ['0.875rem', { lineHeight: '1.25rem', fontWeight: '400' }],
  'body-small': ['0.75rem', { lineHeight: '1rem', fontWeight: '400' }],
  'label-large': ['0.875rem', { lineHeight: '1.25rem', fontWeight: '500' }],
  'label-medium': ['0.75rem', { lineHeight: '1rem', fontWeight: '500' }],
} as const;

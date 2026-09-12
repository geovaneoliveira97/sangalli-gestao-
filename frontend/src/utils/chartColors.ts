import { STATUS_TONE, TONE_CLASSES, type StatusTone } from './statusLabels';
import type { WorkOrderStatus } from '../types';

// Paleta categórica validada (contraste + segurança para daltonismo) — ordem fixa, nunca ciclada.
// Usada apenas quando a série não tem relação com o status de uma OS (ex.: ranking de serviços).
export const CATEGORICAL_PALETTE = {
  blue: '#2a78d6',
  orange: '#eb6834',
  aqua: '#1baf7a',
  yellow: '#eda100',
  magenta: '#e87ba4',
  green: '#008300',
  violet: '#4a3aa7',
  red: '#e34948',
} as const;

// Cor de destaque da marca — usada em séries sequenciais (ex.: faturamento
// ao longo do tempo), reforçando a identidade em vez de um azul genérico.
export const SEQUENTIAL_ACCENT = '#984E1A';

export const CHART_INK = {
  primary: '#15130F',
  secondary: '#494339',
  muted: '#9C9284',
  grid: '#DBD7CF',
  axis: '#C2BCB0',
};

// Cores hexadecimais equivalentes ao tom semântico de cada status — os
// gráficos usam exatamente a mesma linguagem de cor das etiquetas de status.
const TONE_HEX: Record<StatusTone, string> = {
  info: '#1F5FA8',
  warning: '#B4790A',
  success: '#1E7A46',
  danger: '#B3392C',
  neutral: '#9C9284',
};

export const STATUS_CHART_COLORS: Record<WorkOrderStatus, string> = Object.fromEntries(
  Object.entries(STATUS_TONE).map(([status, tone]) => [status, TONE_HEX[tone]]),
) as Record<WorkOrderStatus, string>;

// Reexportado para quem só precisa das classes utilitárias (badges/telas).
export { TONE_CLASSES };

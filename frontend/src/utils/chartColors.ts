import type { WorkOrderStatus } from '../types';

// Paleta categórica validada (contraste + segurança para daltonismo) — ordem fixa, nunca ciclada.
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

export const SEQUENTIAL_BLUE = '#2a78d6';

export const CHART_INK = {
  primary: '#0b0b0b',
  secondary: '#52514e',
  muted: '#898781',
  grid: '#e1e0d9',
  axis: '#c3c2b7',
};

export const STATUS_CHART_COLORS: Record<WorkOrderStatus, string> = {
  EM_DIAGNOSTICO: CATEGORICAL_PALETTE.blue,
  AGUARDANDO_APROVACAO: CATEGORICAL_PALETTE.orange,
  EM_MANUTENCAO: CATEGORICAL_PALETTE.aqua,
  EM_FUNILARIA: CATEGORICAL_PALETTE.yellow,
  EM_PINTURA: CATEGORICAL_PALETTE.magenta,
  EM_TESTE: CATEGORICAL_PALETTE.violet,
  PRONTO: CATEGORICAL_PALETTE.green,
  ENTREGUE: CHART_INK.muted,
  CANCELADO: CATEGORICAL_PALETTE.red,
};

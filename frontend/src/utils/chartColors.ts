import { STATUS_TONE, TONE_CLASSES, type StatusTone } from './statusLabels';
import { colors } from '../theme/tokens';
import type { WorkOrderStatus } from '../types';

// Cor de destaque das séries sequenciais (ex.: faturamento ao longo do tempo).
export const SEQUENTIAL_ACCENT = colors.primary;

export const CHART_INK = {
  muted: colors['on-surface-variant'],
  grid: colors['outline-variant'],
};

// Os gráficos usam exatamente a mesma linguagem de cor das etiquetas de status.
const TONE_HEX: Record<StatusTone, string> = {
  info: colors.secondary,
  warning: colors.warning,
  success: colors.success,
  danger: colors.error,
  neutral: colors.outline,
};

export const STATUS_CHART_COLORS: Record<WorkOrderStatus, string> = Object.fromEntries(
  Object.entries(STATUS_TONE).map(([status, tone]) => [status, TONE_HEX[tone]]),
) as Record<WorkOrderStatus, string>;

// Reexportado para quem só precisa das classes utilitárias (badges/telas).
export { TONE_CLASSES };

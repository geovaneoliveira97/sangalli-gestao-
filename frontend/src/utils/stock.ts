import type { Part } from '../types';

// Quantidade a partir da qual a peça entra no alerta de estoque baixo.
export const LOW_STOCK_THRESHOLD = 5;

export function isLowStock(part: Pick<Part, 'stock'>): boolean {
  return part.stock <= LOW_STOCK_THRESHOLD;
}

export function stockBadgeClass(stock: number): string {
  if (stock > LOW_STOCK_THRESHOLD) return 'border-status-success/30 bg-status-success-soft text-status-success';
  if (stock > 0) return 'border-status-warning/40 bg-status-warning-soft text-status-warning';
  return 'border-status-danger/30 bg-status-danger-soft text-status-danger';
}

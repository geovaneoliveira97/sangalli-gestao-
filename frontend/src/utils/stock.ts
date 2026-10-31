import type { Part } from '../types';

// Quantidade a partir da qual a peça entra no alerta de estoque baixo.
export const LOW_STOCK_THRESHOLD = 5;

export function isLowStock(part: Pick<Part, 'stock'>): boolean {
  return part.stock <= LOW_STOCK_THRESHOLD;
}

export function stockBadgeClass(stock: number): string {
  if (stock > LOW_STOCK_THRESHOLD) return 'border-success/30 bg-success-container text-success';
  if (stock > 0) return 'border-warning/40 bg-warning-container text-warning';
  return 'border-error/30 bg-error-container text-error';
}

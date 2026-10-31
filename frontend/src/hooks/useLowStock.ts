import { useContext } from 'react';
import { LowStockContext } from '../contexts/LowStockContext';

export function useLowStock() {
  const context = useContext(LowStockContext);
  if (!context) {
    throw new Error('useLowStock deve ser usado dentro de um LowStockProvider.');
  }
  return context;
}

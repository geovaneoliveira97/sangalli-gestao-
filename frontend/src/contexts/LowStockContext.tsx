import { createContext, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { listParts } from '../services/catalogService';
import { useToast } from '../hooks/useToast';
import { isLowStock } from '../utils/stock';
import type { Part } from '../types';

interface LowStockContextValue {
  lowStockParts: Part[];
  refreshLowStock: () => Promise<void>;
}

export const LowStockContext = createContext<LowStockContextValue | undefined>(undefined);

function buildToastMessage(parts: Part[]): string {
  if (parts.length > 1) return `${parts.length} peças estão com estoque baixo.`;
  const [part] = parts;
  return part.stock === 0 ? `Sem estoque: ${part.name}.` : `Estoque baixo: ${part.name} (${part.stock} un.).`;
}

export function LowStockProvider({ children }: { children: ReactNode }) {
  const { showToast } = useToast();
  const [lowStockParts, setLowStockParts] = useState<Part[]>([]);

  // Peças do último alerta: o toast só aparece para as que acabaram de entrar
  // na lista, para não repetir o aviso a cada atualização.
  const alertedIds = useRef(new Set<string>());

  const refreshLowStock = useCallback(async () => {
    try {
      const parts = await listParts({ onlyActive: true });
      const lowStock = parts.filter(isLowStock).sort((a, b) => a.stock - b.stock);
      const newlyLow = lowStock.filter((part) => !alertedIds.current.has(part.id));

      alertedIds.current = new Set(lowStock.map((part) => part.id));
      setLowStockParts(lowStock);
      if (newlyLow.length > 0) showToast(buildToastMessage(newlyLow), 'warning');
    } catch {
      // O alerta é complementar: se a consulta falhar, o restante do sistema
      // continua funcionando e a tela de Peças mostra o erro ao usuário.
    }
  }, [showToast]);

  useEffect(() => {
    refreshLowStock();
  }, [refreshLowStock]);

  const value = useMemo(() => ({ lowStockParts, refreshLowStock }), [lowStockParts, refreshLowStock]);

  return <LowStockContext.Provider value={value}>{children}</LowStockContext.Provider>;
}

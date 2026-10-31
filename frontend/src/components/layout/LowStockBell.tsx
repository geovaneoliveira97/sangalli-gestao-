import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { useLowStock } from '../../hooks/useLowStock';
import { stockBadgeClass } from '../../utils/stock';

export function LowStockBell() {
  const { lowStockParts } = useLowStock();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setIsOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsOpen(false);
    }

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const count = lowStockParts.length;
  const summary =
    count === 0
      ? 'Nenhuma peça com estoque baixo'
      : `${count} ${count === 1 ? 'peça' : 'peças'} com estoque baixo`;

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-label={summary}
        aria-expanded={isOpen}
        aria-controls="low-stock-panel"
        className="relative rounded p-2 text-slate-600 hover:bg-slate-100"
      >
        <Bell size={18} aria-hidden="true" />
        {count > 0 && (
          <span
            aria-hidden="true"
            className="tabular absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-status-danger px-1 text-[10px] font-bold leading-none text-white"
          >
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          id="low-stock-panel"
          className="fixed inset-x-4 top-14 z-30 rounded-md border border-slate-200 bg-white shadow-flyout sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:w-80"
        >
          <div className="border-b border-slate-200 px-4 py-3">
            <p className="eyebrow">Estoque</p>
            <p className="text-sm font-semibold text-slate-900">{summary}</p>
          </div>

          {count > 0 && (
            <ul className="max-h-72 divide-y divide-slate-100 overflow-y-auto">
              {lowStockParts.map((part) => (
                <li key={part.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-800">{part.name}</p>
                    <p className="font-mono text-xs text-slate-500">{part.code}</p>
                  </div>
                  <Badge className={`shrink-0 ${stockBadgeClass(part.stock)}`}>{part.stock} un.</Badge>
                </li>
              ))}
            </ul>
          )}

          <div className="border-t border-slate-200 px-4 py-2.5">
            <Link
              to="/pecas"
              onClick={() => setIsOpen(false)}
              className="text-sm font-medium text-brand-700 hover:underline"
            >
              Ver peças
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

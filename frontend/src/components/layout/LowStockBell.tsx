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
        className="icon-button relative"
      >
        <Bell size={20} aria-hidden="true" />
        {count > 0 && (
          <span
            aria-hidden="true"
            className="tabular absolute right-2 top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-error px-1 text-label-medium text-on-error"
          >
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          id="low-stock-panel"
          className="fixed inset-x-4 top-16 z-30 rounded-lg bg-surface shadow-flyout sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:w-80"
        >
          <div className="px-4 pt-4">
            <p className="eyebrow">Estoque</p>
            <p className="pb-3 text-title-small text-on-surface">{summary}</p>
          </div>

          {count > 0 && (
            <ul className="max-h-72 divide-y divide-outline-variant overflow-y-auto border-t border-outline-variant">
              {lowStockParts.map((part) => (
                <li key={part.id} className="flex items-center justify-between gap-3 px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-title-small text-on-surface">{part.name}</p>
                    <p className="font-mono text-body-small text-on-surface-variant">{part.code}</p>
                  </div>
                  <Badge className={`shrink-0 ${stockBadgeClass(part.stock)}`}>{part.stock} un.</Badge>
                </li>
              ))}
            </ul>
          )}

          <div className="border-t border-outline-variant px-2 py-1">
            <Link
              to="/pecas"
              onClick={() => setIsOpen(false)}
              className="inline-flex min-h-12 items-center rounded-full px-3 text-label-large text-primary hover:bg-primary/10"
            >
              Ver peças
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

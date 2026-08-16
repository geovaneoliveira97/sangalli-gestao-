import { Check, Circle } from 'lucide-react';
import { STATUS_LABELS, WORK_ORDER_STATUS_FLOW } from '../../utils/statusLabels';
import { formatDateTime } from '../../utils/format';
import type { StatusHistoryEntry, WorkOrderStatus } from '../../types';

interface TimelineProps {
  status: WorkOrderStatus;
  history: StatusHistoryEntry[];
}

export function Timeline({ status, history }: TimelineProps) {
  if (status === 'CANCELADO') {
    const cancelEntry = history.find((h) => h.status === 'CANCELADO');
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        <p className="font-medium">✖️ Ordem de serviço cancelada</p>
        {cancelEntry?.note && <p className="mt-1">{cancelEntry.note}</p>}
        {cancelEntry && <p className="mt-1 text-xs">{formatDateTime(cancelEntry.createdAt)}</p>}
      </div>
    );
  }

  const currentIndex = WORK_ORDER_STATUS_FLOW.indexOf(status);

  return (
    <ol className="space-y-0" aria-label="Linha do tempo da ordem de serviço">
      {WORK_ORDER_STATUS_FLOW.map((step, index) => {
        const isDone = index < currentIndex;
        const isCurrent = index === currentIndex;
        const entry = [...history].reverse().find((h) => h.status === step);
        const isLast = index === WORK_ORDER_STATUS_FLOW.length - 1;

        return (
          <li key={step} className="relative flex gap-4 pb-6 last:pb-0">
            {!isLast && (
              <span
                aria-hidden="true"
                className={`absolute left-[15px] top-8 h-full w-0.5 ${isDone ? 'bg-emerald-400' : 'bg-slate-200'}`}
              />
            )}
            <span
              className={`z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 ${
                isDone
                  ? 'border-emerald-500 bg-emerald-500 text-white'
                  : isCurrent
                    ? 'border-brand-600 bg-brand-600 text-white'
                    : 'border-slate-300 bg-white text-slate-300'
              }`}
            >
              {isDone ? <Check size={16} /> : isCurrent ? <Circle size={10} fill="currentColor" /> : null}
            </span>
            <div className="pt-1">
              <p className={`text-sm font-medium ${isCurrent ? 'text-brand-700' : 'text-slate-700'}`}>
                {STATUS_LABELS[step]}
                {isCurrent && (
                  <span className="ml-2 rounded-full bg-brand-100 px-2 py-0.5 text-xs font-normal text-brand-700">
                    Etapa atual
                  </span>
                )}
              </p>
              {entry && (
                <p className="text-xs text-slate-500">
                  {formatDateTime(entry.createdAt)}
                  {entry.user ? ` · ${entry.user.name}` : ''}
                </p>
              )}
              {entry?.note && <p className="mt-0.5 text-xs text-slate-500">{entry.note}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

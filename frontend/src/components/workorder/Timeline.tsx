import { Check } from 'lucide-react';
import { STATUS_LABELS, STATUS_STAGE_CODE, WORK_ORDER_STATUS_FLOW } from '../../utils/statusLabels';
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
      <div className="rounded border border-status-danger/30 bg-status-danger-soft p-4 text-sm text-status-danger">
        <p className="font-semibold">Ordem de serviço cancelada</p>
        {cancelEntry?.note && <p className="mt-1">{cancelEntry.note}</p>}
        {cancelEntry && <p className="mt-1 text-xs opacity-80">{formatDateTime(cancelEntry.createdAt)}</p>}
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
                className={`absolute left-[13px] top-7 h-full w-px ${isDone ? 'bg-status-success' : 'bg-slate-200'}`}
              />
            )}
            <span
              className={`z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 ${
                isDone
                  ? 'border-status-success bg-status-success text-white'
                  : isCurrent
                    ? 'border-brand-600 bg-brand-600 text-white'
                    : 'border-slate-300 bg-white text-slate-300'
              }`}
            >
              {isDone ? (
                <Check size={14} />
              ) : (
                <span className={`h-2 w-2 rounded-full ${isCurrent ? 'bg-white' : 'bg-slate-300'}`} />
              )}
            </span>
            <div className="pt-0.5">
              <p className={`flex items-center gap-2 text-sm font-medium ${isCurrent ? 'text-brand-700' : 'text-slate-700'}`}>
                <span className="font-mono text-[10px] font-semibold tracking-wide text-slate-400">
                  {STATUS_STAGE_CODE[step]}
                </span>
                <span>{STATUS_LABELS[step]}</span>
                {isCurrent && (
                  <span className="rounded border border-brand-200 bg-brand-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-700">
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

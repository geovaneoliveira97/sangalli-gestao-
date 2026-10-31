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
      <div className="rounded border border-error/30 bg-error-container p-4 text-body-medium text-error">
        <p className="font-medium">Ordem de serviço cancelada</p>
        {cancelEntry?.note && <p className="mt-1">{cancelEntry.note}</p>}
        {cancelEntry && <p className="mt-1 text-body-small opacity-80">{formatDateTime(cancelEntry.createdAt)}</p>}
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
                className={`absolute left-[13px] top-7 h-full w-px ${isDone ? 'bg-success' : 'bg-outline-variant'}`}
              />
            )}
            <span
              className={`z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 ${
                isDone
                  ? 'border-success bg-success text-on-success'
                  : isCurrent
                    ? 'border-primary bg-primary text-on-primary'
                    : 'border-outline bg-surface text-outline'
              }`}
            >
              {isDone ? (
                <Check size={14} aria-hidden="true" />
              ) : (
                <span className={`h-2 w-2 rounded-full ${isCurrent ? 'bg-surface' : 'bg-outline-variant'}`} />
              )}
            </span>
            <div className="pt-1">
              <p className={`flex items-center gap-2 text-body-medium font-medium ${isCurrent ? 'text-primary' : 'text-on-surface'}`}>
                <span className="font-mono text-label-medium text-on-surface-variant">
                  {STATUS_STAGE_CODE[step]}
                </span>
                <span>{STATUS_LABELS[step]}</span>
                {isCurrent && (
                  <span className="rounded border border-primary-container bg-primary-container px-2 py-1 text-[10px] font-medium text-primary">
                    Etapa atual
                  </span>
                )}
              </p>
              {entry && (
                <p className="text-body-small text-on-surface-variant">
                  {formatDateTime(entry.createdAt)}
                  {entry.user ? ` · ${entry.user.name}` : ''}
                </p>
              )}
              {entry?.note && <p className="mt-0.5 text-body-small text-on-surface-variant">{entry.note}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

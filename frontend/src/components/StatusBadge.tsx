import { Badge } from './ui/Badge';
import { STATUS_LABELS, STATUS_STAGE_CODE, STATUS_TONE, TONE_CLASSES } from '../utils/statusLabels';
import type { WorkOrderStatus } from '../types';

interface StatusBadgeProps {
  status: WorkOrderStatus;
  /** Oculta o código de etapa (DIAG, MEC, FUN...) em contextos muito estreitos. */
  compact?: boolean;
}

export function StatusBadge({ status, compact = false }: StatusBadgeProps) {
  const tone = STATUS_TONE[status];
  const classes = TONE_CLASSES[tone];

  return (
    <Badge className={`${classes.border} ${classes.bg} ${classes.text}`}>
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${classes.dot}`} aria-hidden="true" />
      {!compact && <span className="font-mono text-[10px] font-semibold tracking-wide opacity-80">{STATUS_STAGE_CODE[status]}</span>}
      {STATUS_LABELS[status]}
    </Badge>
  );
}

import { Badge } from './ui/Badge';
import { STATUS_BADGE_CLASSES, STATUS_ICONS, STATUS_LABELS } from '../utils/statusLabels';
import type { WorkOrderStatus } from '../types';

export function StatusBadge({ status }: { status: WorkOrderStatus }) {
  return (
    <Badge className={STATUS_BADGE_CLASSES[status]}>
      <span aria-hidden="true">{STATUS_ICONS[status]}</span>
      {STATUS_LABELS[status]}
    </Badge>
  );
}

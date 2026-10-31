import type { LucideIcon } from 'lucide-react';
import { TONE_CLASSES, type StatusTone } from '../utils/statusLabels';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: number | string;
  tone?: StatusTone;
}

/** Indicador operacional compacto: a cor do ícone segue o tom semântico da métrica. */
export function StatCard({ icon: Icon, label, value, tone = 'neutral' }: StatCardProps) {
  const classes = TONE_CLASSES[tone];

  return (
    <div className="flex items-center gap-3 rounded-md bg-surface-container p-4">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${classes.bg}`}>
        <Icon size={20} className={classes.text} aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <p className="tabular text-title-large text-on-surface">{value}</p>
        <p className="truncate text-body-small text-on-surface-variant">{label}</p>
      </div>
    </div>
  );
}

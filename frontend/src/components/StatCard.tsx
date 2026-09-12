import type { LucideIcon } from 'lucide-react';
import { TONE_CLASSES, type StatusTone } from '../utils/statusLabels';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: number | string;
  tone?: StatusTone;
}

/**
 * Indicador operacional compacto — não é um "card" decorativo com ícone em
 * caixa colorida: é uma métrica densa, com uma barra de acento semântica à
 * esquerda, pensada para caber várias lado a lado sem competir por atenção.
 */
export function StatCard({ icon: Icon, label, value, tone = 'neutral' }: StatCardProps) {
  const classes = TONE_CLASSES[tone];

  return (
    <div className={`flex items-center gap-3 rounded-md border border-slate-200 border-l-[3px] bg-white px-4 py-3 ${classes.border}`}>
      <Icon size={16} className={classes.text} aria-hidden="true" />
      <div className="min-w-0">
        <p className="tabular text-xl font-bold leading-tight text-slate-900">{value}</p>
        <p className="truncate text-xs text-slate-500">{label}</p>
      </div>
    </div>
  );
}

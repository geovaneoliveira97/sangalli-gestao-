import type { LucideIcon } from 'lucide-react';
import { Card } from './ui/Card';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: number | string;
  accent: string;
}

export function StatCard({ icon: Icon, label, value, accent }: StatCardProps) {
  return (
    <Card className="flex items-center gap-4 p-5">
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${accent}`}>
        <Icon size={24} aria-hidden="true" />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
        <p className="text-sm text-slate-500">{label}</p>
      </div>
    </Card>
  );
}

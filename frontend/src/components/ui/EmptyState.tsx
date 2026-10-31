import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 px-6 py-12 text-center">
      <Icon size={28} className="mb-2 text-outline" aria-hidden="true" />
      <h3 className="text-title-medium text-on-surface">{title}</h3>
      {description && <p className="max-w-sm text-body-medium text-on-surface-variant">{description}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}

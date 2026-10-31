import type { ReactNode } from 'react';

interface PageHeaderProps {
  /** Rótulo curto acima do título para contextualizar a seção (ex.: "Operação"). */
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
}

export function PageHeader({ eyebrow, title, description, action }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && <p className="eyebrow mb-1">{eyebrow}</p>}
        <h1 className="text-headline-medium text-on-surface">{title}</h1>
        {description && <p className="mt-1 text-body-medium text-on-surface-variant">{description}</p>}
      </div>
      {action && <div className="flex shrink-0 flex-wrap gap-2">{action}</div>}
    </div>
  );
}

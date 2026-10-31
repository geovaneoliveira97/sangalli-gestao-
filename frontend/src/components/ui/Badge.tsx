import type { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  className?: string;
}

/** Etiqueta usada para status, contagens e sinalizações. */
export function Badge({ children, className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center gap-2 rounded border px-2 py-1 text-label-medium ${className}`}>
      {children}
    </span>
  );
}

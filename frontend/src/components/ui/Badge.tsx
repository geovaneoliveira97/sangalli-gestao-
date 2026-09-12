import type { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  className?: string;
}

/**
 * Etiqueta técnica (tag), não "pílula" de rede social: cantos discretos,
 * borda visível, tipografia densa. Usada para status, contagens e sinalizações.
 */
export function Badge({ children, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded border px-2 py-0.5 text-xs font-medium leading-5 ${className}`}
    >
      {children}
    </span>
  );
}

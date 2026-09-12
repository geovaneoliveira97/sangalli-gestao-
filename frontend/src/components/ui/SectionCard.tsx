import type { ReactNode } from 'react';
import { Card } from './Card';

interface SectionCardProps {
  /** Rótulo curto em caixa alta, para dar contexto de bloco (ex.: "CLIENTE"). */
  eyebrow?: string;
  title: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}

/**
 * Bloco padrão para agrupar informação dentro de uma tela de detalhe
 * (Ordem de Serviço, Cliente, Veículo, Configurações...). Centraliza o
 * cabeçalho de seção para não duplicar `<h2>` estilizado em cada página.
 */
export function SectionCard({ eyebrow, title, action, children, className = '', bodyClassName = '' }: SectionCardProps) {
  return (
    <Card className={className}>
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 sm:px-5">
        <div>
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
        </div>
        {action && <div className="flex shrink-0 gap-2">{action}</div>}
      </div>
      <div className={`p-4 sm:p-5 ${bodyClassName}`}>{children}</div>
    </Card>
  );
}

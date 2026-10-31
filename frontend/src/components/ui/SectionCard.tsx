import type { ReactNode } from 'react';
import { Card } from './Card';

interface SectionCardProps {
  /** Rótulo curto acima do título, para dar contexto de bloco (ex.: "Cliente"). */
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
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 pt-4 sm:px-6">
        <div>
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          <h2 className="text-title-medium text-on-surface">{title}</h2>
        </div>
        {action && <div className="flex gap-2">{action}</div>}
      </div>
      <div className={`p-4 sm:px-6 ${bodyClassName}`}>{children}</div>
    </Card>
  );
}

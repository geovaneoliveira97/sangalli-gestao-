import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Timeline } from './Timeline';
import type { StatusHistoryEntry } from '../../types';

const history: StatusHistoryEntry[] = [
  { id: '1', status: 'EM_DIAGNOSTICO', createdAt: '2026-08-01T10:00:00.000Z' },
  { id: '2', status: 'AGUARDANDO_APROVACAO', createdAt: '2026-08-02T10:00:00.000Z' },
  { id: '3', status: 'EM_MANUTENCAO', createdAt: '2026-08-03T10:00:00.000Z', note: 'Iniciando reparo.' },
];

describe('Timeline', () => {
  it('exibe todas as etapas do fluxo e destaca a etapa atual', () => {
    render(<Timeline status="EM_MANUTENCAO" history={history} />);

    expect(screen.getByText('Em diagnóstico')).toBeInTheDocument();
    expect(screen.getByText('Aguardando aprovação')).toBeInTheDocument();
    expect(screen.getByText('Em manutenção')).toBeInTheDocument();
    expect(screen.getByText('Pintura')).toBeInTheDocument();
    expect(screen.getByText('Etapa atual')).toBeInTheDocument();
    expect(screen.getByText('Iniciando reparo.')).toBeInTheDocument();
  });

  it('exibe mensagem de cancelamento quando a OS está cancelada', () => {
    render(
      <Timeline
        status="CANCELADO"
        history={[{ id: '4', status: 'CANCELADO', createdAt: '2026-08-04T10:00:00.000Z', note: 'Cliente desistiu.' }]}
      />,
    );

    expect(screen.getByText(/ordem de serviço cancelada/i)).toBeInTheDocument();
    expect(screen.getByText('Cliente desistiu.')).toBeInTheDocument();
  });
});

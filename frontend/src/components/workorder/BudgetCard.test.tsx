import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BudgetCard } from './BudgetCard';
import type { WorkOrder } from '../../types';

const baseWorkOrder = {
  id: 'wo-1',
  number: 1024,
  clientId: 'c1',
  vehicleId: 'v1',
  problemDescription: 'Ruído ao frear',
  status: 'EM_MANUTENCAO',
  entryDate: '2026-08-01T00:00:00.000Z',
  laborCost: 150,
  publicToken: 'token-123',
  createdAt: '2026-08-01T00:00:00.000Z',
  client: { id: 'c1', name: 'João da Silva' },
  vehicle: { id: 'v1', plate: 'ABC1234', brand: 'Chevrolet', model: 'Onix' },
  services: [
    { id: 's1', workOrderId: 'wo-1', serviceId: 'srv1', price: 80, service: { id: 'srv1', name: 'Diagnóstico', defaultPrice: 80, active: true } },
    { id: 's2', workOrderId: 'wo-1', serviceId: 'srv2', price: 100, service: { id: 'srv2', name: 'Alinhamento', defaultPrice: 100, active: true } },
  ],
  parts: [
    { id: 'p1', workOrderId: 'wo-1', partId: 'part1', quantity: 1, unitPrice: 120, part: { id: 'part1', name: 'Bieleta', code: 'COD-013', price: 120, stock: 10, active: true } },
  ],
  photos: [],
  payments: [{ id: 'pay1', workOrderId: 'wo-1', amount: 200, method: 'PIX', paidAt: '2026-08-02T00:00:00.000Z' }],
  statusHistory: [],
  totals: {
    servicesTotal: 180,
    partsTotal: 120,
    laborCost: 150,
    total: 450,
    paid: 200,
    remaining: 250,
  },
} as unknown as WorkOrder;

describe('BudgetCard', () => {
  it('exibe o orçamento calculado: serviços + peças + mão de obra = total', () => {
    render(
      <BudgetCard
        workOrder={baseWorkOrder}
        canManage={false}
        onRemoveService={vi.fn()}
        onRemovePart={vi.fn()}
      />,
    );

    expect(screen.getByText('Diagnóstico')).toBeInTheDocument();
    expect(screen.getByText('Alinhamento')).toBeInTheDocument();
    expect(screen.getByText(/Bieleta/)).toBeInTheDocument();

    expect(screen.getByText('R$ 450,00')).toBeInTheDocument(); // total
    expect(screen.getAllByText('R$ 200,00').length).toBeGreaterThanOrEqual(1); // pago (e no histórico de pagamentos)
    expect(screen.getByText('R$ 250,00')).toBeInTheDocument(); // restante
  });

  it('permite remover itens quando o usuário pode gerenciar a OS', async () => {
    const onRemoveService = vi.fn();
    render(
      <BudgetCard
        workOrder={baseWorkOrder}
        canManage
        onRemoveService={onRemoveService}
        onRemovePart={vi.fn()}
      />,
    );

    const removeButton = screen.getByRole('button', { name: /remover serviço diagnóstico/i });
    removeButton.click();
    expect(onRemoveService).toHaveBeenCalledWith('s1');
  });
});

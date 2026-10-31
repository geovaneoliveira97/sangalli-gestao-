import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { BudgetPrintView } from './BudgetPrintView';
import type { WorkOrder } from '../../types';

// Como vem da API: o Prisma serializa os campos Decimal como string.
const workOrder = {
  id: 'wo-1',
  number: 42,
  problemDescription: 'Ruído ao frear',
  diagnosis: 'Pastilhas gastas',
  status: 'AGUARDANDO_APROVACAO',
  entryDate: '2026-08-01T12:00:00.000Z',
  estimatedDelivery: '2026-08-05T12:00:00.000Z',
  laborCost: '150.00',
  internalNotes: 'Cliente costuma atrasar pagamento',
  publicNotes: 'Peças com garantia de 90 dias',
  publicToken: 'token-123',
  client: { id: 'c1', name: 'João da Silva', cpf: '123.456.789-00', phone: '(11) 91234-5678', email: null },
  vehicle: { id: 'v1', plate: 'ABC1D23', brand: 'Chevrolet', model: 'Onix', year: 2020, color: 'Prata', mileage: 45000 },
  services: [{ id: 's1', price: '80.00', service: { name: 'Diagnóstico' } }],
  parts: [{ id: 'p1', quantity: 2, unitPrice: '120.00', part: { name: 'Pastilha de freio' } }],
  payments: [],
  photos: [],
  statusHistory: [],
  totals: { servicesTotal: 80, partsTotal: 240, laborCost: 150, total: 470, paid: 0, remaining: 470 },
} as unknown as WorkOrder;

describe('BudgetPrintView', () => {
  it('monta o documento com itens, quantidades e subtotais', () => {
    render(<BudgetPrintView workOrder={workOrder} />);

    expect(screen.getByRole('heading', { name: 'Orçamento' })).toBeInTheDocument();
    expect(screen.getByText('OS-0042')).toBeInTheDocument();
    expect(screen.getByText('João da Silva')).toBeInTheDocument();

    const partRow = screen.getByRole('cell', { name: 'Pastilha de freio' }).closest('tr')!;
    expect(within(partRow).getByRole('cell', { name: '2' })).toBeInTheDocument();
    expect(within(partRow).getByRole('cell', { name: /120,00/ })).toBeInTheDocument();
    expect(within(partRow).getByRole('cell', { name: /240,00/ })).toBeInTheDocument();

    expect(screen.getByRole('cell', { name: 'Mão de obra' })).toBeInTheDocument();
    expect(screen.getByText('R$ 470,00')).toBeInTheDocument();
  });

  it('não expõe dados internos no documento do cliente', () => {
    render(<BudgetPrintView workOrder={workOrder} />);

    const text = document.body.textContent ?? '';
    expect(text).not.toContain('Cliente costuma atrasar pagamento');
    expect(text).not.toContain('123.456.789-00');
    expect(text).toContain('Peças com garantia de 90 dias');
  });

  it('só mostra pago e restante quando há pagamentos', () => {
    const { unmount } = render(<BudgetPrintView workOrder={workOrder} />);
    expect(screen.queryByText('Restante')).not.toBeInTheDocument();
    unmount();

    render(
      <BudgetPrintView
        workOrder={{ ...workOrder, totals: { ...workOrder.totals, paid: 100, remaining: 370 } }}
      />,
    );
    expect(screen.getByText('Restante')).toBeInTheDocument();
    expect(screen.getByText('R$ 370,00')).toBeInTheDocument();
  });

  it('sugere um nome de arquivo durante a impressão e restaura o título depois', () => {
    document.title = 'Sangalli Gestão';
    render(<BudgetPrintView workOrder={workOrder} />);

    window.dispatchEvent(new Event('beforeprint'));
    expect(document.title).toBe('Orcamento-OS-0042-ABC1D23');

    window.dispatchEvent(new Event('afterprint'));
    expect(document.title).toBe('Sangalli Gestão');
  });
});

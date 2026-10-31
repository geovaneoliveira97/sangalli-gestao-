import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { LowStockBell } from './LowStockBell';
import { LowStockProvider } from '../../contexts/LowStockContext';
import { ToastProvider } from '../../contexts/ToastContext';
import { useLowStock } from '../../hooks/useLowStock';
import { listParts } from '../../services/catalogService';
import type { Part } from '../../types';

vi.mock('../../services/catalogService', () => ({ listParts: vi.fn() }));

const listPartsMock = vi.mocked(listParts);

function part(id: string, name: string, stock: number): Part {
  return { id, name, code: `COD-${id}`, price: 10, stock, active: true };
}

function RefreshButton() {
  const { refreshLowStock } = useLowStock();
  return <button onClick={() => refreshLowStock()}>Atualizar</button>;
}

function renderBell() {
  return render(
    <MemoryRouter>
      <ToastProvider>
        <LowStockProvider>
          <LowStockBell />
          <RefreshButton />
        </LowStockProvider>
      </ToastProvider>
    </MemoryRouter>,
  );
}

describe('LowStockBell', () => {
  beforeEach(() => {
    listPartsMock.mockReset();
  });

  it('avisa e lista apenas as peças com estoque baixo, consultando só as ativas', async () => {
    const user = userEvent.setup();
    listPartsMock.mockResolvedValue([
      part('1', 'Bateria 60Ah', 2),
      part('2', 'Filtro de óleo', 40),
      part('3', 'Radiador', 0),
      part('4', 'Correia dentada', 6),
      part('5', 'Bieleta', 5),
    ]);
    renderBell();

    expect(await screen.findByText('3 peças estão com estoque baixo.')).toBeInTheDocument();
    expect(listPartsMock).toHaveBeenCalledWith({ onlyActive: true });

    await user.click(screen.getByRole('button', { name: '3 peças com estoque baixo' }));

    const names = screen.getAllByRole('listitem').map((item) => item.textContent);
    expect(names).toHaveLength(3);
    expect(names[0]).toContain('Radiador'); // o mais crítico primeiro
    expect(screen.queryByText('Filtro de óleo')).not.toBeInTheDocument();
    expect(screen.queryByText('Correia dentada')).not.toBeInTheDocument();
  });

  it('não notifica quando nenhuma peça está com estoque baixo', async () => {
    listPartsMock.mockResolvedValue([part('1', 'Filtro de óleo', 40)]);
    renderBell();

    expect(await screen.findByRole('button', { name: 'Nenhuma peça com estoque baixo' })).toBeInTheDocument();
    await waitFor(() => expect(listPartsMock).toHaveBeenCalled());
    expect(screen.queryByText(/estoque baixo\.$/)).not.toBeInTheDocument();
  });

  it('notifica de novo só as peças que entraram no alerta depois da atualização', async () => {
    const user = userEvent.setup();
    listPartsMock.mockResolvedValueOnce([part('1', 'Bateria 60Ah', 2), part('2', 'Radiador', 10)]);
    renderBell();
    expect(await screen.findByText('Estoque baixo: Bateria 60Ah (2 un.).')).toBeInTheDocument();

    listPartsMock.mockResolvedValueOnce([part('1', 'Bateria 60Ah', 1), part('2', 'Radiador', 0)]);
    await user.click(screen.getByRole('button', { name: 'Atualizar' }));

    expect(await screen.findByText('Sem estoque: Radiador.')).toBeInTheDocument();
    expect(screen.getAllByRole('status')).toHaveLength(2);
    expect(screen.getByRole('button', { name: '2 peças com estoque baixo' })).toBeInTheDocument();
  });

  it('fecha o painel com Esc', async () => {
    const user = userEvent.setup();
    listPartsMock.mockResolvedValue([part('1', 'Bateria 60Ah', 2)]);
    renderBell();

    await user.click(await screen.findByRole('button', { name: '1 peça com estoque baixo' }));
    expect(screen.getByRole('link', { name: 'Ver peças' })).toBeInTheDocument();

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('link', { name: 'Ver peças' })).not.toBeInTheDocument();
  });
});

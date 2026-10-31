import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PartsPage } from './PartsPage';
import { ToastProvider } from '../contexts/ToastContext';
import { listParts, updatePart } from '../services/catalogService';
import type { Part } from '../types';

vi.mock('../services/catalogService', () => ({
  listParts: vi.fn(),
  updatePart: vi.fn(),
  createPart: vi.fn(),
  deletePart: vi.fn(),
}));

const refreshLowStock = vi.fn();
vi.mock('../hooks/useLowStock', () => ({ useLowStock: () => ({ refreshLowStock }) }));

// Como vem da API: o Prisma serializa o campo Decimal `price` como string.
const part = {
  id: 'p1',
  name: 'Kit de embreagem',
  code: 'COD-014',
  manufacturer: 'Sachs',
  price: '550',
  stock: 8,
  active: true,
} as unknown as Part;

describe('PartsPage', () => {
  beforeEach(() => {
    vi.mocked(listParts).mockResolvedValue([part]);
    vi.mocked(updatePart).mockResolvedValue(part);
    refreshLowStock.mockClear();
  });

  it('envia o preço como número ao alterar só o estoque e atualiza o alerta', async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <PartsPage />
      </ToastProvider>,
    );

    await user.click(await screen.findByRole('button', { name: 'Editar Kit de embreagem' }));
    const stock = screen.getByLabelText(/^Estoque/);
    await user.clear(stock);
    await user.type(stock, '3');
    await user.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(await screen.findByText('Peça atualizada.')).toBeInTheDocument();
    expect(updatePart).toHaveBeenCalledWith('p1', expect.objectContaining({ price: 550, stock: 3 }));
    expect(refreshLowStock).toHaveBeenCalled();
  });
});

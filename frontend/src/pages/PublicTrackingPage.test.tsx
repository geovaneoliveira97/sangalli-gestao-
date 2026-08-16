import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { PublicTrackingPage } from './PublicTrackingPage';
import * as publicService from '../services/publicService';
import type { PublicWorkOrder } from '../types';

vi.mock('../services/publicService');

const mockData: PublicWorkOrder = {
  number: 1024,
  status: 'EM_MANUTENCAO',
  entryDate: '2026-08-01T00:00:00.000Z',
  estimatedDelivery: '2026-08-18T00:00:00.000Z',
  completedAt: null,
  publicNotes: 'Aguardando peça para conclusão.',
  client: { firstName: 'João' },
  vehicle: { plate: 'ABC1234', brand: 'Chevrolet', model: 'Onix', year: 2021, color: 'Branco' },
  services: [{ name: 'Troca de óleo', price: 120 }],
  parts: [{ name: 'Filtro de óleo', quantity: 1, unitPrice: 35 }],
  photos: [],
  statusHistory: [{ status: 'EM_DIAGNOSTICO', createdAt: '2026-08-01T00:00:00.000Z' }],
  totals: { servicesTotal: 120, partsTotal: 35, laborCost: 0, total: 155, paid: 50, remaining: 105 },
};

function renderPage(token = 'abc-token') {
  return render(
    <MemoryRouter initialEntries={[`/acompanhar/${token}`]}>
      <Routes>
        <Route path="/acompanhar/:token" element={<PublicTrackingPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('PublicTrackingPage (acompanhamento do cliente)', () => {
  it('exibe status, veículo e orçamento sem exigir login', async () => {
    vi.mocked(publicService.fetchPublicWorkOrder).mockResolvedValue(mockData);

    renderPage();

    expect(await screen.findByText('Chevrolet Onix')).toBeInTheDocument();
    expect(screen.getByText('Em manutenção')).toBeInTheDocument();
    expect(screen.getByText('R$ 155,00')).toBeInTheDocument();
    expect(screen.getByText('Aguardando peça para conclusão.')).toBeInTheDocument();
  });

  it('exibe mensagem de erro amigável quando o token é inválido', async () => {
    vi.mocked(publicService.fetchPublicWorkOrder).mockRejectedValue({
      isAxiosError: true,
      response: { status: 404, data: { error: 'Ordem de serviço não encontrada.' } },
    });

    renderPage('token-invalido');

    expect(await screen.findByRole('alert')).toHaveTextContent(/ordem de serviço não encontrada/i);
  });
});

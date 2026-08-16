import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { NewWorkOrderPage } from './NewWorkOrderPage';
import * as clientService from '../services/clientService';
import * as vehicleService from '../services/vehicleService';
import * as workOrderService from '../services/workOrderService';
import { ToastProvider } from '../contexts/ToastContext';

vi.mock('../services/clientService');
vi.mock('../services/vehicleService');
vi.mock('../services/workOrderService');

const client = {
  id: 'client-1',
  name: 'João da Silva',
  cpf: '11122233344',
  phone: '11987654321',
};

const vehicle = {
  id: 'vehicle-1',
  clientId: 'client-1',
  plate: 'ABC1234',
  brand: 'Chevrolet',
  model: 'Onix',
  year: 2021,
  color: 'Branco',
  mileage: 15000,
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(clientService.listClients).mockResolvedValue([client] as any);
  vi.mocked(vehicleService.listVehicles).mockResolvedValue([vehicle] as any);
});

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/ordens/nova']}>
      <ToastProvider>
        <Routes>
          <Route path="/ordens/nova" element={<NewWorkOrderPage />} />
          <Route path="/ordens/:id" element={<div>Detalhe da OS</div>} />
        </Routes>
      </ToastProvider>
    </MemoryRouter>,
  );
}

describe('NewWorkOrderPage (criação de ordem de serviço)', () => {
  it('cria uma nova ordem de serviço com cliente, veículo e problema relatado', async () => {
    vi.mocked(workOrderService.createWorkOrder).mockResolvedValue({ id: 'wo-1' } as any);
    const user = userEvent.setup();

    renderPage();

    await user.selectOptions(await screen.findByRole('combobox', { name: /^cliente/i }), 'client-1');
    await user.selectOptions(screen.getByRole('combobox', { name: /^veículo/i }), 'vehicle-1');
    await user.type(screen.getByLabelText(/descrição do problema/i), 'Ruído estranho ao frear.');
    await user.click(screen.getByRole('button', { name: /criar ordem de serviço/i }));

    await waitFor(() => expect(workOrderService.createWorkOrder).toHaveBeenCalledTimes(1));
    const payload = vi.mocked(workOrderService.createWorkOrder).mock.calls[0][0];
    expect(payload.clientId).toBe('client-1');
    expect(payload.vehicleId).toBe('vehicle-1');
    expect(payload.problemDescription).toBe('Ruído estranho ao frear.');

    expect(await screen.findByText('Detalhe da OS')).toBeInTheDocument();
  });

  it('exige a descrição do problema antes de enviar', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.selectOptions(await screen.findByRole('combobox', { name: /^cliente/i }), 'client-1');
    await user.selectOptions(screen.getByRole('combobox', { name: /^veículo/i }), 'vehicle-1');
    await user.click(screen.getByRole('button', { name: /criar ordem de serviço/i }));

    expect(await screen.findByText(/descreva o problema relatado/i)).toBeInTheDocument();
    expect(workOrderService.createWorkOrder).not.toHaveBeenCalled();
  });
});

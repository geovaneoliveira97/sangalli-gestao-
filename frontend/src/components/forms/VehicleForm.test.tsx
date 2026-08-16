import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { VehicleForm } from './VehicleForm';

describe('VehicleForm (cadastro de veículo)', () => {
  it('valida campos obrigatórios antes de enviar', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();

    render(<VehicleForm fixedClientId="client-1" onSubmit={onSubmit} onCancel={vi.fn()} />);
    await user.click(screen.getByRole('button', { name: /salvar veículo/i }));

    expect(await screen.findByText(/placa inválida/i)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('envia os dados do veículo com a placa em maiúsculas', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();

    render(<VehicleForm fixedClientId="client-1" onSubmit={onSubmit} onCancel={vi.fn()} />);

    await user.type(screen.getByLabelText(/placa/i), 'abc1a23');
    await user.type(screen.getByLabelText(/^marca/i), 'Chevrolet');
    await user.type(screen.getByLabelText(/^modelo/i), 'Onix');
    await user.type(screen.getByLabelText(/^cor/i), 'Branco');

    await user.click(screen.getByRole('button', { name: /salvar veículo/i }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    const payload = onSubmit.mock.calls[0][0];
    expect(payload.clientId).toBe('client-1');
    expect(payload.plate).toBe('ABC1A23');
    expect(payload.brand).toBe('Chevrolet');
  });
});

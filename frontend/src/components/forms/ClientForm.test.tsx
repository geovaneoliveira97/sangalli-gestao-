import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ClientForm } from './ClientForm';
import * as cepService from '../../services/cepService';

vi.mock('../../services/cepService', async () => {
  const actual = await vi.importActual<typeof import('../../services/cepService')>(
    '../../services/cepService',
  );
  return { ...actual, fetchAddressByCep: vi.fn() };
});

describe('ClientForm (cadastro de cliente)', () => {
  it('valida campos obrigatórios antes de enviar', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();

    render(<ClientForm onSubmit={onSubmit} onCancel={vi.fn()} />);
    await user.click(screen.getByRole('button', { name: /salvar cliente/i }));

    expect(await screen.findByText(/informe o nome completo/i)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('envia os dados preenchidos corretamente', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();

    render(<ClientForm onSubmit={onSubmit} onCancel={vi.fn()} />);

    await user.type(screen.getByLabelText(/nome completo/i), 'Maria Oliveira Santos');
    await user.type(screen.getByLabelText(/^cpf/i), '11122233344');
    await user.type(screen.getByLabelText(/^telefone/i), '11987654321');
    await user.click(screen.getByRole('button', { name: /salvar cliente/i }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    const payload = onSubmit.mock.calls[0][0];
    expect(payload.name).toBe('Maria Oliveira Santos');
    expect(payload.cpf).toBe('111.222.333-44');
  });

  it('preenche o endereço automaticamente ao buscar um CEP válido', async () => {
    vi.mocked(cepService.fetchAddressByCep).mockResolvedValue({
      street: 'Avenida Paulista',
      district: 'Bela Vista',
      city: 'São Paulo',
      state: 'SP',
    });

    const user = userEvent.setup();
    render(<ClientForm onSubmit={vi.fn()} onCancel={vi.fn()} />);

    await user.type(screen.getByLabelText(/cep/i), '01310100');
    await user.tab();

    expect(await screen.findByDisplayValue('Avenida Paulista')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Bela Vista')).toBeInTheDocument();
    expect(screen.getByDisplayValue('São Paulo')).toBeInTheDocument();
  });

  it('exibe erro amigável quando o CEP não é encontrado', async () => {
    vi.mocked(cepService.fetchAddressByCep).mockRejectedValue(
      new cepService.CepError('CEP não encontrado.'),
    );

    const user = userEvent.setup();
    render(<ClientForm onSubmit={vi.fn()} onCancel={vi.fn()} />);

    await user.type(screen.getByLabelText(/cep/i), '99999999');
    await user.tab();

    expect(await screen.findByText('CEP não encontrado.')).toBeInTheDocument();
  });
});

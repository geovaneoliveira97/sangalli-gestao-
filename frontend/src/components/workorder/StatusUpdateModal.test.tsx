import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StatusUpdateModal } from './StatusUpdateModal';

describe('StatusUpdateModal', () => {
  it('permite selecionar um novo status e confirma a atualização', async () => {
    const user = userEvent.setup();
    const onUpdate = vi.fn().mockResolvedValue(undefined);

    render(
      <StatusUpdateModal
        isOpen
        currentStatus="EM_DIAGNOSTICO"
        onClose={vi.fn()}
        onUpdate={onUpdate}
      />,
    );

    await user.selectOptions(screen.getByLabelText(/novo status/i), 'EM_MANUTENCAO');
    await user.type(screen.getByLabelText(/observação/i), 'Peça recebida, iniciando serviço.');
    await user.click(screen.getByRole('button', { name: /^atualizar$/i }));

    expect(onUpdate).toHaveBeenCalledWith('EM_MANUTENCAO', 'Peça recebida, iniciando serviço.');
  });
});

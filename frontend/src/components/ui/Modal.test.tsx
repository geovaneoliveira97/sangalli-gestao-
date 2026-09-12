import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Modal } from './Modal';

/**
 * Reproduz o padrão real de uso do Modal: a tela que o abre guarda um
 * estado (`values`) e recria `onClose` a cada renderização — exatamente
 * como ClientsPage, VehiclesPage, ServicesPage, PartsPage e UsersPage fazem
 * (`onClose={() => setIsModalOpen(false)}`).
 *
 * Bug histórico: o efeito que dá foco ao modal dependia de `onClose`, então
 * rodava de novo a cada tecla digitada (o `onChange` do campo muda o estado
 * do componente pai, que recria `onClose`), roubando o foco do campo de
 * volta para o contêiner do modal — só era possível digitar uma letra por
 * vez. Este teste garante que isso não volte a acontecer.
 */
function FormInsideModal() {
  const [isOpen, setIsOpen] = useState(true);
  const [email, setEmail] = useState('');

  return (
    <Modal title="Novo usuário" isOpen={isOpen} onClose={() => setIsOpen(false)}>
      <label htmlFor="email">E-mail</label>
      <input id="email" value={email} onChange={(e) => setEmail(e.target.value)} />
    </Modal>
  );
}

describe('Modal', () => {
  it('não perde o foco do campo a cada tecla digitada', async () => {
    const user = userEvent.setup();
    render(<FormInsideModal />);

    const input = screen.getByLabelText('E-mail');
    await user.type(input, 'deise@exemplo.com');

    expect(input).toHaveValue('deise@exemplo.com');
  });

  it('fecha ao pressionar Esc, usando sempre o onClose mais recente', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();

    render(
      <Modal title="Teste" isOpen onClose={onClose}>
        <p>Conteúdo</p>
      </Modal>,
    );

    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

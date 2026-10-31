import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { LoginPage } from './LoginPage';
import { AuthProvider } from '../contexts/AuthContext';
import * as authService from '../services/authService';

vi.mock('../services/authService');

function renderLoginPage() {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});

describe('LoginPage', () => {
  it('autentica o usuário e salva a sessão ao enviar credenciais válidas', async () => {
    vi.mocked(authService.login).mockResolvedValue({
      token: 'fake-jwt-token',
      user: { id: '1', name: 'Ana Paula Ferreira', email: 'admin@autocontrol.com.br', role: 'ADMIN', active: true },
    });

    const user = userEvent.setup();
    renderLoginPage();

    await user.type(screen.getByLabelText(/e-mail/i), 'admin@autocontrol.com.br');
    await user.type(screen.getByLabelText(/senha/i), '123456');
    await user.click(screen.getByRole('button', { name: /entrar/i }));

    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith('admin@autocontrol.com.br', '123456');
    });
    await waitFor(() => {
      expect(localStorage.getItem('autocontrol:token')).toBe('fake-jwt-token');
    });
  });

  it('exibe mensagem de erro quando as credenciais são inválidas', async () => {
    vi.mocked(authService.login).mockRejectedValue({
      isAxiosError: true,
      response: { status: 401, data: { error: 'E-mail ou senha inválidos.' } },
    });

    const user = userEvent.setup();
    renderLoginPage();

    await user.type(screen.getByLabelText(/e-mail/i), 'admin@autocontrol.com.br');
    await user.type(screen.getByLabelText(/senha/i), 'senha-errada');
    await user.click(screen.getByRole('button', { name: /entrar/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/e-mail ou senha inválidos/i);
  });

  it('avança do e-mail para a senha com Enter, sem enviar o formulário', async () => {
    const user = userEvent.setup();
    renderLoginPage();

    await user.type(screen.getByLabelText(/e-mail/i), 'admin@autocontrol.com.br{Enter}');

    expect(screen.getByLabelText(/senha/i)).toHaveFocus();
    expect(authService.login).not.toHaveBeenCalled();
  });

  it('envia o formulário com Enter no campo de senha', async () => {
    vi.mocked(authService.login).mockResolvedValue({
      token: 'fake-jwt-token',
      user: { id: '1', name: 'Ana Paula Ferreira', email: 'admin@autocontrol.com.br', role: 'ADMIN', active: true },
    });

    const user = userEvent.setup();
    renderLoginPage();

    await user.type(screen.getByLabelText(/e-mail/i), 'admin@autocontrol.com.br{Enter}');
    await user.keyboard('123456{Enter}');

    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith('admin@autocontrol.com.br', '123456');
    });
  });

  it('mostra e oculta a senha sem enviar o formulário', async () => {
    const user = userEvent.setup();
    renderLoginPage();

    const password = screen.getByLabelText(/senha/i);
    const toggle = screen.getByRole('button', { name: /mostrar senha/i });
    expect(password).toHaveAttribute('type', 'password');

    await user.click(toggle);
    expect(password).toHaveAttribute('type', 'text');
    expect(toggle).toHaveAttribute('aria-pressed', 'true');

    await user.click(toggle);
    expect(password).toHaveAttribute('type', 'password');
    expect(authService.login).not.toHaveBeenCalled();
  });

  it('bloqueia o envio repetido enquanto a requisição está em andamento', async () => {
    vi.mocked(authService.login).mockReturnValue(new Promise(() => {}));

    const user = userEvent.setup();
    renderLoginPage();

    await user.click(screen.getByRole('button', { name: /entrar/i }));

    expect(await screen.findByRole('button', { name: /entrar/i })).toBeDisabled();
  });
});

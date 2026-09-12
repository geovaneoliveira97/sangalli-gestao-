import request from 'supertest';
import { createApp } from '../src/app';

export const app = createApp();

// Permite rodar os testes contra um banco onde a senha de demonstração já
// foi trocada (ex.: depois do handoff para o cliente final) — basta definir
// TEST_ADMIN_PASSWORD no ambiente com a senha real.
const DEFAULT_TEST_PASSWORD = process.env.TEST_ADMIN_PASSWORD ?? '123456';

export async function loginAs(email: string, password = DEFAULT_TEST_PASSWORD) {
  const response = await request(app).post('/api/auth/login').send({ email, password });
  if (response.status !== 200) {
    throw new Error(
      `Falha ao autenticar ${email} nos testes. Se a senha de demonstração (123456) já foi ` +
        'alterada, defina TEST_ADMIN_PASSWORD no ambiente com a senha atual, ou rode "npm run seed" ' +
        'num banco de testes separado.',
    );
  }
  return response.body.token as string;
}

export const CREDENTIALS = {
  admin: 'admin@autocontrol.com.br',
};

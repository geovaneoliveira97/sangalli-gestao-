import request from 'supertest';
import { createApp } from '../src/app';

export const app = createApp();

export async function loginAs(email: string, password = '123456') {
  const response = await request(app).post('/api/auth/login').send({ email, password });
  if (response.status !== 200) {
    throw new Error(
      `Falha ao autenticar ${email} nos testes. Execute "npm run seed" antes de rodar os testes.`,
    );
  }
  return response.body.token as string;
}

export const CREDENTIALS = {
  admin: 'admin@autocontrol.com.br',
  atendente: 'atendente@autocontrol.com.br',
  mecanico: 'mecanico@autocontrol.com.br',
};

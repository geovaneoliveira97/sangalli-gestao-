import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { app, CREDENTIALS, loginAs } from './helpers';

describe('Autenticação', () => {
  it('autentica um administrador com credenciais válidas', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: CREDENTIALS.admin, password: '123456' });

    expect(response.status).toBe(200);
    expect(response.body.token).toBeDefined();
    expect(response.body.user.role).toBe('ADMIN');
  });

  it('rejeita credenciais inválidas', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: CREDENTIALS.admin, password: 'senha-errada' });

    expect(response.status).toBe(401);
  });

  it('rejeita corpo de requisição inválido', async () => {
    const response = await request(app).post('/api/auth/login').send({ email: 'nao-e-email' });

    expect(response.status).toBe(422);
  });

  it('retorna os dados do usuário autenticado em /me', async () => {
    const token = await loginAs(CREDENTIALS.admin);
    const response = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.email).toBe(CREDENTIALS.admin);
  });

  it('bloqueia acesso sem token', async () => {
    const response = await request(app).get('/api/auth/me');
    expect(response.status).toBe(401);
  });
});

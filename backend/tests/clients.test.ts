import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { app, CREDENTIALS, loginAs } from './helpers';
import prisma from '../src/utils/prisma';

describe('CRUD de clientes', () => {
  let adminToken: string;
  let mecanicoToken: string;
  let createdId: string;
  const cpf = `999${Date.now().toString().slice(-8)}`;

  beforeAll(async () => {
    adminToken = await loginAs(CREDENTIALS.admin);
    mecanicoToken = await loginAs(CREDENTIALS.mecanico);
  });

  afterAll(async () => {
    if (createdId) {
      await prisma.client.deleteMany({ where: { id: createdId } });
    }
  });

  it('cria um cliente com dados válidos', async () => {
    const response = await request(app)
      .post('/api/clientes')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Cliente de Teste Automatizado',
        cpf,
        phone: '(11) 90000-0000',
      });

    expect(response.status).toBe(201);
    expect(response.body.id).toBeDefined();
    createdId = response.body.id;
  });

  it('rejeita cliente sem nome', async () => {
    const response = await request(app)
      .post('/api/clientes')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ cpf: '00000000000', phone: '11999999999' });

    expect(response.status).toBe(422);
  });

  it('lista clientes cadastrados', async () => {
    const response = await request(app)
      .get('/api/clientes')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.some((c: { id: string }) => c.id === createdId)).toBe(true);
  });

  it('atualiza um cliente existente', async () => {
    const response = await request(app)
      .put(`/api/clientes/${createdId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ phone: '(11) 91111-1111' });

    expect(response.status).toBe(200);
    expect(response.body.phone).toBe('(11) 91111-1111');
  });

  it('impede mecânico de criar cliente (controle de permissões)', async () => {
    const response = await request(app)
      .post('/api/clientes')
      .set('Authorization', `Bearer ${mecanicoToken}`)
      .send({ name: 'Não deveria criar', cpf: '22222222222', phone: '11988887777' });

    expect(response.status).toBe(403);
  });

  it('remove um cliente', async () => {
    const response = await request(app)
      .delete(`/api/clientes/${createdId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(204);
    createdId = '';
  });
});

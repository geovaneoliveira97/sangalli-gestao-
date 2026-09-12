import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { app, CREDENTIALS, loginAs } from './helpers';
import prisma from '../src/utils/prisma';

describe('CRUD de clientes', () => {
  let adminToken: string;
  let createdId: string;
  const cpf = `999${Date.now().toString().slice(-8)}`;

  beforeAll(async () => {
    adminToken = await loginAs(CREDENTIALS.admin);
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

  it('cria um cliente sem informar CPF (dado sensível não é obrigatório)', async () => {
    const response = await request(app)
      .post('/api/clientes')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Cliente Sem CPF',
        phone: '(11) 90000-0002',
      });

    expect(response.status).toBe(201);
    expect(response.body.cpf).toBeNull();
    await prisma.client.deleteMany({ where: { id: response.body.id } });
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

  it('remove um cliente', async () => {
    const response = await request(app)
      .delete(`/api/clientes/${createdId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(204);
    createdId = '';
  });
});

describe('remoção de cliente com histórico', () => {
  let adminToken: string;
  let clientId: string;
  let vehicleId: string;
  let workOrderId: string;

  beforeAll(async () => {
    adminToken = await loginAs(CREDENTIALS.admin);

    const clientResponse = await request(app)
      .post('/api/clientes')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Cliente Com Histórico',
        cpf: `998${Date.now().toString().slice(-8)}`,
        phone: '(11) 90000-0001',
      });
    clientId = clientResponse.body.id;

    const vehicleResponse = await request(app)
      .post('/api/veiculos')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        clientId,
        plate: `TST${Date.now().toString().slice(-4)}`,
        brand: 'Fiat',
        model: 'Uno',
        year: 2020,
        color: 'Branco',
      });
    vehicleId = vehicleResponse.body.id;

    const workOrderResponse = await request(app)
      .post('/api/ordens')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ clientId, vehicleId, problemDescription: 'Barulho no motor' });
    workOrderId = workOrderResponse.body.id;
  });

  afterAll(async () => {
    await prisma.workOrder.deleteMany({ where: { id: workOrderId } });
    await prisma.vehicle.deleteMany({ where: { id: vehicleId } });
    await prisma.client.deleteMany({ where: { id: clientId } });
  });

  it('recusa remover um veículo com ordem de serviço, com mensagem explicativa', async () => {
    const response = await request(app)
      .delete(`/api/veiculos/${vehicleId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(409);
    expect(response.body.error).toMatch(/ordem de serviço/i);
  });

  it('recusa remover um cliente com ordem de serviço, com mensagem explicativa', async () => {
    const response = await request(app)
      .delete(`/api/clientes/${clientId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(409);
    expect(response.body.error).toMatch(/ordem de serviço/i);
  });
});

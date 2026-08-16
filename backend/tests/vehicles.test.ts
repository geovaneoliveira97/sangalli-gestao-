import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { app, CREDENTIALS, loginAs } from './helpers';
import prisma from '../src/utils/prisma';

describe('CRUD de veículos', () => {
  let adminToken: string;
  let clientId: string;
  let vehicleId: string;
  const plate = `TST${Date.now().toString().slice(-4)}`;

  beforeAll(async () => {
    adminToken = await loginAs(CREDENTIALS.admin);
    const client = await prisma.client.create({
      data: {
        name: 'Cliente para Veículo de Teste',
        cpf: `888${Date.now().toString().slice(-8)}`,
        phone: '(11) 90000-1111',
      },
    });
    clientId = client.id;
  });

  afterAll(async () => {
    if (vehicleId) await prisma.vehicle.deleteMany({ where: { id: vehicleId } });
    await prisma.client.delete({ where: { id: clientId } });
  });

  it('cria um veículo vinculado a um cliente', async () => {
    const response = await request(app)
      .post('/api/veiculos')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        clientId,
        plate,
        brand: 'Chevrolet',
        model: 'Onix',
        year: 2022,
        color: 'Branco',
        mileage: 15000,
      });

    expect(response.status).toBe(201);
    expect(response.body.plate).toBe(plate.toUpperCase());
    vehicleId = response.body.id;
  });

  it('busca o veículo criado com os dados do cliente', async () => {
    const response = await request(app)
      .get(`/api/veiculos/${vehicleId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.client.id).toBe(clientId);
  });

  it('rejeita placa duplicada', async () => {
    const response = await request(app)
      .post('/api/veiculos')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ clientId, plate, brand: 'Fiat', model: 'Argo', year: 2021, color: 'Preto' });

    expect(response.status).toBe(409);
  });
});

import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { app, CREDENTIALS, loginAs } from './helpers';
import prisma from '../src/utils/prisma';

describe('Catálogo (serviços e peças): remoção inteligente', () => {
  let adminToken: string;
  let clientId: string;
  let vehicleId: string;
  let workOrderId: string;

  beforeAll(async () => {
    adminToken = await loginAs(CREDENTIALS.admin);

    const client = await prisma.client.create({
      data: { name: 'Cliente para Catálogo', phone: '(11) 90000-3333' },
    });
    clientId = client.id;

    const vehicle = await prisma.vehicle.create({
      data: {
        clientId,
        plate: `CAT${Date.now().toString().slice(-4)}`,
        brand: 'Fiat',
        model: 'Palio',
        year: 2018,
        color: 'Azul',
      },
    });
    vehicleId = vehicle.id;

    const workOrder = await prisma.workOrder.create({
      data: { clientId, vehicleId, problemDescription: 'Revisão geral', laborCost: 0 },
    });
    workOrderId = workOrder.id;
  });

  afterAll(async () => {
    await prisma.workOrder.deleteMany({ where: { id: workOrderId } });
    await prisma.vehicle.deleteMany({ where: { id: vehicleId } });
    await prisma.client.deleteMany({ where: { id: clientId } });
  });

  it('remove definitivamente um serviço que nunca foi usado em nenhuma OS', async () => {
    const create = await request(app)
      .post('/api/servicos')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Serviço Nunca Usado', defaultPrice: 50 });
    expect(create.status).toBe(201);

    const del = await request(app)
      .delete(`/api/servicos/${create.body.id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(del.status).toBe(200);
    expect(del.body.deleted).toBe(true);

    const list = await request(app)
      .get('/api/servicos')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(list.body.some((s: { id: string }) => s.id === create.body.id)).toBe(false);
  });

  it('apenas desativa (preserva histórico) um serviço já usado em uma OS', async () => {
    const create = await request(app)
      .post('/api/servicos')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Serviço Já Usado', defaultPrice: 80 });
    const serviceId = create.body.id;

    await request(app)
      .post(`/api/ordens/${workOrderId}/servicos`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ serviceId });

    const del = await request(app)
      .delete(`/api/servicos/${serviceId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(del.status).toBe(200);
    expect(del.body.deleted).toBe(false);
    expect(del.body.deactivated).toBe(true);
    expect(del.body.usageCount).toBe(1);

    const stillThere = await prisma.service.findUnique({ where: { id: serviceId } });
    expect(stillThere).not.toBeNull();
    expect(stillThere?.active).toBe(false);
  });

  it('remove definitivamente uma peça que nunca foi usada em nenhuma OS', async () => {
    const create = await request(app)
      .post('/api/pecas')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Peça Nunca Usada', code: `NOVA-${Date.now()}`, price: 30, stock: 5 });
    expect(create.status).toBe(201);

    const del = await request(app)
      .delete(`/api/pecas/${create.body.id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(del.status).toBe(200);
    expect(del.body.deleted).toBe(true);

    const found = await prisma.part.findUnique({ where: { id: create.body.id } });
    expect(found).toBeNull();
  });

  it('apenas desativa (preserva histórico) uma peça já usada em uma OS', async () => {
    const create = await request(app)
      .post('/api/pecas')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Peça Já Usada', code: `USADA-${Date.now()}`, price: 60, stock: 5 });
    const partId = create.body.id;

    await request(app)
      .post(`/api/ordens/${workOrderId}/pecas`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ partId, quantity: 1 });

    const del = await request(app)
      .delete(`/api/pecas/${partId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(del.status).toBe(200);
    expect(del.body.deleted).toBe(false);
    expect(del.body.deactivated).toBe(true);

    const stillThere = await prisma.part.findUnique({ where: { id: partId } });
    expect(stillThere).not.toBeNull();
    expect(stillThere?.active).toBe(false);
  });
});

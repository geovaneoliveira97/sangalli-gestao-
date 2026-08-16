import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { app, CREDENTIALS, loginAs } from './helpers';
import prisma from '../src/utils/prisma';

describe('Ordens de serviço', () => {
  let adminToken: string;
  let clientId: string;
  let vehicleId: string;
  let workOrderId: string;
  let publicToken: string;
  let serviceId: string;
  let partId: string;

  beforeAll(async () => {
    adminToken = await loginAs(CREDENTIALS.admin);

    const client = await prisma.client.create({
      data: {
        name: 'Cliente para OS de Teste',
        cpf: `777${Date.now().toString().slice(-8)}`,
        phone: '(11) 90000-2222',
      },
    });
    clientId = client.id;

    const vehicle = await prisma.vehicle.create({
      data: {
        clientId,
        plate: `OSX${Date.now().toString().slice(-4)}`,
        brand: 'Toyota',
        model: 'Corolla',
        year: 2021,
        color: 'Prata',
      },
    });
    vehicleId = vehicle.id;

    const service =
      (await prisma.service.findFirst({ where: { active: true } })) ??
      (await prisma.service.create({
        data: { name: 'Serviço de teste', defaultPrice: 100, active: true },
      }));
    serviceId = service.id;

    const part =
      (await prisma.part.findFirst({ where: { active: true } })) ??
      (await prisma.part.create({
        data: { name: 'Peça de teste', code: `TESTE-${Date.now()}`, price: 50, stock: 10 },
      }));
    partId = part.id;
  });

  afterAll(async () => {
    if (workOrderId) await prisma.workOrder.delete({ where: { id: workOrderId } }).catch(() => undefined);
    await prisma.vehicle.delete({ where: { id: vehicleId } }).catch(() => undefined);
    await prisma.client.delete({ where: { id: clientId } }).catch(() => undefined);
  });

  it('cria uma nova ordem de serviço', async () => {
    const response = await request(app)
      .post('/api/ordens')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        clientId,
        vehicleId,
        problemDescription: 'Ruído estranho ao frear.',
        laborCost: 100,
      });

    expect(response.status).toBe(201);
    expect(response.body.status).toBe('EM_DIAGNOSTICO');
    workOrderId = response.body.id;
    publicToken = response.body.publicToken;
  });

  it('adiciona um serviço à ordem', async () => {
    const response = await request(app)
      .post(`/api/ordens/${workOrderId}/servicos`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ serviceId });

    expect(response.status).toBe(201);
    expect(response.body.services.length).toBe(1);
  });

  it('adiciona uma peça à ordem', async () => {
    const response = await request(app)
      .post(`/api/ordens/${workOrderId}/pecas`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ partId, quantity: 2 });

    expect(response.status).toBe(201);
    expect(response.body.parts.length).toBe(1);
  });

  it('calcula o total da ordem (serviços + peças + mão de obra)', async () => {
    const response = await request(app)
      .get(`/api/ordens/${workOrderId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    const { totals } = response.body;
    expect(totals.total).toBeCloseTo(totals.servicesTotal + totals.partsTotal + totals.laborCost, 2);
    expect(totals.remaining).toBe(totals.total);
  });

  it('registra um pagamento parcial e recalcula o saldo restante', async () => {
    const detail = await request(app)
      .get(`/api/ordens/${workOrderId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    const total = detail.body.totals.total;

    const response = await request(app)
      .post(`/api/ordens/${workOrderId}/pagamentos`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ amount: 50, method: 'PIX' });

    expect(response.status).toBe(201);
    expect(response.body.totals.paid).toBe(50);
    expect(response.body.totals.remaining).toBeCloseTo(total - 50, 2);
  });

  it('altera o status da ordem e registra na timeline', async () => {
    const response = await request(app)
      .post(`/api/ordens/${workOrderId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'EM_MANUTENCAO', note: 'Iniciando reparo.' });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('EM_MANUTENCAO');
    expect(response.body.statusHistory.some((h: { status: string }) => h.status === 'EM_MANUTENCAO')).toBe(
      true,
    );
  });

  it('consulta a ordem publicamente pelo token, sem expor dados internos', async () => {
    const response = await request(app).get(`/api/acompanhar/${publicToken}`);

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('EM_MANUTENCAO');
    expect(response.body.totals.total).toBeDefined();
    expect(response.body.internalNotes).toBeUndefined();
    expect(response.body.client?.name).toBeUndefined();
  });

  it('retorna 404 para token público inexistente', async () => {
    const response = await request(app).get('/api/acompanhar/token-que-nao-existe');
    expect(response.status).toBe(404);
  });
});

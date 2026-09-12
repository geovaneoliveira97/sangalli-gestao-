import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { asyncHandler } from '../utils/asyncHandler';
import { createClientSchema, updateClientSchema } from '../validators/clientValidators';
import { ConflictError, NotFoundError } from '../utils/AppError';

export const listClients = asyncHandler(async (req: Request, res: Response) => {
  const search = typeof req.query.search === 'string' ? req.query.search : undefined;

  const clients = await prisma.client.findMany({
    where: search
      ? {
          OR: [
            { name: { contains: search } },
            { cpf: { contains: search } },
            { phone: { contains: search } },
          ],
        }
      : undefined,
    orderBy: { name: 'asc' },
    include: { _count: { select: { vehicles: true } } },
  });

  return res.json(clients);
});

export const getClient = asyncHandler(async (req: Request, res: Response) => {
  const client = await prisma.client.findUnique({
    where: { id: req.params.id },
    include: { vehicles: true },
  });
  if (!client) throw new NotFoundError('Cliente não encontrado.');
  return res.json(client);
});

export const createClient = asyncHandler(async (req: Request, res: Response) => {
  const data = createClientSchema.parse(req.body);
  const client = await prisma.client.create({
    // string vazia vira null (não undefined) para não colidir com a
    // restrição de unicidade do CPF quando o campo fica em branco.
    data: { ...data, email: data.email || null, cpf: data.cpf || null },
  });
  return res.status(201).json(client);
});

export const updateClient = asyncHandler(async (req: Request, res: Response) => {
  const data = updateClientSchema.parse(req.body);
  const existing = await prisma.client.findUnique({ where: { id: req.params.id } });
  if (!existing) throw new NotFoundError('Cliente não encontrado.');

  const client = await prisma.client.update({
    where: { id: req.params.id },
    data: {
      ...data,
      email: data.email || undefined,
      cpf: data.cpf === undefined ? undefined : data.cpf || null,
    },
  });
  return res.json(client);
});

export const deleteClient = asyncHandler(async (req: Request, res: Response) => {
  const existing = await prisma.client.findUnique({ where: { id: req.params.id } });
  if (!existing) throw new NotFoundError('Cliente não encontrado.');

  // Veículos do cliente são removidos em cascata pelo banco, mas ordens de
  // serviço não (precisam ser preservadas como histórico/comprovante). Se
  // existir qualquer OS ligada ao cliente ou a um de seus veículos, a
  // exclusão do cliente violaria essa referência — avisamos antes de tentar.
  const linkedWorkOrders = await prisma.workOrder.count({
    where: { OR: [{ clientId: existing.id }, { vehicle: { clientId: existing.id } }] },
  });
  if (linkedWorkOrders > 0) {
    const noun = linkedWorkOrders === 1 ? 'ordem de serviço registrada' : 'ordens de serviço registradas';
    throw new ConflictError(
      `Não é possível remover este cliente: há ${linkedWorkOrders} ${noun} para ele. Ordens de serviço existentes precisam ser preservadas como histórico.`,
    );
  }

  await prisma.client.delete({ where: { id: req.params.id } });
  return res.status(204).send();
});

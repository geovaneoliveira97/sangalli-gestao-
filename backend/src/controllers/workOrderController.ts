import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError, NotFoundError } from '../utils/AppError';
import { calculateWorkOrderTotals } from '../utils/workOrderCalculations';
import {
  addPartSchema,
  addPaymentSchema,
  addServiceSchema,
  createWorkOrderSchema,
  updateStatusSchema,
  updateWorkOrderSchema,
} from '../validators/workOrderValidators';

const detailInclude = {
  client: true,
  vehicle: true,
  services: { include: { service: true }, orderBy: { createdAt: 'asc' as const } },
  parts: { include: { part: true }, orderBy: { createdAt: 'asc' as const } },
  photos: { orderBy: { createdAt: 'asc' as const } },
  payments: { orderBy: { paidAt: 'asc' as const } },
  statusHistory: {
    include: { user: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'asc' as const },
  },
};

function serialize(workOrder: any) {
  const totals = calculateWorkOrderTotals(workOrder);
  return { ...workOrder, totals };
}

export const listWorkOrders = asyncHandler(async (req: Request, res: Response) => {
  const status = typeof req.query.status === 'string' ? req.query.status : undefined;
  const search = typeof req.query.search === 'string' ? req.query.search : undefined;

  const workOrders = await prisma.workOrder.findMany({
    where: {
      status: status ? (status as any) : undefined,
      ...(search
        ? {
            OR: [
              { vehicle: { plate: { contains: search } } },
              { client: { name: { contains: search } } },
            ],
          }
        : {}),
    },
    include: {
      client: { select: { id: true, name: true } },
      vehicle: { select: { id: true, plate: true, brand: true, model: true } },
      services: true,
      parts: true,
      payments: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return res.json(workOrders.map(serialize));
});

export const getWorkOrder = asyncHandler(async (req: Request, res: Response) => {
  const workOrder = await prisma.workOrder.findUnique({
    where: { id: req.params.id },
    include: detailInclude,
  });
  if (!workOrder) throw new NotFoundError('Ordem de serviço não encontrada.');
  return res.json(serialize(workOrder));
});

export const createWorkOrder = asyncHandler(async (req: Request, res: Response) => {
  const data = createWorkOrderSchema.parse(req.body);

  const workOrder = await prisma.workOrder.create({
    data: {
      ...data,
      statusHistory: {
        create: {
          status: 'EM_DIAGNOSTICO',
          note: 'Ordem de serviço criada.',
          userId: req.user?.sub,
        },
      },
    },
    include: detailInclude,
  });

  return res.status(201).json(serialize(workOrder));
});

export const updateWorkOrder = asyncHandler(async (req: Request, res: Response) => {
  const data = updateWorkOrderSchema.parse(req.body);
  const existing = await prisma.workOrder.findUnique({ where: { id: req.params.id } });
  if (!existing) throw new NotFoundError('Ordem de serviço não encontrada.');

  const workOrder = await prisma.workOrder.update({
    where: { id: req.params.id },
    data,
    include: detailInclude,
  });

  return res.json(serialize(workOrder));
});

export const deleteWorkOrder = asyncHandler(async (req: Request, res: Response) => {
  const existing = await prisma.workOrder.findUnique({ where: { id: req.params.id } });
  if (!existing) throw new NotFoundError('Ordem de serviço não encontrada.');

  await prisma.workOrder.delete({ where: { id: req.params.id } });
  return res.status(204).send();
});

export const updateWorkOrderStatus = asyncHandler(async (req: Request, res: Response) => {
  const data = updateStatusSchema.parse(req.body);
  const existing = await prisma.workOrder.findUnique({ where: { id: req.params.id } });
  if (!existing) throw new NotFoundError('Ordem de serviço não encontrada.');

  const workOrder = await prisma.workOrder.update({
    where: { id: req.params.id },
    data: {
      status: data.status,
      completedAt: data.status === 'ENTREGUE' ? new Date() : existing.completedAt,
      statusHistory: {
        create: {
          status: data.status,
          note: data.note,
          userId: req.user?.sub,
        },
      },
    },
    include: detailInclude,
  });

  return res.json(serialize(workOrder));
});

export const addWorkOrderService = asyncHandler(async (req: Request, res: Response) => {
  const data = addServiceSchema.parse(req.body);
  const workOrder = await prisma.workOrder.findUnique({ where: { id: req.params.id } });
  if (!workOrder) throw new NotFoundError('Ordem de serviço não encontrada.');

  const service = await prisma.service.findUnique({ where: { id: data.serviceId } });
  if (!service) throw new NotFoundError('Serviço não encontrado.');

  await prisma.workOrderService.create({
    data: {
      workOrderId: workOrder.id,
      serviceId: service.id,
      price: data.price ?? service.defaultPrice,
    },
  });

  const updated = await prisma.workOrder.findUnique({
    where: { id: workOrder.id },
    include: detailInclude,
  });
  return res.status(201).json(serialize(updated));
});

export const removeWorkOrderService = asyncHandler(async (req: Request, res: Response) => {
  const item = await prisma.workOrderService.findUnique({ where: { id: req.params.itemId } });
  if (!item || item.workOrderId !== req.params.id) {
    throw new NotFoundError('Serviço da OS não encontrado.');
  }
  await prisma.workOrderService.delete({ where: { id: req.params.itemId } });

  const updated = await prisma.workOrder.findUnique({
    where: { id: req.params.id },
    include: detailInclude,
  });
  return res.json(serialize(updated));
});

export const addWorkOrderPart = asyncHandler(async (req: Request, res: Response) => {
  const data = addPartSchema.parse(req.body);
  const workOrder = await prisma.workOrder.findUnique({ where: { id: req.params.id } });
  if (!workOrder) throw new NotFoundError('Ordem de serviço não encontrada.');

  const part = await prisma.part.findUnique({ where: { id: data.partId } });
  if (!part) throw new NotFoundError('Peça não encontrada.');

  await prisma.workOrderPart.create({
    data: {
      workOrderId: workOrder.id,
      partId: part.id,
      quantity: data.quantity,
      unitPrice: data.unitPrice ?? part.price,
    },
  });

  const updated = await prisma.workOrder.findUnique({
    where: { id: workOrder.id },
    include: detailInclude,
  });
  return res.status(201).json(serialize(updated));
});

export const removeWorkOrderPart = asyncHandler(async (req: Request, res: Response) => {
  const item = await prisma.workOrderPart.findUnique({ where: { id: req.params.itemId } });
  if (!item || item.workOrderId !== req.params.id) {
    throw new NotFoundError('Peça da OS não encontrada.');
  }
  await prisma.workOrderPart.delete({ where: { id: req.params.itemId } });

  const updated = await prisma.workOrder.findUnique({
    where: { id: req.params.id },
    include: detailInclude,
  });
  return res.json(serialize(updated));
});

export const addWorkOrderPayment = asyncHandler(async (req: Request, res: Response) => {
  const data = addPaymentSchema.parse(req.body);
  const workOrder = await prisma.workOrder.findUnique({
    where: { id: req.params.id },
    include: detailInclude,
  });
  if (!workOrder) throw new NotFoundError('Ordem de serviço não encontrada.');

  const totals = calculateWorkOrderTotals(workOrder);
  if (data.amount > totals.remaining + 0.01) {
    throw new AppError('O valor do pagamento excede o saldo restante da ordem de serviço.');
  }

  await prisma.payment.create({
    data: {
      workOrderId: workOrder.id,
      amount: data.amount,
      method: data.method,
      notes: data.notes,
    },
  });

  const updated = await prisma.workOrder.findUnique({
    where: { id: workOrder.id },
    include: detailInclude,
  });
  return res.status(201).json(serialize(updated));
});

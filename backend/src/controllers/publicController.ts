import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { asyncHandler } from '../utils/asyncHandler';
import { NotFoundError } from '../utils/AppError';
import { calculateWorkOrderTotals } from '../utils/workOrderCalculations';

export const trackWorkOrder = asyncHandler(async (req: Request, res: Response) => {
  const workOrder = await prisma.workOrder.findUnique({
    where: { publicToken: req.params.token },
    include: {
      client: { select: { name: true } },
      vehicle: { select: { plate: true, brand: true, model: true, year: true, color: true } },
      services: { include: { service: { select: { name: true } } } },
      parts: { include: { part: { select: { name: true } } } },
      photos: { orderBy: { createdAt: 'asc' } },
      payments: true,
      statusHistory: { orderBy: { createdAt: 'asc' } },
    },
  });

  if (!workOrder) {
    throw new NotFoundError('Ordem de serviço não encontrada. Verifique o link recebido.');
  }

  const totals = calculateWorkOrderTotals(workOrder);

  return res.json({
    number: workOrder.number,
    status: workOrder.status,
    entryDate: workOrder.entryDate,
    estimatedDelivery: workOrder.estimatedDelivery,
    completedAt: workOrder.completedAt,
    publicNotes: workOrder.publicNotes,
    client: { firstName: workOrder.client.name.split(' ')[0] },
    vehicle: workOrder.vehicle,
    services: workOrder.services.map((s) => ({ name: s.service.name, price: s.price })),
    parts: workOrder.parts.map((p) => ({
      name: p.part.name,
      quantity: p.quantity,
      unitPrice: p.unitPrice,
    })),
    photos: workOrder.photos.map((p) => ({
      url: p.url,
      category: p.category,
      caption: p.caption,
    })),
    statusHistory: workOrder.statusHistory.map((h) => ({
      status: h.status,
      createdAt: h.createdAt,
    })),
    totals,
  });
});

import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { asyncHandler } from '../utils/asyncHandler';

const ACTIVE_STATUSES = [
  'EM_DIAGNOSTICO',
  'AGUARDANDO_APROVACAO',
  'EM_MANUTENCAO',
  'EM_FUNILARIA',
  'EM_PINTURA',
  'EM_TESTE',
  'PRONTO',
] as const;

export const getDashboardSummary = asyncHandler(async (_req: Request, res: Response) => {
  const [inService, inMaintenance, inBodywork, readyForDelivery, upcomingDeliveries] =
    await Promise.all([
      prisma.workOrder.count({ where: { status: { in: [...ACTIVE_STATUSES] } } }),
      prisma.workOrder.count({ where: { status: 'EM_MANUTENCAO' } }),
      prisma.workOrder.count({ where: { status: { in: ['EM_FUNILARIA', 'EM_PINTURA'] } } }),
      prisma.workOrder.count({ where: { status: 'PRONTO' } }),
      prisma.workOrder.findMany({
        where: {
          status: { in: [...ACTIVE_STATUSES] },
          estimatedDelivery: { not: null },
        },
        orderBy: { estimatedDelivery: 'asc' },
        take: 5,
        include: {
          vehicle: { select: { plate: true, brand: true, model: true } },
        },
      }),
    ]);

  return res.json({
    cards: { inService, inMaintenance, inBodywork, readyForDelivery },
    upcomingDeliveries: upcomingDeliveries.map((wo) => ({
      id: wo.id,
      number: wo.number,
      vehicle: `${wo.vehicle.brand} ${wo.vehicle.model}`,
      plate: wo.vehicle.plate,
      estimatedDelivery: wo.estimatedDelivery,
    })),
  });
});

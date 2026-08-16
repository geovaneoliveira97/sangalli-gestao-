import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { asyncHandler } from '../utils/asyncHandler';

function parseDateRange(req: Request) {
  const startDate = req.query.startDate ? new Date(String(req.query.startDate)) : undefined;
  const endDate = req.query.endDate ? new Date(String(req.query.endDate)) : undefined;
  if (endDate) endDate.setHours(23, 59, 59, 999);
  return { startDate, endDate };
}

export const getReports = asyncHandler(async (req: Request, res: Response) => {
  const { startDate, endDate } = parseDateRange(req);
  const status = typeof req.query.status === 'string' ? req.query.status : undefined;

  const workOrders = await prisma.workOrder.findMany({
    where: {
      createdAt: startDate || endDate ? { gte: startDate, lte: endDate } : undefined,
      status: status ? (status as any) : undefined,
    },
    include: {
      services: true,
      parts: true,
      payments: true,
      client: { select: { id: true, createdAt: true } },
      vehicle: { select: { id: true } },
    },
  });

  const payments = workOrders.flatMap((wo) => wo.payments);
  const revenue = payments.reduce((sum, p) => sum + Number(p.amount), 0);

  const completed = workOrders.filter((wo) => wo.status === 'ENTREGUE' && wo.completedAt);
  const averageServiceTimeDays =
    completed.length > 0
      ? completed.reduce((sum, wo) => {
          const diff = (wo.completedAt!.getTime() - wo.entryDate.getTime()) / (1000 * 60 * 60 * 24);
          return sum + diff;
        }, 0) / completed.length
      : 0;

  const totalsPerOrder = workOrders.map((wo) => {
    const servicesTotal = wo.services.reduce((s, x) => s + Number(x.price), 0);
    const partsTotal = wo.parts.reduce((s, x) => s + Number(x.unitPrice) * x.quantity, 0);
    return servicesTotal + partsTotal + Number(wo.laborCost);
  });
  const averageTicket =
    totalsPerOrder.length > 0
      ? totalsPerOrder.reduce((s, v) => s + v, 0) / totalsPerOrder.length
      : 0;

  const vehiclesServed = new Set(workOrders.map((wo) => wo.vehicle.id)).size;

  const newClients = await prisma.client.count({
    where: {
      createdAt: startDate || endDate ? { gte: startDate, lte: endDate } : undefined,
    },
  });

  // Faturamento por mês (últimos 6 meses considerando pagamentos)
  const allPayments = await prisma.payment.findMany({
    select: { amount: true, paidAt: true },
    orderBy: { paidAt: 'asc' },
  });
  const revenueByMonth = buildMonthlySeries(allPayments, (p) => p.paidAt, (p) => Number(p.amount));

  // Serviços mais realizados
  const serviceGroups = await prisma.workOrderService.groupBy({
    by: ['serviceId'],
    _count: { serviceId: true },
    orderBy: { _count: { serviceId: 'desc' } },
    take: 6,
  });
  const services = await prisma.service.findMany({
    where: { id: { in: serviceGroups.map((g) => g.serviceId) } },
  });
  const topServices = serviceGroups.map((g) => ({
    name: services.find((s) => s.id === g.serviceId)?.name ?? 'Serviço',
    count: g._count.serviceId,
  }));

  // OS por status
  const statusGroups = await prisma.workOrder.groupBy({
    by: ['status'],
    _count: { status: true },
  });
  const ordersByStatus = statusGroups.map((g) => ({ status: g.status, count: g._count.status }));

  return res.json({
    indicators: {
      revenue: round2(revenue),
      completedWorkOrders: completed.length,
      averageTicket: round2(averageTicket),
      averageServiceTimeDays: round2(averageServiceTimeDays),
      vehiclesServed,
      newClients,
    },
    charts: {
      revenueByMonth,
      topServices,
      ordersByStatus,
    },
  });
});

function round2(value: number) {
  return Math.round(value * 100) / 100;
}

function buildMonthlySeries<T>(
  items: T[],
  getDate: (item: T) => Date,
  getValue: (item: T) => number,
) {
  const now = new Date();
  const months: { key: string; label: string; total: number }[] = [];

  for (let i = 5; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
    months.push({ key, label, total: 0 });
  }

  for (const item of items) {
    const date = getDate(item);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const month = months.find((m) => m.key === key);
    if (month) month.total = round2(month.total + getValue(item));
  }

  return months.map(({ label, total }) => ({ month: label, total }));
}

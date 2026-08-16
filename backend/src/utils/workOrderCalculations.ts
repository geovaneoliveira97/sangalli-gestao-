import { Decimal } from '@prisma/client/runtime/library';

interface CalculableWorkOrder {
  laborCost: Decimal | number;
  services: { price: Decimal | number }[];
  parts: { quantity: number; unitPrice: Decimal | number }[];
  payments: { amount: Decimal | number }[];
}

export function calculateWorkOrderTotals(workOrder: CalculableWorkOrder) {
  const servicesTotal = workOrder.services.reduce((sum, s) => sum + Number(s.price), 0);
  const partsTotal = workOrder.parts.reduce(
    (sum, p) => sum + Number(p.unitPrice) * p.quantity,
    0,
  );
  const laborCost = Number(workOrder.laborCost);
  const total = servicesTotal + partsTotal + laborCost;
  const paid = workOrder.payments.reduce((sum, p) => sum + Number(p.amount), 0);
  const remaining = Math.max(total - paid, 0);

  return {
    servicesTotal: round2(servicesTotal),
    partsTotal: round2(partsTotal),
    laborCost: round2(laborCost),
    total: round2(total),
    paid: round2(paid),
    remaining: round2(remaining),
  };
}

function round2(value: number) {
  return Math.round(value * 100) / 100;
}

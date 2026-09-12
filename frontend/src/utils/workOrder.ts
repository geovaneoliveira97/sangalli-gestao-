import { OPEN_WORK_ORDER_STATUSES } from './statusLabels';
import type { WorkOrder } from '../types';

/**
 * Uma OS está atrasada quando ainda está aberta (não entregue/cancelada) e a
 * previsão de entrega já passou. Calculado no cliente a partir dos dados que
 * a API já retorna — não depende de nenhum campo novo no backend.
 */
export function isWorkOrderOverdue(workOrder: Pick<WorkOrder, 'status' | 'estimatedDelivery'>): boolean {
  if (!workOrder.estimatedDelivery) return false;
  if (!OPEN_WORK_ORDER_STATUSES.includes(workOrder.status)) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const estimated = new Date(workOrder.estimatedDelivery);
  if (Number.isNaN(estimated.getTime())) return false;
  estimated.setHours(0, 0, 0, 0);

  return estimated.getTime() < today.getTime();
}

/** Quantos dias uma OS já está atrasada (0 se não estiver atrasada). */
export function getOverdueDays(workOrder: Pick<WorkOrder, 'status' | 'estimatedDelivery'>): number {
  if (!isWorkOrderOverdue(workOrder) || !workOrder.estimatedDelivery) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const estimated = new Date(workOrder.estimatedDelivery);
  estimated.setHours(0, 0, 0, 0);

  return Math.round((today.getTime() - estimated.getTime()) / (1000 * 60 * 60 * 24));
}

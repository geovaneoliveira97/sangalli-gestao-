import { Trash2 } from 'lucide-react';
import { formatCurrency } from '../../utils/format';
import { PAYMENT_METHOD_LABELS } from '../../utils/statusLabels';
import type { WorkOrder } from '../../types';

interface BudgetCardProps {
  workOrder: WorkOrder;
  canManage: boolean;
  onRemoveService: (itemId: string) => void;
  onRemovePart: (itemId: string) => void;
}

export function BudgetCard({ workOrder, canManage, onRemoveService, onRemovePart }: BudgetCardProps) {
  const { totals } = workOrder;

  return (
    <div>
      {workOrder.services.length === 0 && workOrder.parts.length === 0 && Number(workOrder.laborCost) === 0 ? (
        <p className="text-sm text-slate-500">Nenhum item adicionado ainda.</p>
      ) : (
        <ul className="mb-4 divide-y divide-slate-100 text-sm">
          {workOrder.services.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-2 py-2">
              <span className="text-slate-700">{item.service.name}</span>
              <span className="flex items-center gap-2">
                <span className="tabular font-medium text-slate-800">{formatCurrency(item.price)}</span>
                {canManage && (
                  <button
                    type="button"
                    onClick={() => onRemoveService(item.id)}
                    aria-label={`Remover serviço ${item.service.name}`}
                    className="rounded p-1 text-slate-400 hover:bg-status-danger-soft hover:text-status-danger"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </span>
            </li>
          ))}
          {workOrder.parts.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-2 py-2">
              <span className="text-slate-700">
                {item.part.name} <span className="text-xs text-slate-400">x{item.quantity}</span>
              </span>
              <span className="flex items-center gap-2">
                <span className="tabular font-medium text-slate-800">
                  {formatCurrency(Number(item.unitPrice) * item.quantity)}
                </span>
                {canManage && (
                  <button
                    type="button"
                    onClick={() => onRemovePart(item.id)}
                    aria-label={`Remover peça ${item.part.name}`}
                    className="rounded p-1 text-slate-400 hover:bg-status-danger-soft hover:text-status-danger"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </span>
            </li>
          ))}
          {Number(workOrder.laborCost) > 0 && (
            <li className="flex items-center justify-between gap-2 py-2">
              <span className="text-slate-700">Mão de obra</span>
              <span className="tabular font-medium text-slate-800">{formatCurrency(workOrder.laborCost)}</span>
            </li>
          )}
        </ul>
      )}

      <div className="space-y-1.5 border-t border-slate-200 pt-4 text-sm">
        <div className="flex justify-between text-base font-bold text-slate-900">
          <span>Total</span>
          <span className="tabular">{formatCurrency(totals.total)}</span>
        </div>
        <div className="flex justify-between text-status-success">
          <span>Pago</span>
          <span className="tabular">{formatCurrency(totals.paid)}</span>
        </div>
        <div className="flex justify-between font-medium text-status-warning">
          <span>Restante</span>
          <span className="tabular">{formatCurrency(totals.remaining)}</span>
        </div>
      </div>

      {workOrder.payments.length > 0 && (
        <div className="mt-4 border-t border-slate-200 pt-4">
          <p className="eyebrow mb-2">Pagamentos</p>
          <ul className="space-y-1.5 text-sm">
            {workOrder.payments.map((payment) => (
              <li key={payment.id} className="flex justify-between text-slate-600">
                <span>{PAYMENT_METHOD_LABELS[payment.method]}</span>
                <span className="tabular">{formatCurrency(payment.amount)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

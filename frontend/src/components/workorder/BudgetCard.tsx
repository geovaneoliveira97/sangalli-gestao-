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
        <p className="text-body-medium text-on-surface-variant">Nenhum item adicionado ainda.</p>
      ) : (
        <ul className="mb-4 divide-y divide-outline-variant text-body-medium">
          {workOrder.services.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-2 py-2">
              <span className="text-on-surface">{item.service.name}</span>
              <span className="flex items-center gap-2">
                <span className="tabular font-medium text-on-surface">{formatCurrency(item.price)}</span>
                {canManage && (
                  <button
                    type="button"
                    onClick={() => onRemoveService(item.id)}
                    aria-label={`Remover serviço ${item.service.name}`}
                    className="icon-button hover:bg-error-container hover:text-error"
                  >
                    <Trash2 size={20} aria-hidden="true" />
                  </button>
                )}
              </span>
            </li>
          ))}
          {workOrder.parts.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-2 py-2">
              <span className="text-on-surface">
                {item.part.name} <span className="text-body-small text-on-surface-variant">x{item.quantity}</span>
              </span>
              <span className="flex items-center gap-2">
                <span className="tabular font-medium text-on-surface">
                  {formatCurrency(Number(item.unitPrice) * item.quantity)}
                </span>
                {canManage && (
                  <button
                    type="button"
                    onClick={() => onRemovePart(item.id)}
                    aria-label={`Remover peça ${item.part.name}`}
                    className="icon-button hover:bg-error-container hover:text-error"
                  >
                    <Trash2 size={20} aria-hidden="true" />
                  </button>
                )}
              </span>
            </li>
          ))}
          {Number(workOrder.laborCost) > 0 && (
            <li className="flex items-center justify-between gap-2 py-2">
              <span className="text-on-surface">Mão de obra</span>
              <span className="tabular font-medium text-on-surface">{formatCurrency(workOrder.laborCost)}</span>
            </li>
          )}
        </ul>
      )}

      <div className="space-y-2 border-t border-outline-variant pt-4 text-body-medium">
        <div className="flex justify-between text-body-large font-medium text-on-surface">
          <span>Total</span>
          <span className="tabular">{formatCurrency(totals.total)}</span>
        </div>
        <div className="flex justify-between text-success">
          <span>Pago</span>
          <span className="tabular">{formatCurrency(totals.paid)}</span>
        </div>
        <div className="flex justify-between font-medium text-warning">
          <span>Restante</span>
          <span className="tabular">{formatCurrency(totals.remaining)}</span>
        </div>
      </div>

      {workOrder.payments.length > 0 && (
        <div className="mt-4 border-t border-outline-variant pt-4">
          <p className="eyebrow mb-2">Pagamentos</p>
          <ul className="space-y-2 text-body-medium">
            {workOrder.payments.map((payment) => (
              <li key={payment.id} className="flex justify-between text-on-surface-variant">
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

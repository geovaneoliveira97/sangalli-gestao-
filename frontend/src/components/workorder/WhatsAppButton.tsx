import { MessageCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { STATUS_LABELS } from '../../utils/statusLabels';
import { formatDate } from '../../utils/format';
import type { WorkOrder } from '../../types';

interface WhatsAppButtonProps {
  workOrder: WorkOrder;
  clientName: string;
  clientPhone?: string | null;
}

export function WhatsAppButton({ workOrder, clientName, clientPhone }: WhatsAppButtonProps) {
  function handleClick() {
    const firstName = clientName.split(' ')[0];
    const vehicleLabel =
      'brand' in workOrder.vehicle ? `${workOrder.vehicle.brand} ${workOrder.vehicle.model}` : '';
    const trackingUrl = `${window.location.origin}/acompanhar/${workOrder.publicToken}`;

    const lines = [
      `Olá ${firstName}!`,
      '',
      `Temos uma atualização sobre o seu veículo ${vehicleLabel}.`,
      '',
      'Status atual:',
      STATUS_LABELS[workOrder.status] + '.',
    ];

    if (workOrder.estimatedDelivery) {
      lines.push('', 'Previsão de entrega:', `${formatDate(workOrder.estimatedDelivery)}.`);
    }

    lines.push('', 'Acompanhe sua OS:', trackingUrl);

    const message = encodeURIComponent(lines.join('\n'));
    const digits = clientPhone?.replace(/\D/g, '');
    const phonePrefix = digits ? `55${digits}` : '';
    const url = `https://wa.me/${phonePrefix}?text=${message}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  return (
    <Button variant="secondary" onClick={handleClick} className="border-emerald-300 text-emerald-700 hover:bg-emerald-50">
      <MessageCircle size={18} /> Enviar atualização pelo WhatsApp
    </Button>
  );
}

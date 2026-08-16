import { useEffect, useState } from 'react';
import { Modal } from '../ui/Modal';
import { Select } from '../ui/Select';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { listServices } from '../../services/catalogService';
import { formatCurrency } from '../../utils/format';
import type { Service } from '../../types';

interface AddServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (serviceId: string, price?: number) => Promise<void>;
}

export function AddServiceModal({ isOpen, onClose, onAdd }: AddServiceModalProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [serviceId, setServiceId] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      listServices(true).then(setServices).catch(() => setServices([]));
      setServiceId('');
      setPrice('');
    }
  }, [isOpen]);

  const selected = services.find((s) => s.id === serviceId);

  async function handleSubmit() {
    if (!serviceId) return;
    setIsSubmitting(true);
    try {
      await onAdd(serviceId, price === '' ? undefined : Number(price));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal title="Adicionar serviço" isOpen={isOpen} onClose={onClose} size="sm">
      <div className="space-y-4">
        <Select label="Serviço" required value={serviceId} onChange={(e) => setServiceId(e.target.value)}>
          <option value="">Selecione um serviço</option>
          {services.map((service) => (
            <option key={service.id} value={service.id}>
              {service.name} — {formatCurrency(service.defaultPrice)}
            </option>
          ))}
        </Select>
        <Input
          label="Valor (opcional, sobrescreve o padrão)"
          type="number"
          min={0}
          step="0.01"
          placeholder={selected ? String(selected.defaultPrice) : ''}
          value={price}
          onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
        />
        <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleSubmit} isLoading={isSubmitting} disabled={!serviceId}>
            Adicionar
          </Button>
        </div>
      </div>
    </Modal>
  );
}

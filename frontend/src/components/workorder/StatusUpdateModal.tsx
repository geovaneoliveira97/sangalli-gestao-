import { useEffect, useState } from 'react';
import { Modal } from '../ui/Modal';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';
import { STATUS_ICONS, STATUS_LABELS, WORK_ORDER_STATUS_FLOW } from '../../utils/statusLabels';
import type { WorkOrderStatus } from '../../types';

interface StatusUpdateModalProps {
  isOpen: boolean;
  currentStatus: WorkOrderStatus;
  onClose: () => void;
  onUpdate: (status: WorkOrderStatus, note?: string) => Promise<void>;
}

export function StatusUpdateModal({ isOpen, currentStatus, onClose, onUpdate }: StatusUpdateModalProps) {
  const [status, setStatus] = useState<WorkOrderStatus>(currentStatus);
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setStatus(currentStatus);
      setNote('');
    }
  }, [isOpen, currentStatus]);

  async function handleSubmit() {
    setIsSubmitting(true);
    try {
      await onUpdate(status, note || undefined);
    } finally {
      setIsSubmitting(false);
    }
  }

  const options: WorkOrderStatus[] = [...WORK_ORDER_STATUS_FLOW, 'CANCELADO'];

  return (
    <Modal title="Atualizar status" isOpen={isOpen} onClose={onClose} size="sm">
      <div className="space-y-4">
        <Select
          label="Novo status"
          value={status}
          onChange={(e) => setStatus(e.target.value as WorkOrderStatus)}
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {STATUS_ICONS[option]} {STATUS_LABELS[option]}
            </option>
          ))}
        </Select>
        <Textarea
          label="Observação (opcional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Ex.: Peça aguardando chegada do fornecedor."
        />
        <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleSubmit} isLoading={isSubmitting}>
            Atualizar
          </Button>
        </div>
      </div>
    </Modal>
  );
}

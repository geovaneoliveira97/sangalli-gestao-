import { useEffect, useState } from 'react';
import { Modal } from '../ui/Modal';
import { Select } from '../ui/Select';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { PAYMENT_METHOD_LABELS } from '../../utils/statusLabels';
import { formatCurrency } from '../../utils/format';
import type { PaymentMethod } from '../../types';

interface AddPaymentModalProps {
  isOpen: boolean;
  remaining: number;
  onClose: () => void;
  onAdd: (amount: number, method: PaymentMethod, notes?: string) => Promise<void>;
}

export function AddPaymentModal({ isOpen, remaining, onClose, onAdd }: AddPaymentModalProps) {
  const [amount, setAmount] = useState<number>(remaining);
  const [method, setMethod] = useState<PaymentMethod>('PIX');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setAmount(remaining);
      setNotes('');
      setError('');
    }
  }, [isOpen, remaining]);

  async function handleSubmit() {
    if (amount <= 0) {
      setError('Informe um valor maior que zero.');
      return;
    }
    if (amount > remaining + 0.01) {
      setError('O valor não pode ser maior que o saldo restante.');
      return;
    }
    setIsSubmitting(true);
    try {
      await onAdd(amount, method, notes || undefined);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal title="Registrar pagamento" isOpen={isOpen} onClose={onClose} size="sm">
      <div className="space-y-4">
        <p className="text-sm text-slate-500">
          Saldo restante: <span className="font-semibold text-slate-800">{formatCurrency(remaining)}</span>
        </p>
        <Input
          label="Valor (R$)"
          type="number"
          min={0.01}
          step="0.01"
          required
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          error={error}
        />
        <Select label="Forma de pagamento" value={method} onChange={(e) => setMethod(e.target.value as PaymentMethod)}>
          {Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
        <Input label="Observação (opcional)" value={notes} onChange={(e) => setNotes(e.target.value)} />
        <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleSubmit} isLoading={isSubmitting}>
            Registrar
          </Button>
        </div>
      </div>
    </Modal>
  );
}

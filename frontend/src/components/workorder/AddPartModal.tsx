import { useEffect, useState } from 'react';
import { Modal } from '../ui/Modal';
import { Select } from '../ui/Select';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { listParts } from '../../services/catalogService';
import { formatCurrency } from '../../utils/format';
import type { Part } from '../../types';

interface AddPartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (partId: string, quantity: number, unitPrice?: number) => Promise<void>;
}

export function AddPartModal({ isOpen, onClose, onAdd }: AddPartModalProps) {
  const [parts, setParts] = useState<Part[]>([]);
  const [partId, setPartId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState<number | ''>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      listParts({ onlyActive: true }).then(setParts).catch(() => setParts([]));
      setPartId('');
      setQuantity(1);
      setUnitPrice('');
    }
  }, [isOpen]);

  const selected = parts.find((p) => p.id === partId);

  async function handleSubmit() {
    if (!partId || quantity < 1) return;
    setIsSubmitting(true);
    try {
      await onAdd(partId, quantity, unitPrice === '' ? undefined : Number(unitPrice));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal title="Adicionar peça" isOpen={isOpen} onClose={onClose} size="sm">
      <div className="space-y-4">
        <Select label="Peça" required value={partId} onChange={(e) => setPartId(e.target.value)}>
          <option value="">Selecione uma peça</option>
          {parts.map((part) => (
            <option key={part.id} value={part.id}>
              {part.name} — {formatCurrency(part.price)} ({part.stock} em estoque)
            </option>
          ))}
        </Select>
        <Input
          label="Quantidade"
          type="number"
          min={1}
          required
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
        />
        <Input
          label="Valor unitário (opcional, sobrescreve o padrão)"
          type="number"
          min={0}
          step="0.01"
          placeholder={selected ? String(selected.price) : ''}
          value={unitPrice}
          onChange={(e) => setUnitPrice(e.target.value === '' ? '' : Number(e.target.value))}
        />
        <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleSubmit} isLoading={isSubmitting} disabled={!partId}>
            Adicionar
          </Button>
        </div>
      </div>
    </Modal>
  );
}

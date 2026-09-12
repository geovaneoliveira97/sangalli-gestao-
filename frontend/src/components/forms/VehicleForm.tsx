import { useEffect, useState, type FormEvent } from 'react';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';
import { formatPlate } from '../../utils/format';
import { listClients } from '../../services/clientService';
import type { Client } from '../../types';
import type { VehicleInput } from '../../services/vehicleService';

interface VehicleFormProps {
  initialValues?: Partial<VehicleInput>;
  fixedClientId?: string;
  onSubmit: (values: VehicleInput) => Promise<void>;
  onCancel: () => void;
}

const EMPTY: VehicleInput = {
  clientId: '',
  plate: '',
  brand: '',
  model: '',
  year: new Date().getFullYear(),
  color: '',
  mileage: 0,
  notes: '',
};

export function VehicleForm({ initialValues, fixedClientId, onSubmit, onCancel }: VehicleFormProps) {
  const [values, setValues] = useState<VehicleInput>({
    ...EMPTY,
    ...initialValues,
    clientId: fixedClientId ?? initialValues?.clientId ?? '',
  });
  const [clients, setClients] = useState<Client[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!fixedClientId) {
      listClients().then(setClients).catch(() => setClients([]));
    }
  }, [fixedClientId]);

  function update<K extends keyof VehicleInput>(key: K, value: VehicleInput[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function validate(): boolean {
    const nextErrors: Record<string, string> = {};
    if (!values.clientId) nextErrors.clientId = 'Selecione o cliente.';
    if (values.plate.replace(/\s/g, '').length < 7) nextErrors.plate = 'Placa inválida.';
    if (!values.brand.trim()) nextErrors.brand = 'Informe a marca.';
    if (!values.model.trim()) nextErrors.model = 'Informe o modelo.';
    if (!values.color.trim()) nextErrors.color = 'Informe a cor.';
    if (!values.year || values.year < 1950) nextErrors.year = 'Ano inválido.';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {!fixedClientId && (
        <Select
          label="Cliente"
          required
          value={values.clientId}
          onChange={(e) => update('clientId', e.target.value)}
          error={errors.clientId}
        >
          <option value="">Selecione um cliente</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name}
            </option>
          ))}
        </Select>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Placa"
          required
          value={values.plate}
          onChange={(e) => update('plate', formatPlate(e.target.value))}
          error={errors.plate}
          maxLength={8}
          className="font-mono uppercase"
        />
        <Input
          label="Ano"
          type="number"
          required
          value={values.year}
          onChange={(e) => update('year', Number(e.target.value))}
          error={errors.year}
        />
        <Input
          label="Marca"
          required
          value={values.brand}
          onChange={(e) => update('brand', e.target.value)}
          error={errors.brand}
        />
        <Input
          label="Modelo"
          required
          value={values.model}
          onChange={(e) => update('model', e.target.value)}
          error={errors.model}
        />
        <Input
          label="Cor"
          required
          value={values.color}
          onChange={(e) => update('color', e.target.value)}
          error={errors.color}
        />
        <Input
          label="Quilometragem"
          type="number"
          min={0}
          value={values.mileage}
          onChange={(e) => update('mileage', Number(e.target.value))}
        />
      </div>

      <Textarea
        label="Observações"
        value={values.notes ?? ''}
        onChange={(e) => update('notes', e.target.value)}
      />

      <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          Salvar veículo
        </Button>
      </div>
    </form>
  );
}

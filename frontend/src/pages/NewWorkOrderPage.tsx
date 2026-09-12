import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Select } from '../components/ui/Select';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Button } from '../components/ui/Button';
import { listClients } from '../services/clientService';
import { listVehicles } from '../services/vehicleService';
import { createWorkOrder } from '../services/workOrderService';
import { getApiErrorMessage } from '../services/api';
import { useToast } from '../hooks/useToast';
import type { Client, Vehicle } from '../types';

export function NewWorkOrderPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [searchParams] = useSearchParams();
  const preselectedVehicleId = searchParams.get('veiculoId') ?? '';

  const [clients, setClients] = useState<Client[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [clientId, setClientId] = useState('');
  const [vehicleId, setVehicleId] = useState(preselectedVehicleId);
  const [problemDescription, setProblemDescription] = useState('');
  const [estimatedDelivery, setEstimatedDelivery] = useState('');
  const [laborCost, setLaborCost] = useState<number>(0);
  const [publicNotes, setPublicNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    listClients().then(setClients).catch(() => setClients([]));
  }, []);

  useEffect(() => {
    if (preselectedVehicleId) {
      listVehicles().then((all) => {
        const vehicle = all.find((v) => v.id === preselectedVehicleId);
        if (vehicle) {
          setClientId(vehicle.clientId);
        }
      });
    }
  }, [preselectedVehicleId]);

  useEffect(() => {
    if (!clientId) {
      setVehicles([]);
      return;
    }
    listVehicles({ clientId }).then(setVehicles).catch(() => setVehicles([]));
  }, [clientId]);

  function validate(): boolean {
    const nextErrors: Record<string, string> = {};
    if (!clientId) nextErrors.clientId = 'Selecione o cliente.';
    if (!vehicleId) nextErrors.vehicleId = 'Selecione o veículo.';
    if (!problemDescription.trim()) nextErrors.problemDescription = 'Descreva o problema relatado.';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const workOrder = await createWorkOrder({
        clientId,
        vehicleId,
        problemDescription,
        estimatedDelivery: estimatedDelivery || undefined,
        laborCost: laborCost || 0,
        publicNotes: publicNotes || undefined,
      });
      showToast('Ordem de serviço criada com sucesso.', 'success');
      navigate(`/ordens/${workOrder.id}`);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Não foi possível criar a ordem de serviço.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <button
        type="button"
        onClick={() => navigate('/ordens')}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-brand-700"
      >
        <ArrowLeft size={16} /> Voltar para ordens de serviço
      </button>

      <PageHeader eyebrow="Operação" title="Nova Ordem de Serviço" description="Registre a entrada de um veículo na oficina." />

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <Select
            label="Cliente"
            required
            value={clientId}
            onChange={(e) => {
              setClientId(e.target.value);
              setVehicleId('');
            }}
            error={errors.clientId}
          >
            <option value="">Selecione um cliente</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </Select>

          <Select
            label="Veículo"
            required
            value={vehicleId}
            onChange={(e) => setVehicleId(e.target.value)}
            error={errors.vehicleId}
            disabled={!clientId}
          >
            <option value="">{clientId ? 'Selecione um veículo' : 'Selecione um cliente primeiro'}</option>
            {vehicles.map((vehicle) => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicle.brand} {vehicle.model} — {vehicle.plate}
              </option>
            ))}
          </Select>

          <Textarea
            label="Descrição do problema relatado"
            required
            value={problemDescription}
            onChange={(e) => setProblemDescription(e.target.value)}
            error={errors.problemDescription}
            placeholder="Ex.: Ruído estranho ao frear."
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Previsão de entrega"
              type="date"
              value={estimatedDelivery}
              onChange={(e) => setEstimatedDelivery(e.target.value)}
            />
            <Input
              label="Mão de obra (R$)"
              type="number"
              min={0}
              step="0.01"
              value={laborCost}
              onChange={(e) => setLaborCost(Number(e.target.value))}
            />
          </div>

          <Textarea
            label="Observações públicas (visíveis ao cliente)"
            value={publicNotes}
            onChange={(e) => setPublicNotes(e.target.value)}
          />

          {error && (
            <div role="alert" className="flex items-center gap-2 rounded border border-status-danger/30 bg-status-danger-soft px-4 py-3 text-sm text-status-danger">
              <AlertCircle size={18} aria-hidden="true" />
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
            <Button type="button" variant="secondary" onClick={() => navigate('/ordens')}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Criar ordem de serviço
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ClipboardList, Gauge, Palette, Plus, AlertCircle } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { SectionCard } from '../components/ui/SectionCard';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { Skeleton } from '../components/ui/Skeleton';
import { StatusBadge } from '../components/StatusBadge';
import { getVehicle } from '../services/vehicleService';
import { getApiErrorMessage } from '../services/api';
import { formatDate } from '../utils/format';
import type { Vehicle } from '../types';

export function VehicleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    getVehicle(id)
      .then(setVehicle)
      .catch((err) => setError(getApiErrorMessage(err, 'Não foi possível carregar o veículo.')))
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40" />
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div role="alert" className="flex items-center gap-2 rounded border border-status-danger/30 bg-status-danger-soft px-4 py-3 text-sm text-status-danger">
        <AlertCircle size={18} aria-hidden="true" />
        {error || 'Veículo não encontrado.'}
      </div>
    );
  }

  const client = vehicle.client as { id: string; name: string } | undefined;

  return (
    <div>
      <button
        type="button"
        onClick={() => navigate('/veiculos')}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-brand-700"
      >
        <ArrowLeft size={16} /> Voltar para veículos
      </button>

      <PageHeader
        eyebrow="Veículo"
        title={`${vehicle.brand} ${vehicle.model}`}
        description={
          client ? (
            <>
              <span className="tabular font-mono">{vehicle.plate}</span> · {vehicle.year} · Proprietário:{' '}
              <Link to={`/clientes/${client.id}`} className="font-medium text-brand-700 hover:underline">
                {client.name}
              </Link>
            </>
          ) : (
            <>
              <span className="tabular font-mono">{vehicle.plate}</span> · {vehicle.year}
            </>
          )
        }
        action={
          <Button onClick={() => navigate(`/ordens/nova?veiculoId=${vehicle.id}`)}>
            <Plus size={16} /> Nova ordem de serviço
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <SectionCard eyebrow="Ficha técnica" title="Dados do veículo" className="lg:col-span-1">
          <ul className="space-y-3 text-sm text-slate-700">
            <li className="flex items-center gap-2">
              <Palette size={16} className="text-slate-400" aria-hidden="true" />
              Cor: {vehicle.color}
            </li>
            <li className="flex items-center gap-2">
              <Gauge size={16} className="text-slate-400" aria-hidden="true" />
              Quilometragem: <span className="tabular">{vehicle.mileage.toLocaleString('pt-BR')} km</span>
            </li>
          </ul>
          {vehicle.notes && (
            <div className="mt-4 rounded border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
              <p className="eyebrow mb-1">Observações</p>
              {vehicle.notes}
            </div>
          )}
        </SectionCard>

        <SectionCard eyebrow="Ordens de serviço" title="Histórico de ordens de serviço" className="lg:col-span-2" bodyClassName="p-0">
          {!vehicle.workOrders || vehicle.workOrders.length === 0 ? (
            <div className="p-5">
              <EmptyState
                icon={ClipboardList}
                title="Nenhuma ordem de serviço para este veículo"
                description="Quando uma OS for aberta para este veículo, ela aparecerá aqui."
              />
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {vehicle.workOrders.map((wo) => (
                <li key={wo.id}>
                  <Link
                    to={`/ordens/${wo.id}`}
                    className="flex flex-col gap-2 px-5 py-3 hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-mono text-xs font-semibold text-slate-700">OS-{String(wo.number).padStart(4, '0')}</p>
                      <p className="tabular text-sm text-slate-500">{formatDate(wo.entryDate)}</p>
                    </div>
                    <StatusBadge status={wo.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>
    </div>
  );
}

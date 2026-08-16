import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ClipboardList, Gauge, Palette, Plus, AlertCircle } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { Skeleton } from '../components/ui/Skeleton';
import { StatusBadge } from '../components/StatusBadge';
import { getVehicle } from '../services/vehicleService';
import { getApiErrorMessage } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { formatDate } from '../utils/format';
import type { Vehicle } from '../types';

export function VehicleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hasRole } = useAuth();

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
      <div role="alert" className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
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
        title={`${vehicle.brand} ${vehicle.model}`}
        description={
          client ? (
            <>
              {vehicle.plate} · {vehicle.year} · Proprietário:{' '}
              <Link to={`/clientes/${client.id}`} className="font-medium text-brand-700 hover:underline">
                {client.name}
              </Link>
            </>
          ) : (
            `${vehicle.plate} · ${vehicle.year}`
          )
        }
        action={
          hasRole('ADMIN', 'ATENDENTE') && (
            <Button onClick={() => navigate(`/ordens/nova?veiculoId=${vehicle.id}`)}>
              <Plus size={18} /> Nova ordem de serviço
            </Button>
          )
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-1">
          <h2 className="mb-4 text-base font-semibold text-slate-900">Dados do veículo</h2>
          <ul className="space-y-3 text-sm text-slate-700">
            <li className="flex items-center gap-2">
              <Palette size={16} className="text-slate-400" aria-hidden="true" />
              Cor: {vehicle.color}
            </li>
            <li className="flex items-center gap-2">
              <Gauge size={16} className="text-slate-400" aria-hidden="true" />
              Quilometragem: {vehicle.mileage.toLocaleString('pt-BR')} km
            </li>
          </ul>
          {vehicle.notes && (
            <div className="mt-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
              <p className="mb-1 font-medium text-slate-700">Observações</p>
              {vehicle.notes}
            </div>
          )}
        </Card>

        <Card className="p-5 lg:col-span-2">
          <h2 className="mb-4 text-base font-semibold text-slate-900">Histórico de ordens de serviço</h2>
          {!vehicle.workOrders || vehicle.workOrders.length === 0 ? (
            <EmptyState icon={ClipboardList} title="Nenhuma ordem de serviço para este veículo" />
          ) : (
            <ul className="divide-y divide-slate-100">
              {vehicle.workOrders.map((wo) => (
                <li key={wo.id}>
                  <Link
                    to={`/ordens/${wo.id}`}
                    className="flex flex-col gap-2 rounded-lg px-2 py-3 hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-medium text-slate-800">OS #{wo.number}</p>
                      <p className="text-sm text-slate-500">{formatDate(wo.entryDate)}</p>
                    </div>
                    <StatusBadge status={wo.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}

import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Car, Mail, MapPin, Phone, Plus, AlertCircle } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { EmptyState } from '../components/ui/EmptyState';
import { Skeleton } from '../components/ui/Skeleton';
import { VehicleForm } from '../components/forms/VehicleForm';
import { getClient } from '../services/clientService';
import { createVehicle, type VehicleInput } from '../services/vehicleService';
import { getApiErrorMessage } from '../services/api';
import { useToast } from '../hooks/useToast';
import { useAuth } from '../hooks/useAuth';
import type { Client } from '../types';

export function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { hasRole } = useAuth();
  const canManage = hasRole('ADMIN', 'ATENDENTE');

  const [client, setClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError('');
    try {
      const data = await getClient(id);
      setClient(data);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Não foi possível carregar os dados do cliente.'));
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleAddVehicle(values: VehicleInput) {
    try {
      await createVehicle(values);
      showToast('Veículo cadastrado com sucesso.', 'success');
      setIsModalOpen(false);
      load();
    } catch (err) {
      showToast(getApiErrorMessage(err, 'Não foi possível cadastrar o veículo.'), 'error');
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40" />
      </div>
    );
  }

  if (error || !client) {
    return (
      <div role="alert" className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
        <AlertCircle size={18} aria-hidden="true" />
        {error || 'Cliente não encontrado.'}
      </div>
    );
  }

  const address = [client.street, client.number, client.district, client.city, client.state]
    .filter(Boolean)
    .join(', ');

  return (
    <div>
      <button
        type="button"
        onClick={() => navigate('/clientes')}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-brand-700"
      >
        <ArrowLeft size={16} /> Voltar para clientes
      </button>

      <PageHeader title={client.name} description={`CPF: ${client.cpf}`} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-1">
          <h2 className="mb-4 text-base font-semibold text-slate-900">Dados de contato</h2>
          <ul className="space-y-3 text-sm text-slate-700">
            <li className="flex items-start gap-2">
              <Phone size={16} className="mt-0.5 shrink-0 text-slate-400" aria-hidden="true" />
              <span>{client.phone}</span>
            </li>
            {client.email && (
              <li className="flex items-start gap-2">
                <Mail size={16} className="mt-0.5 shrink-0 text-slate-400" aria-hidden="true" />
                <span>{client.email}</span>
              </li>
            )}
            {address && (
              <li className="flex items-start gap-2">
                <MapPin size={16} className="mt-0.5 shrink-0 text-slate-400" aria-hidden="true" />
                <span>
                  {address}
                  {client.zipCode ? ` — CEP ${client.zipCode}` : ''}
                </span>
              </li>
            )}
          </ul>
        </Card>

        <Card className="p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">Veículos</h2>
            {canManage && (
              <Button size="sm" onClick={() => setIsModalOpen(true)}>
                <Plus size={16} /> Novo veículo
              </Button>
            )}
          </div>

          {!client.vehicles || client.vehicles.length === 0 ? (
            <EmptyState icon={Car} title="Nenhum veículo cadastrado para este cliente" />
          ) : (
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {client.vehicles.map((vehicle) => (
                <li key={vehicle.id}>
                  <Link
                    to={`/veiculos/${vehicle.id}`}
                    className="flex items-start gap-3 rounded-lg border border-slate-200 p-4 hover:border-brand-300 hover:bg-brand-50/40"
                  >
                    <Car size={20} className="mt-0.5 shrink-0 text-brand-700" aria-hidden="true" />
                    <div>
                      <p className="font-medium text-slate-800">
                        {vehicle.brand} {vehicle.model}
                      </p>
                      <p className="text-sm text-slate-500">
                        {vehicle.plate} · {vehicle.year}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Modal title="Novo veículo" isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} size="lg">
        <VehicleForm fixedClientId={client.id} onSubmit={handleAddVehicle} onCancel={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
}

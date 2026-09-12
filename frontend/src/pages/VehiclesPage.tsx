import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Car as CarIcon, Pencil, Trash2, AlertCircle } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { EmptyState } from '../components/ui/EmptyState';
import { TableSkeleton } from '../components/ui/Skeleton';
import { VehicleForm } from '../components/forms/VehicleForm';
import {
  createVehicle,
  deleteVehicle,
  listVehicles,
  updateVehicle,
  type VehicleInput,
} from '../services/vehicleService';
import { getApiErrorMessage } from '../services/api';
import { useToast } from '../hooks/useToast';
import type { Vehicle } from '../types';

export function VehiclesPage() {
  const { showToast } = useToast();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [deletingVehicle, setDeletingVehicle] = useState<Vehicle | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const load = useCallback(async (searchTerm?: string) => {
    setIsLoading(true);
    setError('');
    try {
      const data = await listVehicles({ search: searchTerm });
      setVehicles(data);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Não foi possível carregar os veículos.'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const timeout = setTimeout(() => load(search || undefined), 350);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  async function handleSubmit(values: VehicleInput) {
    try {
      if (editingVehicle) {
        await updateVehicle(editingVehicle.id, values);
        showToast('Veículo atualizado com sucesso.', 'success');
      } else {
        await createVehicle(values);
        showToast('Veículo cadastrado com sucesso.', 'success');
      }
      setIsModalOpen(false);
      setEditingVehicle(null);
      load(search || undefined);
    } catch (err) {
      showToast(getApiErrorMessage(err, 'Não foi possível salvar o veículo.'), 'error');
    }
  }

  async function handleDelete() {
    if (!deletingVehicle) return;
    setIsDeleting(true);
    try {
      await deleteVehicle(deletingVehicle.id);
      showToast('Veículo removido.', 'success');
      setDeletingVehicle(null);
      load(search || undefined);
    } catch (err) {
      showToast(getApiErrorMessage(err, 'Não foi possível remover o veículo.'), 'error');
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Operação"
        title="Veículos"
        description="Todos os veículos cadastrados na oficina."
        action={
          <Button
            onClick={() => {
              setEditingVehicle(null);
              setIsModalOpen(true);
            }}
          >
            <Plus size={18} /> Novo veículo
          </Button>
        }
      />

      <Card className="mb-4 max-w-sm p-3">
        <label htmlFor="vehicle-search" className="sr-only">
          Buscar veículos
        </label>
        <div className="relative">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            id="vehicle-search"
            type="search"
            placeholder="Buscar por placa, marca ou modelo"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="min-h-[40px] w-full rounded border border-slate-300 py-2 pl-9 pr-3 text-sm focus:border-brand-600"
          />
        </div>
      </Card>

      {error && (
        <div role="alert" className="mb-4 flex items-center gap-2 rounded border border-status-danger/30 bg-status-danger-soft px-4 py-3 text-sm text-status-danger">
          <AlertCircle size={18} aria-hidden="true" />
          {error}
        </div>
      )}

      <Card>
        {isLoading ? (
          <div className="p-5">
            <TableSkeleton rows={6} cols={5} />
          </div>
        ) : vehicles.length === 0 ? (
          <EmptyState
            icon={CarIcon}
            title="Nenhum veículo encontrado"
            description="Ajuste a busca ou cadastre o primeiro veículo de um cliente."
          />
        ) : (
          <div className="table-scroll">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th scope="col" className="px-5 py-3">Placa</th>
                  <th scope="col" className="px-5 py-3">Veículo</th>
                  <th scope="col" className="px-5 py-3">Cliente</th>
                  <th scope="col" className="px-5 py-3">Ano</th>
                  <th scope="col" className="px-5 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {vehicles.map((vehicle) => (
                  <tr key={vehicle.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3 font-mono font-medium text-slate-800">
                      <Link to={`/veiculos/${vehicle.id}`} className="hover:underline">
                        {vehicle.plate}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-slate-600">
                      {vehicle.brand} {vehicle.model}
                    </td>
                    <td className="px-5 py-3 text-slate-600">
                      {'client' in vehicle && vehicle.client ? (vehicle.client as { name: string }).name : '—'}
                    </td>
                    <td className="tabular px-5 py-3 text-slate-600">{vehicle.year}</td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingVehicle(vehicle);
                            setIsModalOpen(true);
                          }}
                          aria-label={`Editar ${vehicle.plate}`}
                          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-brand-700"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingVehicle(vehicle)}
                          aria-label={`Remover ${vehicle.plate}`}
                          className="rounded-lg p-2 text-slate-500 hover:bg-status-danger-soft hover:text-status-danger"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal
        title={editingVehicle ? 'Editar veículo' : 'Novo veículo'}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        size="lg"
      >
        <VehicleForm
          initialValues={editingVehicle ?? undefined}
          onSubmit={handleSubmit}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(deletingVehicle)}
        title="Remover veículo"
        message={`Tem certeza que deseja remover o veículo "${deletingVehicle?.plate}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Remover"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeletingVehicle(null)}
      />
    </div>
  );
}

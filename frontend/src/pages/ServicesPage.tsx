import { useEffect, useState, type FormEvent } from 'react';
import { Plus, Wrench, Pencil, Trash2, AlertCircle } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { EmptyState } from '../components/ui/EmptyState';
import { TableSkeleton } from '../components/ui/Skeleton';
import { Badge } from '../components/ui/Badge';
import {
  createService,
  deleteService,
  listServices,
  updateService,
  type ServiceInput,
} from '../services/catalogService';
import { getApiErrorMessage } from '../services/api';
import { useToast } from '../hooks/useToast';
import { formatCurrency } from '../utils/format';
import type { Service } from '../types';

const EMPTY: ServiceInput = { name: '', description: '', defaultPrice: 0, active: true };

export function ServicesPage() {
  const { showToast } = useToast();
  const canManage = true;

  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [values, setValues] = useState<ServiceInput>(EMPTY);
  const [deleting, setDeleting] = useState<Service | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function load() {
    setIsLoading(true);
    setError('');
    try {
      setServices(await listServices());
    } catch (err) {
      setError(getApiErrorMessage(err, 'Não foi possível carregar os serviços.'));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function openCreate() {
    setEditing(null);
    setValues(EMPTY);
    setIsModalOpen(true);
  }

  function openEdit(service: Service) {
    setEditing(service);
    setValues(service);
    setIsModalOpen(true);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setIsSaving(true);
    try {
      if (editing) {
        await updateService(editing.id, values);
        showToast('Serviço atualizado.', 'success');
      } else {
        await createService(values);
        showToast('Serviço cadastrado.', 'success');
      }
      setIsModalOpen(false);
      load();
    } catch (err) {
      showToast(getApiErrorMessage(err, 'Não foi possível salvar o serviço.'), 'error');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleting) return;
    setIsDeleting(true);
    try {
      const result = await deleteService(deleting.id);
      const noun = result.usageCount === 1 ? 'ordem de serviço' : 'ordens de serviço';
      showToast(
        result.deleted
          ? 'Serviço removido do catálogo.'
          : `Serviço já usado em ${result.usageCount} ${noun}: mantido no histórico e apenas desativado.`,
        'success',
      );
      setDeleting(null);
      load();
    } catch (err) {
      showToast(getApiErrorMessage(err, 'Não foi possível remover o serviço.'), 'error');
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Oficina"
        title="Serviços"
        description="Catálogo de serviços oferecidos pela oficina."
        action={
          canManage && (
            <Button onClick={openCreate}>
              <Plus size={18} /> Novo serviço
            </Button>
          )
        }
      />

      {error && (
        <div role="alert" className="mb-4 flex items-center gap-2 rounded border border-status-danger/30 bg-status-danger-soft px-4 py-3 text-sm text-status-danger">
          <AlertCircle size={18} aria-hidden="true" />
          {error}
        </div>
      )}

      <Card>
        {isLoading ? (
          <div className="p-5">
            <TableSkeleton rows={6} cols={4} />
          </div>
        ) : services.length === 0 ? (
          <EmptyState icon={Wrench} title="Nenhum serviço cadastrado" description="Cadastre os serviços oferecidos para agilizar a montagem de orçamentos." />
        ) : (
          <div className="table-scroll">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th scope="col" className="px-5 py-3">Nome</th>
                  <th scope="col" className="px-5 py-3">Valor padrão</th>
                  <th scope="col" className="px-5 py-3">Status</th>
                  {canManage && <th scope="col" className="px-5 py-3 text-right">Ações</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {services.map((service) => (
                  <tr key={service.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3">
                      <p className="font-medium text-slate-800">{service.name}</p>
                      {service.description && <p className="text-xs text-slate-500">{service.description}</p>}
                    </td>
                    <td className="tabular px-5 py-3 text-slate-600">{formatCurrency(service.defaultPrice)}</td>
                    <td className="px-5 py-3">
                      <Badge
                        className={
                          service.active
                            ? 'border-status-success/30 bg-status-success-soft text-status-success'
                            : 'border-slate-300 bg-slate-100 text-slate-600'
                        }
                      >
                        {service.active ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </td>
                    {canManage && (
                      <td className="px-5 py-3">
                        <div className="flex justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => openEdit(service)}
                            aria-label={`Editar ${service.name}`}
                            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-brand-700"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleting(service)}
                            aria-label={`Remover ${service.name}`}
                            className="rounded-lg p-2 text-slate-500 hover:bg-status-danger-soft hover:text-status-danger"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal title={editing ? 'Editar serviço' : 'Novo serviço'} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <Input
            label="Nome do serviço"
            required
            value={values.name}
            onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
          />
          <Textarea
            label="Descrição"
            value={values.description ?? ''}
            onChange={(e) => setValues((v) => ({ ...v, description: e.target.value }))}
          />
          <Input
            label="Valor padrão (R$)"
            type="number"
            min={0}
            step="0.01"
            required
            value={values.defaultPrice}
            onChange={(e) => setValues((v) => ({ ...v, defaultPrice: Number(e.target.value) }))}
          />
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={values.active}
              onChange={(e) => setValues((v) => ({ ...v, active: e.target.checked }))}
              className="h-4 w-4 rounded border-slate-300"
            />
            Serviço ativo
          </label>
          <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={isSaving}>
              Salvar
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(deleting)}
        title="Remover serviço"
        message={`Remover "${deleting?.name}"? Se ele nunca foi usado em nenhuma ordem de serviço, será excluído definitivamente. Se já foi usado, será apenas desativado para preservar o histórico.`}
        confirmLabel="Remover"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}

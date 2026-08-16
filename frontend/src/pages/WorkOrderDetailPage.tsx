import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, AlertCircle, Plus, Wallet, RefreshCw, Save } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Textarea } from '../components/ui/Textarea';
import { Skeleton } from '../components/ui/Skeleton';
import { StatusBadge } from '../components/StatusBadge';
import { Timeline } from '../components/workorder/Timeline';
import { BudgetCard } from '../components/workorder/BudgetCard';
import { PhotoGallery } from '../components/workorder/PhotoGallery';
import { QrCodeCard } from '../components/workorder/QrCodeCard';
import { WhatsAppButton } from '../components/workorder/WhatsAppButton';
import { AddServiceModal } from '../components/workorder/AddServiceModal';
import { AddPartModal } from '../components/workorder/AddPartModal';
import { AddPaymentModal } from '../components/workorder/AddPaymentModal';
import { StatusUpdateModal } from '../components/workorder/StatusUpdateModal';
import { PhotoUploadModal } from '../components/workorder/PhotoUploadModal';
import {
  addWorkOrderPart,
  addWorkOrderPayment,
  addWorkOrderService,
  deleteWorkOrderPhoto,
  getWorkOrder,
  removeWorkOrderPart,
  removeWorkOrderService,
  updateWorkOrder,
  updateWorkOrderStatus,
  uploadWorkOrderPhoto,
} from '../services/workOrderService';
import { getApiErrorMessage } from '../services/api';
import { useToast } from '../hooks/useToast';
import { useAuth } from '../hooks/useAuth';
import { formatDate } from '../utils/format';
import type { PaymentMethod, PhotoCategory, WorkOrder, WorkOrderStatus } from '../types';

type ModalName = 'service' | 'part' | 'payment' | 'status' | 'photo' | null;

export function WorkOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { hasRole } = useAuth();

  const [workOrder, setWorkOrder] = useState<WorkOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [openModal, setOpenModal] = useState<ModalName>(null);
  const [diagnosis, setDiagnosis] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  const canManage = hasRole('ADMIN', 'ATENDENTE');
  const canUpdateStatus = hasRole('ADMIN', 'ATENDENTE', 'MECANICO');
  const canAddServices = hasRole('ADMIN', 'ATENDENTE', 'MECANICO');
  const canAddPhotos = hasRole('ADMIN', 'ATENDENTE', 'MECANICO');

  const load = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError('');
    try {
      const data = await getWorkOrder(id);
      setWorkOrder(data);
      setDiagnosis(data.diagnosis ?? '');
      setInternalNotes(data.internalNotes ?? '');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Não foi possível carregar a ordem de serviço.'));
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function withToast<T>(action: () => Promise<T>, successMessage: string) {
    try {
      const result = await action();
      showToast(successMessage, 'success');
      await load();
      return result;
    } catch (err) {
      showToast(getApiErrorMessage(err, 'Não foi possível concluir a ação.'), 'error');
      throw err;
    }
  }

  async function handleSaveNotes() {
    if (!workOrder) return;
    setIsSavingNotes(true);
    try {
      await updateWorkOrder(workOrder.id, { diagnosis, internalNotes });
      showToast('Diagnóstico e observações salvos.', 'success');
      load();
    } catch (err) {
      showToast(getApiErrorMessage(err, 'Não foi possível salvar as observações.'), 'error');
    } finally {
      setIsSavingNotes(false);
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (error || !workOrder) {
    return (
      <div role="alert" className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
        <AlertCircle size={18} aria-hidden="true" />
        {error || 'Ordem de serviço não encontrada.'}
      </div>
    );
  }

  const client = workOrder.client as { id: string; name: string; phone?: string };
  const vehicle = workOrder.vehicle as {
    id: string;
    plate: string;
    brand: string;
    model: string;
    year?: number;
    color?: string;
  };

  return (
    <div>
      <button
        type="button"
        onClick={() => navigate('/ordens')}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-brand-700"
      >
        <ArrowLeft size={16} /> Voltar para ordens de serviço
      </button>

      <PageHeader
        title={`Ordem de Serviço #${workOrder.number}`}
        description={
          <span className="flex flex-wrap items-center gap-2">
            <Link to={`/clientes/${client.id}`} className="font-medium text-brand-700 hover:underline">
              {client.name}
            </Link>
            <span aria-hidden="true">·</span>
            <Link to={`/veiculos/${vehicle.id}`} className="hover:underline">
              {vehicle.brand} {vehicle.model} ({vehicle.plate})
            </Link>
          </span>
        }
        action={
          <div className="flex flex-wrap gap-2">
            <StatusBadge status={workOrder.status} />
            {canUpdateStatus && (
              <Button variant="secondary" size="sm" onClick={() => setOpenModal('status')}>
                <RefreshCw size={16} /> Atualizar status
              </Button>
            )}
            <WhatsAppButton workOrder={workOrder} clientName={client.name} clientPhone={client.phone} />
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="p-5">
            <h2 className="mb-3 text-base font-semibold text-slate-900">Problema relatado</h2>
            <p className="mb-4 text-sm text-slate-700">{workOrder.problemDescription}</p>

            <Textarea
              label="Diagnóstico"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              disabled={!canAddServices}
              placeholder="Descreva o diagnóstico técnico realizado."
            />
            <div className="mt-3">
              <Textarea
                label="Observações internas (não visíveis ao cliente)"
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
                disabled={!canAddServices}
              />
            </div>
            {canAddServices && (
              <div className="mt-3 flex justify-end">
                <Button size="sm" onClick={handleSaveNotes} isLoading={isSavingNotes}>
                  <Save size={16} /> Salvar observações
                </Button>
              </div>
            )}

            <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-200 pt-4 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-slate-500">Entrada</dt>
                <dd className="font-medium text-slate-800">{formatDate(workOrder.entryDate)}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Previsão de entrega</dt>
                <dd className="font-medium text-slate-800">{formatDate(workOrder.estimatedDelivery)}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Conclusão</dt>
                <dd className="font-medium text-slate-800">{formatDate(workOrder.completedAt)}</dd>
              </div>
            </dl>
          </Card>

          <Card className="p-5">
            <h2 className="mb-4 text-base font-semibold text-slate-900">Linha do tempo</h2>
            <Timeline status={workOrder.status} history={workOrder.statusHistory} />
          </Card>

          <div>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h2 className="sr-only">Orçamento</h2>
              {canAddServices && (
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary" onClick={() => setOpenModal('service')}>
                    <Plus size={16} /> Serviço
                  </Button>
                  {canManage && (
                    <Button size="sm" variant="secondary" onClick={() => setOpenModal('part')}>
                      <Plus size={16} /> Peça
                    </Button>
                  )}
                  {canManage && (
                    <Button size="sm" onClick={() => setOpenModal('payment')}>
                      <Wallet size={16} /> Registrar pagamento
                    </Button>
                  )}
                </div>
              )}
            </div>
            <BudgetCard
              workOrder={workOrder}
              canManage={canManage}
              onRemoveService={(itemId) =>
                withToast(() => removeWorkOrderService(workOrder.id, itemId), 'Serviço removido.')
              }
              onRemovePart={(itemId) =>
                withToast(() => removeWorkOrderPart(workOrder.id, itemId), 'Peça removida.')
              }
            />
          </div>

          <PhotoGallery
            photos={workOrder.photos}
            canManage={canAddPhotos}
            onUploadClick={() => setOpenModal('photo')}
            onDelete={(photoId) =>
              withToast(() => deleteWorkOrderPhoto(workOrder.id, photoId), 'Foto removida.')
            }
          />
        </div>

        <div className="space-y-6">
          <Card className="p-5">
            <h2 className="mb-3 text-base font-semibold text-slate-900">Veículo</h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500">Placa</dt>
                <dd className="font-medium text-slate-800">{vehicle.plate}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Marca/Modelo</dt>
                <dd className="font-medium text-slate-800">
                  {vehicle.brand} {vehicle.model}
                </dd>
              </div>
              {vehicle.year && (
                <div className="flex justify-between">
                  <dt className="text-slate-500">Ano</dt>
                  <dd className="font-medium text-slate-800">{vehicle.year}</dd>
                </div>
              )}
              {vehicle.color && (
                <div className="flex justify-between">
                  <dt className="text-slate-500">Cor</dt>
                  <dd className="font-medium text-slate-800">{vehicle.color}</dd>
                </div>
              )}
            </dl>
          </Card>

          <QrCodeCard workOrderId={workOrder.id} workOrderNumber={workOrder.number} publicToken={workOrder.publicToken} />
        </div>
      </div>

      <AddServiceModal
        isOpen={openModal === 'service'}
        onClose={() => setOpenModal(null)}
        onAdd={(serviceId, price) =>
          withToast(() => addWorkOrderService(workOrder.id, serviceId, price), 'Serviço adicionado.').then(() =>
            setOpenModal(null),
          )
        }
      />
      <AddPartModal
        isOpen={openModal === 'part'}
        onClose={() => setOpenModal(null)}
        onAdd={(partId, quantity, unitPrice) =>
          withToast(() => addWorkOrderPart(workOrder.id, partId, quantity, unitPrice), 'Peça adicionada.').then(() =>
            setOpenModal(null),
          )
        }
      />
      <AddPaymentModal
        isOpen={openModal === 'payment'}
        remaining={workOrder.totals.remaining}
        onClose={() => setOpenModal(null)}
        onAdd={(amount, method, notes) =>
          withToast(
            () => addWorkOrderPayment(workOrder.id, amount, method as PaymentMethod, notes),
            'Pagamento registrado.',
          ).then(() => setOpenModal(null))
        }
      />
      <StatusUpdateModal
        isOpen={openModal === 'status'}
        currentStatus={workOrder.status}
        onClose={() => setOpenModal(null)}
        onUpdate={(status, note) =>
          withToast(
            () => updateWorkOrderStatus(workOrder.id, status as WorkOrderStatus, note),
            'Status atualizado.',
          ).then(() => setOpenModal(null))
        }
      />
      <PhotoUploadModal
        isOpen={openModal === 'photo'}
        onClose={() => setOpenModal(null)}
        onUpload={(file, category, caption) =>
          withToast(
            () => uploadWorkOrderPhoto(workOrder.id, file, category as PhotoCategory, caption),
            'Foto enviada.',
          ).then(() => setOpenModal(null))
        }
      />
    </div>
  );
}

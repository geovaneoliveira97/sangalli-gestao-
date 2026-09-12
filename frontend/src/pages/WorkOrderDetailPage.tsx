import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, AlertCircle, AlertTriangle, Plus, Trash2, Wallet, RefreshCw, Save } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { SectionCard } from '../components/ui/SectionCard';
import { Button } from '../components/ui/Button';
import { Textarea } from '../components/ui/Textarea';
import { Skeleton } from '../components/ui/Skeleton';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
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
  deleteWorkOrder,
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
import { formatDate } from '../utils/format';
import { getOverdueDays, isWorkOrderOverdue } from '../utils/workOrder';
import type { PaymentMethod, PhotoCategory, WorkOrder, WorkOrderStatus } from '../types';

type ModalName = 'service' | 'part' | 'payment' | 'status' | 'photo' | 'delete' | null;

export function WorkOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [workOrder, setWorkOrder] = useState<WorkOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [openModal, setOpenModal] = useState<ModalName>(null);
  const [diagnosis, setDiagnosis] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const canManage = true;
  const canUpdateStatus = true;
  const canAddServices = true;
  const canAddPhotos = true;

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

  async function handleDeleteWorkOrder() {
    if (!workOrder) return;
    setIsDeleting(true);
    try {
      await deleteWorkOrder(workOrder.id);
      showToast('Ordem de serviço removida.', 'success');
      navigate('/ordens');
    } catch (err) {
      showToast(getApiErrorMessage(err, 'Não foi possível remover a ordem de serviço.'), 'error');
      setIsDeleting(false);
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
      <div role="alert" className="flex items-center gap-2 rounded border border-status-danger/30 bg-status-danger-soft px-4 py-3 text-sm text-status-danger">
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
  const overdue = isWorkOrderOverdue(workOrder);

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
        eyebrow="Ordem de serviço"
        title={<span className="font-mono">OS-{String(workOrder.number).padStart(4, '0')}</span>}
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
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={workOrder.status} />
            {overdue && (
              <span className="flex items-center gap-1.5 rounded border border-status-danger/30 bg-status-danger-soft px-2 py-0.5 text-xs font-semibold text-status-danger">
                <AlertTriangle size={12} aria-hidden="true" /> {getOverdueDays(workOrder)}d de atraso
              </span>
            )}
            {canUpdateStatus && (
              <Button variant="secondary" size="sm" onClick={() => setOpenModal('status')}>
                <RefreshCw size={14} /> Atualizar status
              </Button>
            )}
            <WhatsAppButton workOrder={workOrder} clientName={client.name} clientPhone={client.phone} />
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <SectionCard eyebrow="Identificação do veículo" title={`${vehicle.brand} ${vehicle.model}`}>
            <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
              <div>
                <dt className="text-xs text-slate-500">Placa</dt>
                <dd className="font-mono font-semibold text-slate-800">{vehicle.plate}</dd>
              </div>
              {vehicle.year && (
                <div>
                  <dt className="text-xs text-slate-500">Ano</dt>
                  <dd className="tabular font-medium text-slate-800">{vehicle.year}</dd>
                </div>
              )}
              {vehicle.color && (
                <div>
                  <dt className="text-xs text-slate-500">Cor</dt>
                  <dd className="font-medium text-slate-800">{vehicle.color}</dd>
                </div>
              )}
              <div>
                <dt className="text-xs text-slate-500">Entrada</dt>
                <dd className="tabular font-medium text-slate-800">{formatDate(workOrder.entryDate)}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Previsão de entrega</dt>
                <dd className="tabular font-medium text-slate-800">{formatDate(workOrder.estimatedDelivery)}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Conclusão</dt>
                <dd className="tabular font-medium text-slate-800">{formatDate(workOrder.completedAt)}</dd>
              </div>
            </dl>
          </SectionCard>

          <SectionCard eyebrow="Diagnóstico" title="Problema relatado e diagnóstico técnico">
            <p className="mb-4 rounded border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              {workOrder.problemDescription}
            </p>

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
                  <Save size={14} /> Salvar observações
                </Button>
              </div>
            )}
          </SectionCard>

          <SectionCard eyebrow="Histórico" title="Linha do tempo">
            <Timeline status={workOrder.status} history={workOrder.statusHistory} />
          </SectionCard>

          <SectionCard
            eyebrow="Orçamento"
            title="Serviços, peças e pagamentos"
            action={
              canAddServices && (
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="secondary" onClick={() => setOpenModal('service')}>
                    <Plus size={14} /> Serviço
                  </Button>
                  {canManage && (
                    <Button size="sm" variant="secondary" onClick={() => setOpenModal('part')}>
                      <Plus size={14} /> Peça
                    </Button>
                  )}
                  {canManage && (
                    <Button size="sm" onClick={() => setOpenModal('payment')}>
                      <Wallet size={14} /> Registrar pagamento
                    </Button>
                  )}
                </div>
              )
            }
          >
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
          </SectionCard>

          <SectionCard
            eyebrow="Registro fotográfico"
            title="Fotos do veículo"
            action={
              canAddPhotos && (
                <Button size="sm" onClick={() => setOpenModal('photo')}>
                  <Plus size={14} /> Adicionar foto
                </Button>
              )
            }
          >
            <PhotoGallery
              photos={workOrder.photos}
              canManage={canAddPhotos}
              onUploadClick={() => setOpenModal('photo')}
              onDelete={(photoId) =>
                withToast(() => deleteWorkOrderPhoto(workOrder.id, photoId), 'Foto removida.')
              }
            />
          </SectionCard>
        </div>

        <div className="space-y-5">
          <SectionCard eyebrow="Cliente" title={client.name}>
            <dl className="space-y-2 text-sm">
              {client.phone && (
                <div className="flex justify-between">
                  <dt className="text-slate-500">Telefone</dt>
                  <dd className="tabular font-medium text-slate-800">{client.phone}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-slate-500">Ficha completa</dt>
                <dd>
                  <Link to={`/clientes/${client.id}`} className="font-medium text-brand-700 hover:underline">
                    Ver cliente
                  </Link>
                </dd>
              </div>
            </dl>
          </SectionCard>

          <QrCodeCard workOrderId={workOrder.id} workOrderNumber={workOrder.number} publicToken={workOrder.publicToken} />

          {canManage && (
            <SectionCard eyebrow="Zona de risco" title="Remover ordem de serviço">
              <p className="mb-3 text-sm text-slate-500">
                Remove definitivamente esta OS, incluindo serviços, peças, fotos, pagamentos e histórico de status. Use apenas para corrigir um cadastro feito por engano.
              </p>
              <Button variant="danger" size="sm" onClick={() => setOpenModal('delete')}>
                <Trash2 size={14} /> Remover esta OS
              </Button>
            </SectionCard>
          )}
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
      <ConfirmDialog
        isOpen={openModal === 'delete'}
        title="Remover ordem de serviço"
        message={`Tem certeza que deseja remover a OS-${String(workOrder.number).padStart(4, '0')}? Serviços, peças, fotos, pagamentos e o histórico de status vinculados serão apagados. Esta ação não pode ser desfeita.`}
        confirmLabel="Remover definitivamente"
        isLoading={isDeleting}
        onConfirm={handleDeleteWorkOrder}
        onCancel={() => setOpenModal(null)}
      />
    </div>
  );
}

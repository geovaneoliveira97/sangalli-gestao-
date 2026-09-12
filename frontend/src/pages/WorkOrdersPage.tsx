import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, ClipboardList, AlertCircle } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { ButtonLink } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { TableSkeleton } from '../components/ui/Skeleton';
import { StatusBadge } from '../components/StatusBadge';
import { listWorkOrders } from '../services/workOrderService';
import { getApiErrorMessage } from '../services/api';
import { STATUS_LABELS } from '../utils/statusLabels';
import { formatCurrency, formatDate } from '../utils/format';
import { getOverdueDays, isWorkOrderOverdue } from '../utils/workOrder';
import type { WorkOrder, WorkOrderStatus } from '../types';

export function WorkOrdersPage() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<WorkOrderStatus | ''>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async (searchTerm?: string, statusFilter?: WorkOrderStatus | '') => {
    setIsLoading(true);
    setError('');
    try {
      const data = await listWorkOrders({
        search: searchTerm || undefined,
        status: statusFilter || undefined,
      });
      setWorkOrders(data);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Não foi possível carregar as ordens de serviço.'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const timeout = setTimeout(() => load(search || undefined, status), 350);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, status]);

  return (
    <div>
      <PageHeader
        eyebrow="Operação"
        title="Ordens de Serviço"
        description="Acompanhe todas as ordens de serviço da oficina."
        action={
          <ButtonLink to="/ordens/nova">
            <Plus size={16} /> Nova ordem de serviço
          </ButtonLink>
        }
      />

      <Card className="mb-4 flex flex-col gap-3 p-3 sm:flex-row">
        <div className="relative max-w-sm flex-1">
          <label htmlFor="wo-search" className="sr-only">
            Buscar por placa ou cliente
          </label>
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            id="wo-search"
            type="search"
            placeholder="Buscar por placa ou cliente"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="min-h-[40px] w-full rounded border border-slate-300 py-2 pl-9 pr-3 text-sm focus:border-brand-600"
          />
        </div>
        <div className="max-w-xs">
          <label htmlFor="wo-status" className="sr-only">
            Filtrar por status
          </label>
          <select
            id="wo-status"
            value={status}
            onChange={(e) => setStatus(e.target.value as WorkOrderStatus | '')}
            className="min-h-[40px] w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm focus:border-brand-600"
          >
            <option value="">Todos os status</option>
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
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
            <TableSkeleton rows={6} cols={6} />
          </div>
        ) : workOrders.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="Nenhuma ordem de serviço encontrada"
            description="Ajuste a busca ou o filtro de status, ou registre a entrada de um novo veículo."
            action={
              <ButtonLink to="/ordens/nova">
                <Plus size={16} /> Nova ordem de serviço
              </ButtonLink>
            }
          />
        ) : (
          <div className="table-scroll">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th scope="col" className="px-5 py-3">OS</th>
                  <th scope="col" className="px-5 py-3">Cliente / Veículo</th>
                  <th scope="col" className="px-5 py-3">Status</th>
                  <th scope="col" className="px-5 py-3">Entrada</th>
                  <th scope="col" className="px-5 py-3">Previsão</th>
                  <th scope="col" className="px-5 py-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {workOrders.map((wo) => {
                  const overdue = isWorkOrderOverdue(wo);
                  return (
                    <tr key={wo.id} className={`hover:bg-slate-50 ${overdue ? 'bg-status-danger-soft/40' : ''}`}>
                      <td className="px-5 py-3">
                        <Link to={`/ordens/${wo.id}`} className="font-mono text-xs font-semibold text-slate-700 hover:underline">
                          OS-{String(wo.number).padStart(4, '0')}
                        </Link>
                      </td>
                      <td className="px-5 py-3 text-slate-600">
                        <p className="font-medium text-slate-700">{'name' in wo.client ? wo.client.name : ''}</p>
                        <p className="text-xs text-slate-500">
                          {'plate' in wo.vehicle ? wo.vehicle.plate : ''}
                          {'brand' in wo.vehicle ? ` · ${wo.vehicle.brand} ${wo.vehicle.model}` : ''}
                        </p>
                      </td>
                      <td className="px-5 py-3">
                        <StatusBadge status={wo.status} />
                      </td>
                      <td className="px-5 py-3 tabular text-slate-600">{formatDate(wo.entryDate)}</td>
                      <td className="px-5 py-3">
                        <span className="tabular text-slate-600">{formatDate(wo.estimatedDelivery)}</span>
                        {overdue && (
                          <span className="ml-2 text-xs font-semibold text-status-danger">
                            {getOverdueDays(wo)}d atraso
                          </span>
                        )}
                      </td>
                      <td className="tabular px-5 py-3 text-right font-medium text-slate-800">
                        {formatCurrency(wo.totals.total)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

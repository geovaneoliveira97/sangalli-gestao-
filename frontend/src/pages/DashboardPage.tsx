import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Car,
  Wrench,
  Paintbrush,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  CalendarClock,
  ArrowRight,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { PageHeader } from '../components/ui/PageHeader';
import { StatCard } from '../components/StatCard';
import { SectionCard } from '../components/ui/SectionCard';
import { Skeleton, TableSkeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { StatusBadge } from '../components/StatusBadge';
import { fetchDashboardSummary, fetchReports } from '../services/reportService';
import { listWorkOrders } from '../services/workOrderService';
import { getApiErrorMessage } from '../services/api';
import type { DashboardSummary, ReportsData, WorkOrder } from '../types';
import { formatCurrency, formatDate } from '../utils/format';
import { CHART_INK, SEQUENTIAL_ACCENT, STATUS_CHART_COLORS } from '../utils/chartColors';
import { STATUS_LABELS } from '../utils/statusLabels';
import { getOverdueDays, isWorkOrderOverdue } from '../utils/workOrder';

const TODAY_LABEL = new Date().toLocaleDateString('pt-BR', {
  weekday: 'long',
  day: '2-digit',
  month: 'long',
});

export function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [reports, setReports] = useState<ReportsData | null>(null);
  const [openOrders, setOpenOrders] = useState<WorkOrder[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    Promise.all([fetchDashboardSummary(), fetchReports({}), listWorkOrders()])
      .then(([summaryData, reportsData, workOrders]) => {
        if (!active) return;
        setSummary(summaryData);
        setReports(reportsData);
        setOpenOrders(workOrders);
      })
      .catch((err) => {
        if (active) setError(getApiErrorMessage(err, 'Não foi possível carregar o dashboard.'));
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const attentionOrders = useMemo(() => {
    const overdue = openOrders
      .filter((wo) => isWorkOrderOverdue(wo))
      .sort((a, b) => getOverdueDays(b) - getOverdueDays(a));
    const waitingApproval = openOrders
      .filter((wo) => wo.status === 'AGUARDANDO_APROVACAO' && !isWorkOrderOverdue(wo))
      .sort((a, b) => new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime());
    return [...overdue, ...waitingApproval].slice(0, 8);
  }, [openOrders]);

  const overdueCount = useMemo(() => openOrders.filter((wo) => isWorkOrderOverdue(wo)).length, [openOrders]);

  return (
    <div>
      <PageHeader
        eyebrow="Painel operacional"
        title="Visão geral"
        description={`Como está a oficina hoje, ${TODAY_LABEL}.`}
      />

      {error && (
        <div role="alert" className="mb-5 flex items-center gap-2 rounded border border-error/30 bg-error-container px-4 py-3 text-body-medium text-error">
          <AlertCircle size={18} aria-hidden="true" />
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      ) : (
        summary && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            <StatCard icon={Car} label="Veículos em serviço" value={summary.cards.inService} tone="info" />
            <StatCard icon={Wrench} label="Em manutenção" value={summary.cards.inMaintenance} tone="info" />
            <StatCard icon={Paintbrush} label="Em funilaria/pintura" value={summary.cards.inBodywork} tone="info" />
            <StatCard icon={CheckCircle2} label="Prontos para entrega" value={summary.cards.readyForDelivery} tone="success" />
            <StatCard icon={AlertTriangle} label="OS atrasadas" value={overdueCount} tone={overdueCount > 0 ? 'danger' : 'neutral'} />
          </div>
        )
      )}

      <SectionCard
        className="mt-5"
        eyebrow="Requer ação"
        title="Ordens que precisam de atenção"
        action={
          <Link to="/ordens" className="inline-flex min-h-10 items-center gap-1 text-label-large text-primary touch-target hover:underline">
            Ver todas <ArrowRight size={14} aria-hidden="true" />
          </Link>
        }
        bodyClassName="p-0"
      >
        {isLoading ? (
          <div className="p-5">
            <TableSkeleton rows={4} cols={4} />
          </div>
        ) : attentionOrders.length === 0 ? (
          <div className="p-5">
            <EmptyState
              icon={CheckCircle2}
              title="Nenhuma ordem pendente de atenção"
              description="Todas as ordens em aberto estão dentro do prazo e sem aprovação pendente."
            />
          </div>
        ) : (
          <div className="table-scroll">
            <table className="w-full text-left text-body-medium">
              <thead className="border-b border-outline-variant text-label-medium text-on-surface-variant">
                <tr>
                  <th scope="col" className="px-5 py-3">OS</th>
                  <th scope="col" className="px-5 py-3">Cliente / Veículo</th>
                  <th scope="col" className="px-5 py-3">Status</th>
                  <th scope="col" className="px-5 py-3">Situação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {attentionOrders.map((wo) => {
                  const overdueDays = getOverdueDays(wo);
                  return (
                    <tr key={wo.id} className="hover:bg-surface-container-high">
                      <td className="px-5 py-3">
                        <Link to={`/ordens/${wo.id}`} className="font-mono text-body-small font-medium text-on-surface touch-target hover:underline">
                          OS-{String(wo.number).padStart(4, '0')}
                        </Link>
                      </td>
                      <td className="px-5 py-3 text-on-surface-variant">
                        <p className="font-medium text-on-surface">{'name' in wo.client ? wo.client.name : ''}</p>
                        <p className="text-body-small text-on-surface-variant">{'plate' in wo.vehicle ? wo.vehicle.plate : ''}</p>
                      </td>
                      <td className="px-5 py-3">
                        <StatusBadge status={wo.status} compact />
                      </td>
                      <td className="px-5 py-3">
                        {overdueDays > 0 ? (
                          <span className="text-body-small font-medium text-error">
                            {overdueDays} {overdueDays === 1 ? 'dia' : 'dias'} de atraso
                          </span>
                        ) : (
                          <span className="text-body-small text-warning">Aguardando aprovação do cliente</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SectionCard eyebrow="Financeiro" title="Faturamento mensal">
          {isLoading ? (
            <Skeleton className="h-64" />
          ) : reports && reports.charts.revenueByMonth.some((m) => m.total > 0) ? (
            <div role="img" aria-label="Gráfico de faturamento mensal dos últimos 6 meses">
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={reports.charts.revenueByMonth}>
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART_INK.grid} vertical={false} />
                  <XAxis dataKey="month" stroke={CHART_INK.muted} fontSize={12} tickLine={false} />
                  <YAxis
                    stroke={CHART_INK.muted}
                    fontSize={12}
                    tickLine={false}
                    tickFormatter={(v) => formatCurrency(v)}
                    width={90}
                  />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Line
                    type="monotone"
                    dataKey="total"
                    name="Faturamento"
                    stroke={SEQUENTIAL_ACCENT}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState icon={CalendarClock} title="Sem dados de faturamento ainda" />
          )}
        </SectionCard>

        <SectionCard eyebrow="Distribuição" title="Ordens de serviço por status">
          {isLoading ? (
            <Skeleton className="h-64" />
          ) : reports && reports.charts.ordersByStatus.length > 0 ? (
            <div role="img" aria-label="Gráfico de quantidade de ordens de serviço por status">
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={reports.charts.ordersByStatus} layout="vertical" margin={{ left: 24 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART_INK.grid} horizontal={false} />
                  <XAxis type="number" stroke={CHART_INK.muted} fontSize={12} allowDecimals={false} />
                  <YAxis
                    type="category"
                    dataKey="status"
                    stroke={CHART_INK.muted}
                    fontSize={12}
                    width={140}
                    tickFormatter={(status) => STATUS_LABELS[status as keyof typeof STATUS_LABELS]}
                  />
                  <Tooltip
                    formatter={(value: number) => [value, 'Ordens']}
                    labelFormatter={(status) => STATUS_LABELS[status as keyof typeof STATUS_LABELS]}
                  />
                  <Bar dataKey="count" name="Ordens" radius={[0, 3, 3, 0]}>
                    {reports.charts.ordersByStatus.map((entry) => (
                      <Cell key={entry.status} fill={STATUS_CHART_COLORS[entry.status]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState icon={CalendarClock} title="Nenhuma ordem de serviço cadastrada" />
          )}
        </SectionCard>

        <SectionCard eyebrow="Catálogo" title="Serviços mais realizados">
          {isLoading ? (
            <Skeleton className="h-64" />
          ) : reports && reports.charts.topServices.length > 0 ? (
            <div role="img" aria-label="Gráfico dos serviços mais realizados">
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={reports.charts.topServices}>
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART_INK.grid} vertical={false} />
                  <XAxis
                    dataKey="name"
                    stroke={CHART_INK.muted}
                    fontSize={11}
                    tickLine={false}
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis stroke={CHART_INK.muted} fontSize={12} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" name="Vezes realizado" fill={SEQUENTIAL_ACCENT} radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState icon={CalendarClock} title="Nenhum serviço registrado ainda" />
          )}
        </SectionCard>

        <SectionCard eyebrow="Agenda" title="Próximas entregas" bodyClassName="p-0">
          {isLoading ? (
            <div className="p-5">
              <Skeleton className="h-48" />
            </div>
          ) : summary && summary.upcomingDeliveries.length > 0 ? (
            <ul className="divide-y divide-outline-variant">
              {summary.upcomingDeliveries.map((item) => (
                <li key={item.id}>
                  <Link
                    to={`/ordens/${item.id}`}
                    className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-surface-container-high"
                  >
                    <div>
                      <p className="font-mono text-body-small font-medium text-on-surface">
                        OS-{String(item.number).padStart(4, '0')}
                      </p>
                      <p className="text-body-medium text-on-surface-variant">{item.vehicle} · {item.plate}</p>
                    </div>
                    <span className="tabular whitespace-nowrap text-body-medium text-on-surface-variant">
                      <span className="sr-only">Previsão de entrega:</span>
                      {formatDate(item.estimatedDelivery)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-5">
              <EmptyState icon={CalendarClock} title="Nenhuma entrega prevista" />
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}

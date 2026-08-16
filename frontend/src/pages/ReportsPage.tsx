import { useEffect, useState } from 'react';
import { AlertCircle, DollarSign, CheckCircle2, Receipt, Clock, Car, UserPlus } from 'lucide-react';
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
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { StatCard } from '../components/StatCard';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { fetchReports } from '../services/reportService';
import { getApiErrorMessage } from '../services/api';
import { formatCurrency } from '../utils/format';
import { CHART_INK, SEQUENTIAL_BLUE, STATUS_CHART_COLORS } from '../utils/chartColors';
import { STATUS_LABELS } from '../utils/statusLabels';
import type { ReportsData, WorkOrderStatus } from '../types';

export function ReportsPage() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState<WorkOrderStatus | ''>('');
  const [data, setData] = useState<ReportsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setIsLoading(true);
    setError('');
    fetchReports({ startDate: startDate || undefined, endDate: endDate || undefined, status: status || undefined })
      .then(setData)
      .catch((err) => setError(getApiErrorMessage(err, 'Não foi possível carregar os relatórios.')))
      .finally(() => setIsLoading(false));
  }, [startDate, endDate, status]);

  return (
    <div>
      <PageHeader title="Relatórios" description="Indicadores e desempenho da oficina." />

      <Card className="mb-6 p-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Input label="Data inicial" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          <Input label="Data final" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          <Select label="Status" value={status} onChange={(e) => setStatus(e.target.value as WorkOrderStatus | '')}>
            <option value="">Todos os status</option>
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </div>
      </Card>

      {error && (
        <div role="alert" className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle size={18} aria-hidden="true" />
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : (
        data && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard icon={DollarSign} label="Faturamento" value={formatCurrency(data.indicators.revenue)} accent="bg-emerald-50 text-emerald-700" />
            <StatCard icon={CheckCircle2} label="OS concluídas" value={data.indicators.completedWorkOrders} accent="bg-blue-50 text-blue-700" />
            <StatCard icon={Receipt} label="Ticket médio" value={formatCurrency(data.indicators.averageTicket)} accent="bg-amber-50 text-amber-700" />
            <StatCard icon={Clock} label="Tempo médio de serviço" value={`${data.indicators.averageServiceTimeDays.toFixed(1)} dias`} accent="bg-purple-50 text-purple-700" />
            <StatCard icon={Car} label="Veículos atendidos" value={data.indicators.vehiclesServed} accent="bg-sky-50 text-sky-700" />
            <StatCard icon={UserPlus} label="Novos clientes" value={data.indicators.newClients} accent="bg-rose-50 text-rose-700" />
          </div>
        )
      )}

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="mb-4 text-base font-semibold text-slate-900">Faturamento por mês</h2>
          {isLoading ? (
            <Skeleton className="h-64" />
          ) : data && data.charts.revenueByMonth.some((m) => m.total > 0) ? (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={data.charts.revenueByMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_INK.grid} vertical={false} />
                <XAxis dataKey="month" stroke={CHART_INK.muted} fontSize={12} tickLine={false} />
                <YAxis stroke={CHART_INK.muted} fontSize={12} tickFormatter={(v) => formatCurrency(v)} width={90} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Line type="monotone" dataKey="total" name="Faturamento" stroke={SEQUENTIAL_BLUE} strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState icon={DollarSign} title="Sem dados no período selecionado" />
          )}
        </Card>

        <Card className="p-5">
          <h2 className="mb-4 text-base font-semibold text-slate-900">OS por status</h2>
          {isLoading ? (
            <Skeleton className="h-64" />
          ) : data && data.charts.ordersByStatus.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={data.charts.ordersByStatus} layout="vertical" margin={{ left: 24 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_INK.grid} horizontal={false} />
                <XAxis type="number" stroke={CHART_INK.muted} fontSize={12} allowDecimals={false} />
                <YAxis
                  type="category"
                  dataKey="status"
                  stroke={CHART_INK.muted}
                  fontSize={12}
                  width={140}
                  tickFormatter={(s) => STATUS_LABELS[s as WorkOrderStatus]}
                />
                <Tooltip formatter={(value: number) => [value, 'Ordens']} labelFormatter={(s) => STATUS_LABELS[s as WorkOrderStatus]} />
                <Bar dataKey="count" name="Ordens" radius={[0, 4, 4, 0]}>
                  {data.charts.ordersByStatus.map((entry) => (
                    <Cell key={entry.status} fill={STATUS_CHART_COLORS[entry.status]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState icon={DollarSign} title="Nenhuma ordem no período selecionado" />
          )}
        </Card>

        <Card className="p-5 lg:col-span-2">
          <h2 className="mb-4 text-base font-semibold text-slate-900">Serviços mais realizados</h2>
          {isLoading ? (
            <Skeleton className="h-64" />
          ) : data && data.charts.topServices.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={data.charts.topServices}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_INK.grid} vertical={false} />
                <XAxis dataKey="name" stroke={CHART_INK.muted} fontSize={11} interval={0} angle={-20} textAnchor="end" height={60} />
                <YAxis stroke={CHART_INK.muted} fontSize={12} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" name="Vezes realizado" fill={SEQUENTIAL_BLUE} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState icon={DollarSign} title="Nenhum serviço registrado ainda" />
          )}
        </Card>
      </div>
    </div>
  );
}

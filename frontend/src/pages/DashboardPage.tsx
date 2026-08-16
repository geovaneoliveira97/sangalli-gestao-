import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Car, Wrench, Paintbrush, CheckCircle2, AlertCircle, CalendarClock } from 'lucide-react';
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
import { Card } from '../components/ui/Card';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { fetchDashboardSummary, fetchReports } from '../services/reportService';
import { getApiErrorMessage } from '../services/api';
import type { DashboardSummary, ReportsData } from '../types';
import { formatCurrency, formatDate } from '../utils/format';
import { CHART_INK, SEQUENTIAL_BLUE, STATUS_CHART_COLORS } from '../utils/chartColors';
import { STATUS_LABELS } from '../utils/statusLabels';

export function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [reports, setReports] = useState<ReportsData | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    Promise.all([fetchDashboardSummary(), fetchReports({})])
      .then(([summaryData, reportsData]) => {
        if (!active) return;
        setSummary(summaryData);
        setReports(reportsData);
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

  return (
    <div>
      <PageHeader title="Dashboard" description="Visão geral da oficina em tempo real." />

      {error && (
        <div role="alert" className="mb-6 flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle size={18} aria-hidden="true" />
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : (
        summary && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={Car}
              label="Veículos em serviço"
              value={summary.cards.inService}
              accent="bg-blue-50 text-blue-700"
            />
            <StatCard
              icon={Wrench}
              label="Em manutenção"
              value={summary.cards.inMaintenance}
              accent="bg-amber-50 text-amber-700"
            />
            <StatCard
              icon={Paintbrush}
              label="Em funilaria/pintura"
              value={summary.cards.inBodywork}
              accent="bg-purple-50 text-purple-700"
            />
            <StatCard
              icon={CheckCircle2}
              label="Prontos para entrega"
              value={summary.cards.readyForDelivery}
              accent="bg-emerald-50 text-emerald-700"
            />
          </div>
        )
      )}

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="mb-4 text-base font-semibold text-slate-900">Faturamento mensal</h2>
          {isLoading ? (
            <Skeleton className="h-64" />
          ) : reports && reports.charts.revenueByMonth.some((m) => m.total > 0) ? (
            <div role="img" aria-label="Gráfico de faturamento mensal dos últimos 6 meses">
              <ResponsiveContainer width="100%" height={260}>
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
                    stroke={SEQUENTIAL_BLUE}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState icon={CalendarClock} title="Sem dados de faturamento ainda" />
          )}
        </Card>

        <Card className="p-5">
          <h2 className="mb-4 text-base font-semibold text-slate-900">Ordens de serviço por status</h2>
          {isLoading ? (
            <Skeleton className="h-64" />
          ) : reports && reports.charts.ordersByStatus.length > 0 ? (
            <div role="img" aria-label="Gráfico de quantidade de ordens de serviço por status">
              <ResponsiveContainer width="100%" height={260}>
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
                  <Bar dataKey="count" name="Ordens" radius={[0, 4, 4, 0]}>
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
        </Card>

        <Card className="p-5">
          <h2 className="mb-4 text-base font-semibold text-slate-900">Serviços mais realizados</h2>
          {isLoading ? (
            <Skeleton className="h-64" />
          ) : reports && reports.charts.topServices.length > 0 ? (
            <div role="img" aria-label="Gráfico dos serviços mais realizados">
              <ResponsiveContainer width="100%" height={260}>
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
                  <Bar dataKey="count" name="Vezes realizado" fill={SEQUENTIAL_BLUE} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState icon={CalendarClock} title="Nenhum serviço registrado ainda" />
          )}
        </Card>

        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">Próximas entregas</h2>
            <Link to="/ordens" className="text-sm font-medium text-brand-700 hover:underline">
              Ver todas
            </Link>
          </div>
          {isLoading ? (
            <Skeleton className="h-64" />
          ) : summary && summary.upcomingDeliveries.length > 0 ? (
            <ul className="divide-y divide-slate-100">
              {summary.upcomingDeliveries.map((item) => (
                <li key={item.id} className="py-3">
                  <Link
                    to={`/ordens/${item.id}`}
                    className="flex items-center justify-between gap-3 rounded-lg px-2 py-1 hover:bg-slate-50"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-800">
                        OS #{item.number} · {item.vehicle}
                      </p>
                      <p className="text-xs text-slate-500">{item.plate}</p>
                    </div>
                    <span className="whitespace-nowrap text-sm text-slate-600">
                      <span className="sr-only">Previsão de entrega:</span>
                      {formatDate(item.estimatedDelivery)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState icon={CalendarClock} title="Nenhuma entrega prevista" />
          )}
        </Card>
      </div>
    </div>
  );
}

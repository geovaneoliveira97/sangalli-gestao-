import { useEffect, useState } from 'react';
import { AlertCircle, DollarSign, Receipt, TrendingUp } from 'lucide-react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { PageHeader } from '../components/ui/PageHeader';
import { SectionCard } from '../components/ui/SectionCard';
import { StatCard } from '../components/StatCard';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { fetchReports } from '../services/reportService';
import { getApiErrorMessage } from '../services/api';
import { formatCurrency } from '../utils/format';
import { CHART_INK, SEQUENTIAL_ACCENT } from '../utils/chartColors';
import type { ReportsData } from '../types';

export function FinancePage() {
  const [data, setData] = useState<ReportsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchReports({})
      .then(setData)
      .catch((err) => setError(getApiErrorMessage(err, 'Não foi possível carregar os dados financeiros.')))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div>
      <PageHeader
        eyebrow="Financeiro"
        title="Financeiro"
        description="Visão consolidada do faturamento da oficina. Para filtros e mais indicadores, acesse Relatórios."
      />

      {error && (
        <div role="alert" className="mb-4 flex items-center gap-2 rounded border border-status-danger/30 bg-status-danger-soft px-4 py-3 text-sm text-status-danger">
          <AlertCircle size={18} aria-hidden="true" />
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      ) : (
        data && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <StatCard icon={DollarSign} label="Faturamento total" value={formatCurrency(data.indicators.revenue)} tone="success" />
            <StatCard icon={Receipt} label="Ticket médio" value={formatCurrency(data.indicators.averageTicket)} tone="warning" />
            <StatCard icon={TrendingUp} label="OS concluídas" value={data.indicators.completedWorkOrders} tone="info" />
          </div>
        )
      )}

      <SectionCard className="mt-5" eyebrow="Evolução" title="Faturamento por mês">
        {isLoading ? (
          <Skeleton className="h-64" />
        ) : data && data.charts.revenueByMonth.some((m) => m.total > 0) ? (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={data.charts.revenueByMonth}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_INK.grid} vertical={false} />
              <XAxis dataKey="month" stroke={CHART_INK.muted} fontSize={12} tickLine={false} />
              <YAxis stroke={CHART_INK.muted} fontSize={12} tickFormatter={(v) => formatCurrency(v)} width={90} />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Line type="monotone" dataKey="total" name="Faturamento" stroke={SEQUENTIAL_ACCENT} strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <EmptyState icon={DollarSign} title="Sem faturamento registrado ainda" description="Assim que houver pagamentos registrados, o gráfico aparece aqui." />
        )}
      </SectionCard>
    </div>
  );
}

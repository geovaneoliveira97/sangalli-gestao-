import { useEffect, useState } from 'react';
import { AlertCircle, DollarSign, Receipt, TrendingUp } from 'lucide-react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { StatCard } from '../components/StatCard';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { fetchReports } from '../services/reportService';
import { getApiErrorMessage } from '../services/api';
import { formatCurrency } from '../utils/format';
import { CHART_INK, SEQUENTIAL_BLUE } from '../utils/chartColors';
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
        title="Financeiro"
        description="Visão consolidada do faturamento da oficina. Para filtros e mais indicadores, acesse Relatórios."
      />

      {error && (
        <div role="alert" className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle size={18} aria-hidden="true" />
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : (
        data && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard icon={DollarSign} label="Faturamento total" value={formatCurrency(data.indicators.revenue)} accent="bg-emerald-50 text-emerald-700" />
            <StatCard icon={Receipt} label="Ticket médio" value={formatCurrency(data.indicators.averageTicket)} accent="bg-amber-50 text-amber-700" />
            <StatCard icon={TrendingUp} label="OS concluídas" value={data.indicators.completedWorkOrders} accent="bg-blue-50 text-blue-700" />
          </div>
        )
      )}

      <Card className="mt-6 p-5">
        <h2 className="mb-4 text-base font-semibold text-slate-900">Faturamento por mês</h2>
        {isLoading ? (
          <Skeleton className="h-64" />
        ) : data && data.charts.revenueByMonth.some((m) => m.total > 0) ? (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={data.charts.revenueByMonth}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_INK.grid} vertical={false} />
              <XAxis dataKey="month" stroke={CHART_INK.muted} fontSize={12} tickLine={false} />
              <YAxis stroke={CHART_INK.muted} fontSize={12} tickFormatter={(v) => formatCurrency(v)} width={90} />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Line type="monotone" dataKey="total" name="Faturamento" stroke={SEQUENTIAL_BLUE} strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <EmptyState icon={DollarSign} title="Sem faturamento registrado ainda" />
        )}
      </Card>
    </div>
  );
}


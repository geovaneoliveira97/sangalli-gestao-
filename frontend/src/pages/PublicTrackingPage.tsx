import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Wrench, AlertCircle, Car, Calendar, Camera } from 'lucide-react';
import { fetchPublicWorkOrder } from '../services/publicService';
import { getApiErrorMessage } from '../services/api';
import { formatCurrency, formatDate } from '../utils/format';
import { PHOTO_CATEGORY_LABELS, STATUS_ICONS, STATUS_LABELS, WORK_ORDER_STATUS_FLOW } from '../utils/statusLabels';
import type { PhotoCategory, PublicWorkOrder } from '../types';

export function PublicTrackingPage() {
  const { token } = useParams<{ token: string }>();
  const [data, setData] = useState<PublicWorkOrder | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    setIsLoading(true);
    fetchPublicWorkOrder(token)
      .then(setData)
      .catch((err) =>
        setError(getApiErrorMessage(err, 'Não foi possível carregar as informações do seu veículo.')),
      )
      .finally(() => setIsLoading(false));
  }, [token]);

  return (
    <div className="min-h-screen bg-slate-950">
      <header className="flex items-center gap-2 px-4 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white">
          <Wrench size={20} aria-hidden="true" />
        </div>
        <span className="text-lg font-bold text-white">AutoControl</span>
      </header>

      <main className="mx-auto max-w-lg px-4 pb-16">
        {isLoading && (
          <div className="mt-10 flex justify-center">
            <div
              className="h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-brand-500"
              role="status"
              aria-label="Carregando informações"
            />
          </div>
        )}

        {!isLoading && error && (
          <div role="alert" className="mt-10 flex items-start gap-2 rounded-xl bg-red-950/60 p-4 text-sm text-red-200">
            <AlertCircle size={20} className="mt-0.5 shrink-0" aria-hidden="true" />
            <p>{error}</p>
          </div>
        )}

        {!isLoading && data && (
          <div className="space-y-4">
            <section className="rounded-2xl bg-white p-5 shadow-lg">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Seu veículo</p>
              <h1 className="text-xl font-bold text-slate-900">
                {data.vehicle.brand} {data.vehicle.model}
              </h1>
              <p className="text-sm text-slate-500">
                {data.vehicle.plate} · {data.vehicle.color} · {data.vehicle.year}
              </p>

              <div className="mt-4 flex items-center gap-2 rounded-xl bg-brand-50 px-4 py-3">
                <span className="text-2xl" aria-hidden="true">
                  {STATUS_ICONS[data.status]}
                </span>
                <div>
                  <p className="text-xs font-medium text-brand-700">Status atual</p>
                  <p className="text-base font-bold text-brand-900">{STATUS_LABELS[data.status]}</p>
                </div>
              </div>

              {data.estimatedDelivery && (
                <div className="mt-3 flex items-center gap-2 text-sm text-slate-600">
                  <Calendar size={16} className="text-slate-400" aria-hidden="true" />
                  Previsão de entrega: <strong>{formatDate(data.estimatedDelivery)}</strong>
                </div>
              )}
            </section>

            {data.status !== 'CANCELADO' && (
              <section className="rounded-2xl bg-white p-5 shadow-lg">
                <h2 className="mb-4 text-base font-semibold text-slate-900">Linha do tempo</h2>
                <PublicTimeline status={data.status} history={data.statusHistory} />
              </section>
            )}

            {(data.services.length > 0 || data.parts.length > 0) && (
              <section className="rounded-2xl bg-white p-5 shadow-lg">
                <h2 className="mb-3 text-base font-semibold text-slate-900">Serviços e peças</h2>
                <ul className="divide-y divide-slate-100 text-sm">
                  {data.services.map((s, i) => (
                    <li key={`s-${i}`} className="flex justify-between py-2">
                      <span className="text-slate-700">{s.name}</span>
                      <span className="font-medium text-slate-800">{formatCurrency(s.price)}</span>
                    </li>
                  ))}
                  {data.parts.map((p, i) => (
                    <li key={`p-${i}`} className="flex justify-between py-2">
                      <span className="text-slate-700">
                        {p.name} <span className="text-xs text-slate-400">x{p.quantity}</span>
                      </span>
                      <span className="font-medium text-slate-800">{formatCurrency(p.unitPrice * p.quantity)}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-3 space-y-1 border-t border-slate-200 pt-3 text-sm">
                  <div className="flex justify-between text-base font-bold text-slate-900">
                    <span>Total</span>
                    <span>{formatCurrency(data.totals.total)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-700">
                    <span>Pago</span>
                    <span>{formatCurrency(data.totals.paid)}</span>
                  </div>
                  <div className="flex justify-between font-medium text-amber-700">
                    <span>Restante</span>
                    <span>{formatCurrency(data.totals.remaining)}</span>
                  </div>
                </div>
              </section>
            )}

            {data.photos.length > 0 && (
              <section className="rounded-2xl bg-white p-5 shadow-lg">
                <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-slate-900">
                  <Camera size={18} aria-hidden="true" /> Fotos
                </h2>
                {(['ENTRADA', 'DURANTE', 'FINALIZACAO'] as PhotoCategory[]).map((category) => {
                  const items = data.photos.filter((p) => p.category === category);
                  if (items.length === 0) return null;
                  return (
                    <div key={category} className="mb-4 last:mb-0">
                      <p className="mb-2 text-sm font-medium text-slate-600">{PHOTO_CATEGORY_LABELS[category]}</p>
                      <div className="grid grid-cols-3 gap-2">
                        {items.map((photo, i) => (
                          <img
                            key={i}
                            src={photo.url}
                            alt={photo.caption || `Foto — ${PHOTO_CATEGORY_LABELS[category]}`}
                            className="aspect-square w-full rounded-lg object-cover"
                            loading="lazy"
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </section>
            )}

            {data.publicNotes && (
              <section className="rounded-2xl bg-white p-5 shadow-lg">
                <h2 className="mb-2 text-base font-semibold text-slate-900">Observações</h2>
                <p className="text-sm text-slate-700">{data.publicNotes}</p>
              </section>
            )}

            <p className="flex items-center justify-center gap-1.5 pt-2 text-center text-xs text-slate-500">
              <Car size={14} aria-hidden="true" /> Ordem de serviço nº {data.number} · Entrada em{' '}
              {formatDate(data.entryDate)}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

function PublicTimeline({
  status,
  history,
}: {
  status: PublicWorkOrder['status'];
  history: PublicWorkOrder['statusHistory'];
}) {
  const currentIndex = WORK_ORDER_STATUS_FLOW.indexOf(status);

  return (
    <ol className="space-y-0">
      {WORK_ORDER_STATUS_FLOW.map((step, index) => {
        const isDone = index < currentIndex;
        const isCurrent = index === currentIndex;
        const entry = [...history].reverse().find((h) => h.status === step);
        const isLast = index === WORK_ORDER_STATUS_FLOW.length - 1;

        return (
          <li key={step} className="relative flex gap-3 pb-5 last:pb-0">
            {!isLast && (
              <span
                aria-hidden="true"
                className={`absolute left-[11px] top-6 h-full w-0.5 ${isDone ? 'bg-emerald-400' : 'bg-slate-200'}`}
              />
            )}
            <span
              aria-hidden="true"
              className={`z-10 mt-0.5 h-6 w-6 shrink-0 rounded-full border-2 ${
                isDone
                  ? 'border-emerald-500 bg-emerald-500'
                  : isCurrent
                    ? 'border-brand-600 bg-brand-600'
                    : 'border-slate-300 bg-white'
              }`}
            />
            <div>
              <p className={`text-sm font-medium ${isCurrent ? 'text-brand-700' : 'text-slate-700'}`}>
                {isDone ? '✓ ' : isCurrent ? '🔄 ' : '○ '}
                {STATUS_LABELS[step]}
              </p>
              {entry && <p className="text-xs text-slate-500">{formatDate(entry.createdAt)}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

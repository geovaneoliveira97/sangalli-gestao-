import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Wrench, AlertCircle, Car, Calendar, Camera, Check } from 'lucide-react';
import { fetchPublicWorkOrder } from '../services/publicService';
import { getApiErrorMessage } from '../services/api';
import { formatCurrency, formatDate } from '../utils/format';
import {
  PHOTO_CATEGORY_LABELS,
  STATUS_LABELS,
  STATUS_STAGE_CODE,
  STATUS_TONE,
  TONE_CLASSES,
  WORK_ORDER_STATUS_FLOW,
} from '../utils/statusLabels';
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
      <header className="flex items-center gap-2.5 border-b border-white/10 px-4 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded bg-brand-600 text-white">
          <Wrench size={16} aria-hidden="true" />
        </div>
        <div>
          <p className="text-sm font-bold leading-none text-white">Sangalli Gestão</p>
          <p className="mt-0.5 text-[11px] leading-none text-slate-400">Acompanhamento de OS</p>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 pb-16 pt-5">
        {isLoading && (
          <div className="mt-10 flex justify-center">
            <div
              className="h-9 w-9 animate-spin rounded-full border-4 border-slate-700 border-t-brand-500"
              role="status"
              aria-label="Carregando informações"
            />
          </div>
        )}

        {!isLoading && error && (
          <div role="alert" className="mt-10 flex items-start gap-2 rounded-md bg-status-danger/10 p-4 text-sm text-red-200">
            <AlertCircle size={20} className="mt-0.5 shrink-0" aria-hidden="true" />
            <p>{error}</p>
          </div>
        )}

        {!isLoading && data && (
          <div className="space-y-4">
            <section className="rounded-md border border-slate-800 bg-white p-5">
              <p className="eyebrow">Seu veículo</p>
              <h1 className="text-xl font-bold text-slate-900">
                {data.vehicle.brand} {data.vehicle.model}
              </h1>
              <p className="tabular text-sm text-slate-500">
                {data.vehicle.plate} · {data.vehicle.color} · {data.vehicle.year}
              </p>

              <div
                className={`mt-4 flex items-center gap-3 rounded border px-4 py-3 ${TONE_CLASSES[STATUS_TONE[data.status]].border} ${TONE_CLASSES[STATUS_TONE[data.status]].bg}`}
              >
                <span
                  className={`h-2.5 w-2.5 shrink-0 rounded-full ${TONE_CLASSES[STATUS_TONE[data.status]].dot}`}
                  aria-hidden="true"
                />
                <div>
                  <p className="eyebrow">Status atual · OS #{data.number}</p>
                  <p className={`text-base font-bold ${TONE_CLASSES[STATUS_TONE[data.status]].text}`}>
                    {STATUS_LABELS[data.status]}
                  </p>
                </div>
              </div>

              {data.estimatedDelivery && (
                <div className="mt-3 flex items-center gap-2 text-sm text-slate-600">
                  <Calendar size={16} className="text-slate-400" aria-hidden="true" />
                  Previsão de entrega: <strong className="tabular">{formatDate(data.estimatedDelivery)}</strong>
                </div>
              )}
            </section>

            {data.status !== 'CANCELADO' && (
              <section className="rounded-md border border-slate-800 bg-white p-5">
                <h2 className="mb-4 text-sm font-semibold text-slate-900">Linha do tempo</h2>
                <PublicTimeline status={data.status} history={data.statusHistory} />
              </section>
            )}

            {(data.services.length > 0 || data.parts.length > 0) && (
              <section className="rounded-md border border-slate-800 bg-white p-5">
                <h2 className="mb-3 text-sm font-semibold text-slate-900">Serviços e peças</h2>
                <ul className="divide-y divide-slate-100 text-sm">
                  {data.services.map((s, i) => (
                    <li key={`s-${i}`} className="flex justify-between py-2">
                      <span className="text-slate-700">{s.name}</span>
                      <span className="tabular font-medium text-slate-800">{formatCurrency(s.price)}</span>
                    </li>
                  ))}
                  {data.parts.map((p, i) => (
                    <li key={`p-${i}`} className="flex justify-between py-2">
                      <span className="text-slate-700">
                        {p.name} <span className="text-xs text-slate-400">x{p.quantity}</span>
                      </span>
                      <span className="tabular font-medium text-slate-800">{formatCurrency(p.unitPrice * p.quantity)}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-3 space-y-1 border-t border-slate-200 pt-3 text-sm">
                  <div className="flex justify-between text-base font-bold text-slate-900">
                    <span>Total</span>
                    <span className="tabular">{formatCurrency(data.totals.total)}</span>
                  </div>
                  <div className="flex justify-between text-status-success">
                    <span>Pago</span>
                    <span className="tabular">{formatCurrency(data.totals.paid)}</span>
                  </div>
                  <div className="flex justify-between font-medium text-status-warning">
                    <span>Restante</span>
                    <span className="tabular">{formatCurrency(data.totals.remaining)}</span>
                  </div>
                </div>
              </section>
            )}

            {data.photos.length > 0 && (
              <section className="rounded-md border border-slate-800 bg-white p-5">
                <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <Camera size={16} aria-hidden="true" /> Fotos
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
                            className="aspect-square w-full rounded object-cover"
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
              <section className="rounded-md border border-slate-800 bg-white p-5">
                <h2 className="mb-2 text-sm font-semibold text-slate-900">Observações</h2>
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
                className={`absolute left-[11px] top-6 h-full w-px ${isDone ? 'bg-status-success' : 'bg-slate-200'}`}
              />
            )}
            <span
              aria-hidden="true"
              className={`z-10 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
                isDone
                  ? 'border-status-success bg-status-success text-white'
                  : isCurrent
                    ? 'border-brand-600 bg-brand-600 text-white'
                    : 'border-slate-300 bg-white'
              }`}
            >
              {isDone && <Check size={12} />}
            </span>
            <div>
              <p className={`flex items-center gap-1.5 text-sm font-medium ${isCurrent ? 'text-brand-700' : 'text-slate-700'}`}>
                <span className="font-mono text-[10px] font-semibold tracking-wide text-slate-400">
                  {STATUS_STAGE_CODE[step]}
                </span>
                <span>{STATUS_LABELS[step]}</span>
              </p>
              {entry && <p className="text-xs text-slate-500">{formatDate(entry.createdAt)}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

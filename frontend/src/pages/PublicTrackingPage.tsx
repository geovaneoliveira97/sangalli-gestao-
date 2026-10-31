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
    <div className="min-h-screen bg-surface">
      <header className="flex items-center gap-3 border-b border-outline-variant px-4 py-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-container text-on-primary-container">
          <Wrench size={20} aria-hidden="true" />
        </div>
        <div>
          <p className="text-title-small text-on-surface">Sangalli Gestão</p>
          <p className="text-body-small text-on-surface-variant">Acompanhamento de OS</p>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 pb-16 pt-5">
        {isLoading && (
          <div className="mt-10 flex justify-center">
            <div
              className="h-9 w-9 animate-spin rounded-full border-4 border-outline-variant border-t-primary"
              role="status"
              aria-label="Carregando informações"
            />
          </div>
        )}

        {!isLoading && error && (
          <div role="alert" className="mt-10 flex items-start gap-2 rounded-md bg-error-container p-4 text-body-medium text-on-error-container">
            <AlertCircle size={20} className="mt-0.5 shrink-0" aria-hidden="true" />
            <p>{error}</p>
          </div>
        )}

        {!isLoading && data && (
          <div className="space-y-4">
            <section className="rounded-md bg-surface-container p-5">
              <p className="eyebrow">Seu veículo</p>
              <h1 className="text-title-large font-medium text-on-surface">
                {data.vehicle.brand} {data.vehicle.model}
              </h1>
              <p className="tabular text-body-medium text-on-surface-variant">
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
                  <p className={`text-body-large font-medium ${TONE_CLASSES[STATUS_TONE[data.status]].text}`}>
                    {STATUS_LABELS[data.status]}
                  </p>
                </div>
              </div>

              {data.estimatedDelivery && (
                <div className="mt-3 flex items-center gap-2 text-body-medium text-on-surface-variant">
                  <Calendar size={16} className="text-on-surface-variant" aria-hidden="true" />
                  Previsão de entrega: <strong className="tabular">{formatDate(data.estimatedDelivery)}</strong>
                </div>
              )}
            </section>

            {data.status !== 'CANCELADO' && (
              <section className="rounded-md bg-surface-container p-5">
                <h2 className="mb-4 text-body-medium font-medium text-on-surface">Linha do tempo</h2>
                <PublicTimeline status={data.status} history={data.statusHistory} />
              </section>
            )}

            {(data.services.length > 0 || data.parts.length > 0) && (
              <section className="rounded-md bg-surface-container p-5">
                <h2 className="mb-3 text-body-medium font-medium text-on-surface">Serviços e peças</h2>
                <ul className="divide-y divide-outline-variant text-body-medium">
                  {data.services.map((s, i) => (
                    <li key={`s-${i}`} className="flex justify-between py-2">
                      <span className="text-on-surface">{s.name}</span>
                      <span className="tabular font-medium text-on-surface">{formatCurrency(s.price)}</span>
                    </li>
                  ))}
                  {data.parts.map((p, i) => (
                    <li key={`p-${i}`} className="flex justify-between py-2">
                      <span className="text-on-surface">
                        {p.name} <span className="text-body-small text-on-surface-variant">x{p.quantity}</span>
                      </span>
                      <span className="tabular font-medium text-on-surface">{formatCurrency(p.unitPrice * p.quantity)}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-3 space-y-1 border-t border-outline-variant pt-3 text-body-medium">
                  <div className="flex justify-between text-body-large font-medium text-on-surface">
                    <span>Total</span>
                    <span className="tabular">{formatCurrency(data.totals.total)}</span>
                  </div>
                  <div className="flex justify-between text-success">
                    <span>Pago</span>
                    <span className="tabular">{formatCurrency(data.totals.paid)}</span>
                  </div>
                  <div className="flex justify-between font-medium text-warning">
                    <span>Restante</span>
                    <span className="tabular">{formatCurrency(data.totals.remaining)}</span>
                  </div>
                </div>
              </section>
            )}

            {data.photos.length > 0 && (
              <section className="rounded-md bg-surface-container p-5">
                <h2 className="mb-3 flex items-center gap-2 text-body-medium font-medium text-on-surface">
                  <Camera size={16} aria-hidden="true" /> Fotos
                </h2>
                {(['ENTRADA', 'DURANTE', 'FINALIZACAO'] as PhotoCategory[]).map((category) => {
                  const items = data.photos.filter((p) => p.category === category);
                  if (items.length === 0) return null;
                  return (
                    <div key={category} className="mb-4 last:mb-0">
                      <p className="mb-2 text-body-medium font-medium text-on-surface-variant">{PHOTO_CATEGORY_LABELS[category]}</p>
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
              <section className="rounded-md bg-surface-container p-5">
                <h2 className="mb-2 text-body-medium font-medium text-on-surface">Observações</h2>
                <p className="text-body-medium text-on-surface">{data.publicNotes}</p>
              </section>
            )}

            <p className="flex items-center justify-center gap-2 pt-2 text-center text-body-small text-on-surface-variant">
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
                className={`absolute left-[11px] top-6 h-full w-px ${isDone ? 'bg-success' : 'bg-outline-variant'}`}
              />
            )}
            <span
              aria-hidden="true"
              className={`z-10 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
                isDone
                  ? 'border-success bg-success text-on-success'
                  : isCurrent
                    ? 'border-primary bg-primary text-on-primary'
                    : 'border-outline bg-surface'
              }`}
            >
              {isDone && <Check size={12} />}
            </span>
            <div>
              <p className={`flex items-center gap-2 text-body-medium font-medium ${isCurrent ? 'text-primary' : 'text-on-surface'}`}>
                <span className="font-mono text-label-medium text-on-surface-variant">
                  {STATUS_STAGE_CODE[step]}
                </span>
                <span>{STATUS_LABELS[step]}</span>
              </p>
              {entry && <p className="text-body-small text-on-surface-variant">{formatDate(entry.createdAt)}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

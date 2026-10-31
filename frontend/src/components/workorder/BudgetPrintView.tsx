import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { formatCurrency, formatDate } from '../../utils/format';
import type { Client, Vehicle, WorkOrder } from '../../types';

interface BudgetPrintViewProps {
  workOrder: WorkOrder;
}

function SummaryRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between">
      <span>{label}</span>
      <span className="tabular">{formatCurrency(value)}</span>
    </div>
  );
}

// Documento entregue ao cliente: fica invisível na tela e é o único conteúdo
// impresso enquanto estiver montado (regra `.print-root` no index.css). Por
// ser externo à oficina, não inclui observações internas nem o CPF do cliente.
export function BudgetPrintView({ workOrder }: BudgetPrintViewProps) {
  const client = workOrder.client as Client;
  const vehicle = workOrder.vehicle as Vehicle;
  const { totals } = workOrder;
  const orderLabel = `OS-${String(workOrder.number).padStart(4, '0')}`;

  // O navegador sugere o título da página como nome do arquivo ao salvar em PDF.
  useEffect(() => {
    let originalTitle = document.title;
    const pdfTitle = `Orcamento-${orderLabel}-${vehicle.plate}`;

    function handleBeforePrint() {
      originalTitle = document.title;
      document.title = pdfTitle;
    }

    function handleAfterPrint() {
      document.title = originalTitle;
    }

    window.addEventListener('beforeprint', handleBeforePrint);
    window.addEventListener('afterprint', handleAfterPrint);
    return () => {
      window.removeEventListener('beforeprint', handleBeforePrint);
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, [orderLabel, vehicle.plate]);

  const items = [
    ...workOrder.services.map((item) => ({
      id: item.id,
      description: item.service.name,
      quantity: 1,
      unitPrice: Number(item.price),
    })),
    ...workOrder.parts.map((item) => ({
      id: item.id,
      description: item.part.name,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
    })),
    ...(totals.laborCost > 0
      ? [{ id: 'labor', description: 'Mão de obra', quantity: 1, unitPrice: totals.laborCost }]
      : []),
  ];

  return createPortal(
    <div className="print-root hidden text-sm text-slate-900 print:block">
      <header className="flex items-start justify-between gap-6 border-b-2 border-slate-900 pb-3">
        <div>
          <p className="text-xl font-bold leading-tight">Sangalli Gestão</p>
          <p className="text-xs text-slate-600">Oficina Mecânica e Funilaria</p>
        </div>
        <div className="text-right">
          <h1 className="text-xl font-bold leading-tight">Orçamento</h1>
          <p className="font-mono text-xs font-semibold">{orderLabel}</p>
          <p className="tabular text-xs text-slate-600">Emitido em {formatDate(new Date())}</p>
        </div>
      </header>

      <section className="mt-4 grid grid-cols-2 gap-6">
        <div>
          <h2 className="eyebrow mb-1">Cliente</h2>
          <p className="font-semibold">{client.name}</p>
          {client.phone && <p className="tabular">{client.phone}</p>}
          {client.email && <p>{client.email}</p>}
        </div>
        <div>
          <h2 className="eyebrow mb-1">Veículo</h2>
          <p className="font-semibold">
            {vehicle.brand} {vehicle.model}
            {vehicle.year ? ` ${vehicle.year}` : ''}
          </p>
          <p>
            Placa <span className="font-mono font-semibold">{vehicle.plate}</span>
            {vehicle.color ? ` · ${vehicle.color}` : ''}
          </p>
          {vehicle.mileage > 0 && <p className="tabular">{vehicle.mileage.toLocaleString('pt-BR')} km</p>}
        </div>
      </section>

      <section className="mt-4 grid grid-cols-2 gap-6">
        <div>
          <h2 className="eyebrow mb-1">Entrada</h2>
          <p className="tabular">{formatDate(workOrder.entryDate)}</p>
        </div>
        {workOrder.estimatedDelivery && (
          <div>
            <h2 className="eyebrow mb-1">Previsão de entrega</h2>
            <p className="tabular">{formatDate(workOrder.estimatedDelivery)}</p>
          </div>
        )}
      </section>

      <section className="mt-4">
        <h2 className="eyebrow mb-1">Problema relatado</h2>
        <p className="whitespace-pre-line">{workOrder.problemDescription}</p>
      </section>

      {workOrder.diagnosis && (
        <section className="mt-4">
          <h2 className="eyebrow mb-1">Diagnóstico</h2>
          <p className="whitespace-pre-line">{workOrder.diagnosis}</p>
        </section>
      )}

      <table className="mt-5 w-full border-collapse text-left">
        <thead className="border-b border-slate-900 text-xs uppercase tracking-wide">
          <tr>
            <th scope="col" className="py-1.5 pr-2">Descrição</th>
            <th scope="col" className="px-2 py-1.5 text-right">Qtd.</th>
            <th scope="col" className="px-2 py-1.5 text-right">Valor unit.</th>
            <th scope="col" className="py-1.5 pl-2 text-right">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="break-inside-avoid border-b border-slate-200">
              <td className="py-1.5 pr-2">{item.description}</td>
              <td className="tabular px-2 py-1.5 text-right">{item.quantity}</td>
              <td className="tabular px-2 py-1.5 text-right">{formatCurrency(item.unitPrice)}</td>
              <td className="tabular py-1.5 pl-2 text-right">{formatCurrency(item.unitPrice * item.quantity)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <section className="ml-auto mt-4 w-64 break-inside-avoid space-y-1">
        <SummaryRow label="Serviços" value={totals.servicesTotal} />
        <SummaryRow label="Peças" value={totals.partsTotal} />
        <SummaryRow label="Mão de obra" value={totals.laborCost} />
        <div className="flex justify-between border-t-2 border-slate-900 pt-1 text-lg font-bold">
          <span>Total</span>
          <span className="tabular">{formatCurrency(totals.total)}</span>
        </div>
        {totals.paid > 0 && (
          <>
            <SummaryRow label="Pago" value={totals.paid} />
            <SummaryRow label="Restante" value={totals.remaining} />
          </>
        )}
      </section>

      {workOrder.publicNotes && (
        <section className="mt-4 break-inside-avoid">
          <h2 className="eyebrow mb-1">Observações</h2>
          <p className="whitespace-pre-line">{workOrder.publicNotes}</p>
        </section>
      )}

      <section className="mt-16 grid break-inside-avoid grid-cols-3 gap-6 text-center text-xs text-slate-600">
        <p className="col-span-2 border-t border-slate-900 pt-1">Assinatura do cliente</p>
        <p className="border-t border-slate-900 pt-1">Data</p>
      </section>
    </div>,
    document.body,
  );
}

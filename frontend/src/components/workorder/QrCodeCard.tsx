import { useEffect, useState } from 'react';
import { Download, QrCode as QrCodeIcon, ExternalLink } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { fetchWorkOrderQrCodeUrl } from '../../services/workOrderService';

interface QrCodeCardProps {
  workOrderId: string;
  workOrderNumber: number;
  publicToken: string;
}

export function QrCodeCard({ workOrderId, workOrderNumber, publicToken }: QrCodeCardProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    let objectUrl: string | null = null;
    fetchWorkOrderQrCodeUrl(workOrderId).then((url) => {
      objectUrl = url;
      setImageUrl(url);
    });
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [workOrderId]);

  const trackingPath = `/acompanhar/${publicToken}`;
  const trackingUrl = `${window.location.origin}${trackingPath}`;

  function handleDownload() {
    if (!imageUrl) return;
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `OS-${workOrderNumber}-qrcode.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <Card className="p-5 text-center">
      <p className="eyebrow">Acompanhamento do cliente</p>
      <h2 className="mb-1 text-sm font-semibold text-slate-900">Acompanhe seu veículo</h2>
      <p className="mb-4 text-sm text-slate-500">Escaneie com a câmera do celular.</p>

      <div className="mx-auto mb-4 flex h-44 w-44 items-center justify-center rounded-lg border border-slate-200 bg-white p-2">
        {imageUrl ? (
          <img src={imageUrl} alt={`QR Code de acompanhamento da ordem de serviço número ${workOrderNumber}`} className="h-full w-full" />
        ) : (
          <QrCodeIcon size={40} className="text-slate-300" aria-hidden="true" />
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Button variant="secondary" size="sm" onClick={handleDownload} disabled={!imageUrl}>
          <Download size={16} /> Baixar QR Code
        </Button>
        <a
          href={trackingPath}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center gap-1.5 text-sm font-medium text-brand-700 hover:underline"
        >
          <ExternalLink size={14} /> Abrir página pública
        </a>
        <p className="break-all font-mono text-xs text-slate-400">{trackingUrl}</p>
      </div>
    </Card>
  );
}

import { Request, Response } from 'express';
import QRCode from 'qrcode';
import prisma from '../utils/prisma';
import { asyncHandler } from '../utils/asyncHandler';
import { NotFoundError } from '../utils/AppError';

export const getWorkOrderQrCode = asyncHandler(async (req: Request, res: Response) => {
  const workOrder = await prisma.workOrder.findUnique({ where: { id: req.params.id } });
  if (!workOrder) throw new NotFoundError('Ordem de serviço não encontrada.');

  // FRONTEND_URL pode conter vários endereços separados por vírgula (usado pelo
  // CORS para liberar mais de uma origem, ex.: produção + IP da rede local para
  // testes). Para o QR Code, usamos apenas o primeiro — o endereço público
  // "canônico" — senão a URL ficaria com vírgula no meio e não abriria.
  const frontendUrl = (process.env.FRONTEND_URL ?? 'http://localhost:5173').split(',')[0].trim();
  const trackingUrl = `${frontendUrl}/acompanhar/${workOrder.publicToken}`;

  const buffer = await QRCode.toBuffer(trackingUrl, {
    width: 400,
    margin: 2,
    errorCorrectionLevel: 'M',
  });

  res.setHeader('Content-Type', 'image/png');
  res.setHeader('Content-Disposition', `inline; filename="OS-${workOrder.number}-qrcode.png"`);
  return res.send(buffer);
});

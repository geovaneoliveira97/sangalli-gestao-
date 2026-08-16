import { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../utils/prisma';
import cloudinary from '../utils/cloudinary';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError, NotFoundError } from '../utils/AppError';

const uploadBodySchema = z.object({
  category: z.enum(['ENTRADA', 'DURANTE', 'FINALIZACAO']),
  caption: z.string().optional().nullable(),
});

function uploadBuffer(buffer: Buffer, folder: string): Promise<{ url: string; publicId: string }> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error('Falha no upload da imagem.'));
          return;
        }
        resolve({ url: result.secure_url, publicId: result.public_id });
      },
    );
    stream.end(buffer);
  });
}

export const uploadWorkOrderPhoto = asyncHandler(async (req: Request, res: Response) => {
  const workOrder = await prisma.workOrder.findUnique({ where: { id: req.params.id } });
  if (!workOrder) throw new NotFoundError('Ordem de serviço não encontrada.');

  if (!req.file) {
    throw new AppError('Nenhum arquivo enviado.');
  }

  const { category, caption } = uploadBodySchema.parse(req.body);

  const { url, publicId } = await uploadBuffer(
    req.file.buffer,
    `autocontrol/work-orders/${workOrder.id}`,
  );

  const photo = await prisma.workOrderPhoto.create({
    data: {
      workOrderId: workOrder.id,
      url,
      publicId,
      category,
      caption,
      addedById: req.user?.sub,
    },
  });

  return res.status(201).json(photo);
});

export const deleteWorkOrderPhoto = asyncHandler(async (req: Request, res: Response) => {
  const photo = await prisma.workOrderPhoto.findUnique({ where: { id: req.params.photoId } });
  if (!photo || photo.workOrderId !== req.params.id) {
    throw new NotFoundError('Foto não encontrada.');
  }

  await cloudinary.uploader.destroy(photo.publicId).catch(() => undefined);
  await prisma.workOrderPhoto.delete({ where: { id: photo.id } });

  return res.status(204).send();
});

import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { asyncHandler } from '../utils/asyncHandler';
import { createServiceSchema, updateServiceSchema } from '../validators/serviceValidators';
import { NotFoundError } from '../utils/AppError';

export const listServices = asyncHandler(async (req: Request, res: Response) => {
  const onlyActive = req.query.active === 'true';
  const services = await prisma.service.findMany({
    where: onlyActive ? { active: true } : undefined,
    orderBy: { name: 'asc' },
  });
  return res.json(services);
});

export const getService = asyncHandler(async (req: Request, res: Response) => {
  const service = await prisma.service.findUnique({ where: { id: req.params.id } });
  if (!service) throw new NotFoundError('Serviço não encontrado.');
  return res.json(service);
});

export const createService = asyncHandler(async (req: Request, res: Response) => {
  const data = createServiceSchema.parse(req.body);
  const service = await prisma.service.create({ data });
  return res.status(201).json(service);
});

export const updateService = asyncHandler(async (req: Request, res: Response) => {
  const data = updateServiceSchema.parse(req.body);
  const existing = await prisma.service.findUnique({ where: { id: req.params.id } });
  if (!existing) throw new NotFoundError('Serviço não encontrado.');

  const service = await prisma.service.update({ where: { id: req.params.id }, data });
  return res.json(service);
});

export const deleteService = asyncHandler(async (req: Request, res: Response) => {
  const existing = await prisma.service.findUnique({ where: { id: req.params.id } });
  if (!existing) throw new NotFoundError('Serviço não encontrado.');

  await prisma.service.update({ where: { id: req.params.id }, data: { active: false } });
  return res.status(204).send();
});

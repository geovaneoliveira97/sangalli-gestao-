import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { asyncHandler } from '../utils/asyncHandler';
import { createPartSchema, updatePartSchema } from '../validators/partValidators';
import { NotFoundError } from '../utils/AppError';

export const listParts = asyncHandler(async (req: Request, res: Response) => {
  const onlyActive = req.query.active === 'true';
  const search = typeof req.query.search === 'string' ? req.query.search : undefined;

  const parts = await prisma.part.findMany({
    where: {
      active: onlyActive ? true : undefined,
      ...(search
        ? { OR: [{ name: { contains: search } }, { code: { contains: search } }] }
        : {}),
    },
    orderBy: { name: 'asc' },
  });
  return res.json(parts);
});

export const getPart = asyncHandler(async (req: Request, res: Response) => {
  const part = await prisma.part.findUnique({ where: { id: req.params.id } });
  if (!part) throw new NotFoundError('Peça não encontrada.');
  return res.json(part);
});

export const createPart = asyncHandler(async (req: Request, res: Response) => {
  const data = createPartSchema.parse(req.body);
  const part = await prisma.part.create({ data });
  return res.status(201).json(part);
});

export const updatePart = asyncHandler(async (req: Request, res: Response) => {
  const data = updatePartSchema.parse(req.body);
  const existing = await prisma.part.findUnique({ where: { id: req.params.id } });
  if (!existing) throw new NotFoundError('Peça não encontrada.');

  const part = await prisma.part.update({ where: { id: req.params.id }, data });
  return res.json(part);
});

export const deletePart = asyncHandler(async (req: Request, res: Response) => {
  const existing = await prisma.part.findUnique({ where: { id: req.params.id } });
  if (!existing) throw new NotFoundError('Peça não encontrada.');

  // Peça nunca usada em nenhuma OS: pode remover de vez do catálogo. Se já
  // foi usada, preserva o histórico das ordens de serviço existentes e
  // apenas desativa (some da lista de seleção em novas OS).
  const usageCount = await prisma.workOrderPart.count({ where: { partId: existing.id } });
  if (usageCount === 0) {
    await prisma.part.delete({ where: { id: existing.id } });
    return res.json({ deleted: true, deactivated: false });
  }

  await prisma.part.update({ where: { id: existing.id }, data: { active: false } });
  return res.json({ deleted: false, deactivated: true, usageCount });
});

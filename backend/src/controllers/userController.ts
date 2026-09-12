import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../utils/prisma';
import { asyncHandler } from '../utils/asyncHandler';
import { createUserSchema, updateUserSchema } from '../validators/userValidators';
import { NotFoundError } from '../utils/AppError';

const publicSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  active: true,
  createdAt: true,
};

export const listUsers = asyncHandler(async (_req: Request, res: Response) => {
  const users = await prisma.user.findMany({
    select: publicSelect,
    orderBy: { name: 'asc' },
  });
  return res.json(users);
});

export const getUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
    select: publicSelect,
  });
  if (!user) throw new NotFoundError('Usuário não encontrado.');
  return res.json(user);
});

export const createUser = asyncHandler(async (req: Request, res: Response) => {
  const data = createUserSchema.parse(req.body);
  const passwordHash = await bcrypt.hash(data.password, 10);

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      role: 'ADMIN',
      passwordHash,
    },
    select: publicSelect,
  });

  return res.status(201).json(user);
});

export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const data = updateUserSchema.parse(req.body);
  const existing = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!existing) throw new NotFoundError('Usuário não encontrado.');

  const passwordHash = data.password ? await bcrypt.hash(data.password, 10) : undefined;

  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: {
      name: data.name,
      email: data.email,
      active: data.active,
      ...(passwordHash ? { passwordHash } : {}),
    },
    select: publicSelect,
  });

  return res.json(user);
});

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const existing = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!existing) throw new NotFoundError('Usuário não encontrado.');

  await prisma.user.update({ where: { id: req.params.id }, data: { active: false } });
  return res.status(204).send();
});

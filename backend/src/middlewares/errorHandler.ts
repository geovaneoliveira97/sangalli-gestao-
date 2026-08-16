import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { AppError } from '../utils/AppError';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  if (err instanceof ZodError) {
    return res.status(422).json({
      error: 'Dados inválidos.',
      issues: err.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      })),
    });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const target = (err.meta?.target as string[] | undefined)?.join(', ') ?? 'campo único';
      return res.status(409).json({ error: `Já existe um registro com o mesmo ${target}.` });
    }
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Recurso não encontrado.' });
    }
    if (err.code === 'P2003') {
      return res.status(409).json({ error: 'Operação viola uma referência entre registros.' });
    }
  }

  // eslint-disable-next-line no-console
  console.error(err);
  return res.status(500).json({ error: 'Erro interno no servidor. Tente novamente mais tarde.' });
}

export function notFoundHandler(req: Request, res: Response) {
  return res.status(404).json({ error: 'Rota não encontrada.' });
}

import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma';
import { asyncHandler } from '../utils/asyncHandler';
import { loginSchema } from '../validators/authValidators';
import { UnauthorizedError } from '../utils/AppError';

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = loginSchema.parse(req.body);

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !user.active) {
    throw new UnauthorizedError('E-mail ou senha inválidos.');
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);

  if (!passwordMatches) {
    throw new UnauthorizedError('E-mail ou senha inválidos.');
  }

  const secret = process.env.JWT_SECRET as string;
  const expiresIn = process.env.JWT_EXPIRES_IN ?? '8h';

  const token = jwt.sign(
    { sub: user.id, role: user.role, name: user.name },
    secret,
    { expiresIn } as jwt.SignOptions,
  );

  return res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.sub },
    select: { id: true, name: true, email: true, role: true, active: true },
  });

  if (!user) {
    throw new UnauthorizedError();
  }

  return res.json(user);
});

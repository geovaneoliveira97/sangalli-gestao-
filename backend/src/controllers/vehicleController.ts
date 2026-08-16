import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { asyncHandler } from '../utils/asyncHandler';
import { createVehicleSchema, updateVehicleSchema } from '../validators/vehicleValidators';
import { NotFoundError } from '../utils/AppError';

export const listVehicles = asyncHandler(async (req: Request, res: Response) => {
  const clientId = typeof req.query.clientId === 'string' ? req.query.clientId : undefined;
  const search = typeof req.query.search === 'string' ? req.query.search : undefined;

  const vehicles = await prisma.vehicle.findMany({
    where: {
      clientId,
      ...(search
        ? {
            OR: [
              { plate: { contains: search } },
              { brand: { contains: search } },
              { model: { contains: search } },
            ],
          }
        : {}),
    },
    include: { client: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'desc' },
  });

  return res.json(vehicles);
});

export const getVehicle = asyncHandler(async (req: Request, res: Response) => {
  const vehicle = await prisma.vehicle.findUnique({
    where: { id: req.params.id },
    include: {
      client: true,
      workOrders: { orderBy: { createdAt: 'desc' } },
    },
  });
  if (!vehicle) throw new NotFoundError('Veículo não encontrado.');
  return res.json(vehicle);
});

export const createVehicle = asyncHandler(async (req: Request, res: Response) => {
  const data = createVehicleSchema.parse(req.body);
  const vehicle = await prisma.vehicle.create({
    data: { ...data, plate: data.plate.toUpperCase() },
  });
  return res.status(201).json(vehicle);
});

export const updateVehicle = asyncHandler(async (req: Request, res: Response) => {
  const data = updateVehicleSchema.parse(req.body);
  const existing = await prisma.vehicle.findUnique({ where: { id: req.params.id } });
  if (!existing) throw new NotFoundError('Veículo não encontrado.');

  const vehicle = await prisma.vehicle.update({
    where: { id: req.params.id },
    data: { ...data, plate: data.plate ? data.plate.toUpperCase() : undefined },
  });
  return res.json(vehicle);
});

export const deleteVehicle = asyncHandler(async (req: Request, res: Response) => {
  const existing = await prisma.vehicle.findUnique({ where: { id: req.params.id } });
  if (!existing) throw new NotFoundError('Veículo não encontrado.');

  await prisma.vehicle.delete({ where: { id: req.params.id } });
  return res.status(204).send();
});

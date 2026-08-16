import { z } from 'zod';

export const createVehicleSchema = z.object({
  clientId: z.string().uuid('Cliente inválido.'),
  plate: z.string().min(7, 'Placa inválida.').max(8, 'Placa inválida.'),
  brand: z.string().min(1, 'Informe a marca.'),
  model: z.string().min(1, 'Informe o modelo.'),
  year: z.number().int().min(1950).max(new Date().getFullYear() + 1),
  color: z.string().min(1, 'Informe a cor.'),
  mileage: z.number().int().min(0).default(0),
  notes: z.string().optional().nullable(),
});

export const updateVehicleSchema = createVehicleSchema.partial();

export type CreateVehicleInput = z.infer<typeof createVehicleSchema>;
export type UpdateVehicleInput = z.infer<typeof updateVehicleSchema>;

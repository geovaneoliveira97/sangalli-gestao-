import { z } from 'zod';

export const createServiceSchema = z.object({
  name: z.string().min(2, 'Informe o nome do serviço.'),
  description: z.string().optional().nullable(),
  defaultPrice: z.number().min(0, 'Valor inválido.'),
  active: z.boolean().default(true),
});

export const updateServiceSchema = createServiceSchema.partial();

export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;

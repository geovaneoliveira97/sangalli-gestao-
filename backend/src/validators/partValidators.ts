import { z } from 'zod';

export const createPartSchema = z.object({
  name: z.string().min(2, 'Informe o nome da peça.'),
  code: z.string().min(1, 'Informe o código da peça.'),
  manufacturer: z.string().optional().nullable(),
  price: z.number().min(0, 'Valor inválido.'),
  stock: z.number().int().min(0).default(0),
  active: z.boolean().default(true),
});

export const updatePartSchema = createPartSchema.partial();

export type CreatePartInput = z.infer<typeof createPartSchema>;
export type UpdatePartInput = z.infer<typeof updatePartSchema>;

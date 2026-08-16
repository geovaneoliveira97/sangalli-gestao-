import { z } from 'zod';

export const createClientSchema = z.object({
  name: z.string().min(2, 'Informe o nome completo.'),
  cpf: z.string().min(11, 'CPF inválido.').max(14, 'CPF inválido.'),
  phone: z.string().min(8, 'Informe um telefone válido.'),
  whatsapp: z.string().optional().nullable(),
  email: z.string().email('E-mail inválido.').optional().nullable().or(z.literal('')),
  zipCode: z.string().optional().nullable(),
  street: z.string().optional().nullable(),
  number: z.string().optional().nullable(),
  district: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
});

export const updateClientSchema = createClientSchema.partial();

export type CreateClientInput = z.infer<typeof createClientSchema>;
export type UpdateClientInput = z.infer<typeof updateClientSchema>;

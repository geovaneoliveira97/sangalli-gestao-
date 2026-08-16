import { z } from 'zod';

const statusEnum = z.enum([
  'EM_DIAGNOSTICO',
  'AGUARDANDO_APROVACAO',
  'EM_MANUTENCAO',
  'EM_FUNILARIA',
  'EM_PINTURA',
  'EM_TESTE',
  'PRONTO',
  'ENTREGUE',
  'CANCELADO',
]);

export const createWorkOrderSchema = z.object({
  clientId: z.string().uuid('Cliente inválido.'),
  vehicleId: z.string().uuid('Veículo inválido.'),
  problemDescription: z.string().min(3, 'Descreva o problema relatado.'),
  diagnosis: z.string().optional().nullable(),
  estimatedDelivery: z.coerce.date().optional().nullable(),
  laborCost: z.number().min(0).default(0),
  internalNotes: z.string().optional().nullable(),
  publicNotes: z.string().optional().nullable(),
});

export const updateWorkOrderSchema = z.object({
  problemDescription: z.string().min(3).optional(),
  diagnosis: z.string().optional().nullable(),
  estimatedDelivery: z.coerce.date().optional().nullable(),
  laborCost: z.number().min(0).optional(),
  internalNotes: z.string().optional().nullable(),
  publicNotes: z.string().optional().nullable(),
});

export const updateStatusSchema = z.object({
  status: statusEnum,
  note: z.string().optional().nullable(),
});

export const addServiceSchema = z.object({
  serviceId: z.string().uuid('Serviço inválido.'),
  price: z.number().min(0).optional(),
});

export const addPartSchema = z.object({
  partId: z.string().uuid('Peça inválida.'),
  quantity: z.number().int().min(1, 'Quantidade mínima é 1.'),
  unitPrice: z.number().min(0).optional(),
});

export const addPaymentSchema = z.object({
  amount: z.number().positive('Informe um valor maior que zero.'),
  method: z.enum(['DINHEIRO', 'PIX', 'CARTAO_CREDITO', 'CARTAO_DEBITO', 'BOLETO', 'TRANSFERENCIA']),
  notes: z.string().optional().nullable(),
});

export type CreateWorkOrderInput = z.infer<typeof createWorkOrderSchema>;
export type UpdateWorkOrderInput = z.infer<typeof updateWorkOrderSchema>;

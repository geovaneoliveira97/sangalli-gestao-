import type { PaymentMethod, PhotoCategory, UserRole, WorkOrderStatus } from '../types';

export const STATUS_LABELS: Record<WorkOrderStatus, string> = {
  EM_DIAGNOSTICO: 'Em diagnóstico',
  AGUARDANDO_APROVACAO: 'Aguardando aprovação',
  EM_MANUTENCAO: 'Em manutenção',
  EM_FUNILARIA: 'Funilaria',
  EM_PINTURA: 'Pintura',
  EM_TESTE: 'Em teste',
  PRONTO: 'Pronto para entrega',
  ENTREGUE: 'Entregue',
  CANCELADO: 'Cancelado',
};

export const STATUS_ICONS: Record<WorkOrderStatus, string> = {
  EM_DIAGNOSTICO: '🔍',
  AGUARDANDO_APROVACAO: '📋',
  EM_MANUTENCAO: '🔧',
  EM_FUNILARIA: '🎨',
  EM_PINTURA: '🎨',
  EM_TESTE: '🚗',
  PRONTO: '✅',
  ENTREGUE: '🏁',
  CANCELADO: '✖️',
};

export const STATUS_BADGE_CLASSES: Record<WorkOrderStatus, string> = {
  EM_DIAGNOSTICO: 'bg-sky-50 text-sky-700 border-sky-200',
  AGUARDANDO_APROVACAO: 'bg-amber-50 text-amber-700 border-amber-200',
  EM_MANUTENCAO: 'bg-blue-50 text-blue-700 border-blue-200',
  EM_FUNILARIA: 'bg-purple-50 text-purple-700 border-purple-200',
  EM_PINTURA: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200',
  EM_TESTE: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  PRONTO: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  ENTREGUE: 'bg-slate-100 text-slate-700 border-slate-300',
  CANCELADO: 'bg-red-50 text-red-700 border-red-200',
};

export const WORK_ORDER_STATUS_FLOW: WorkOrderStatus[] = [
  'EM_DIAGNOSTICO',
  'AGUARDANDO_APROVACAO',
  'EM_MANUTENCAO',
  'EM_FUNILARIA',
  'EM_PINTURA',
  'EM_TESTE',
  'PRONTO',
  'ENTREGUE',
];

export const PHOTO_CATEGORY_LABELS: Record<PhotoCategory, string> = {
  ENTRADA: 'Entrada',
  DURANTE: 'Durante o serviço',
  FINALIZACAO: 'Finalização',
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  DINHEIRO: 'Dinheiro',
  PIX: 'Pix',
  CARTAO_CREDITO: 'Cartão de crédito',
  CARTAO_DEBITO: 'Cartão de débito',
  BOLETO: 'Boleto',
  TRANSFERENCIA: 'Transferência',
};

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: 'Administrador',
  ATENDENTE: 'Atendente',
  MECANICO: 'Mecânico',
};

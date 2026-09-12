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

// Tom semântico fixo por status — a mesma regra de cor vale em toda a
// aplicação (etiquetas, linha do tempo, gráficos):
//   info    = em andamento     warning = aguardando ação
//   success = pronto/aprovado  danger  = cancelado
//   neutral = encerrado (entregue)
export type StatusTone = 'info' | 'warning' | 'success' | 'danger' | 'neutral';

export const STATUS_TONE: Record<WorkOrderStatus, StatusTone> = {
  EM_DIAGNOSTICO: 'info',
  AGUARDANDO_APROVACAO: 'warning',
  EM_MANUTENCAO: 'info',
  EM_FUNILARIA: 'info',
  EM_PINTURA: 'info',
  EM_TESTE: 'info',
  PRONTO: 'success',
  ENTREGUE: 'neutral',
  CANCELADO: 'danger',
};

export const TONE_CLASSES: Record<StatusTone, { text: string; border: string; bg: string; dot: string }> = {
  info: { text: 'text-status-info', border: 'border-status-info/30', bg: 'bg-status-info-soft', dot: 'bg-status-info' },
  warning: {
    text: 'text-status-warning',
    border: 'border-status-warning/40',
    bg: 'bg-status-warning-soft',
    dot: 'bg-status-warning',
  },
  success: {
    text: 'text-status-success',
    border: 'border-status-success/30',
    bg: 'bg-status-success-soft',
    dot: 'bg-status-success',
  },
  danger: {
    text: 'text-status-danger',
    border: 'border-status-danger/30',
    bg: 'bg-status-danger-soft',
    dot: 'bg-status-danger',
  },
  neutral: {
    text: 'text-slate-600',
    border: 'border-slate-300',
    bg: 'bg-slate-100',
    dot: 'bg-slate-400',
  },
};

// Código curto de etapa, em caixa alta/monoespaçado — permite reconhecer de
// relance se a OS está na mecânica, funilaria ou pintura mesmo quando várias
// etapas compartilham o mesmo tom "em andamento".
export const STATUS_STAGE_CODE: Record<WorkOrderStatus, string> = {
  EM_DIAGNOSTICO: 'DIAG',
  AGUARDANDO_APROVACAO: 'APROV',
  EM_MANUTENCAO: 'MEC',
  EM_FUNILARIA: 'FUN',
  EM_PINTURA: 'PINT',
  EM_TESTE: 'TESTE',
  PRONTO: 'PRONTO',
  ENTREGUE: 'OK',
  CANCELADO: 'CANC',
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

// Status considerados "em aberto" para fins de cálculo de atraso e
// indicadores operacionais (uma OS entregue ou cancelada nunca está atrasada).
export const OPEN_WORK_ORDER_STATUSES: WorkOrderStatus[] = WORK_ORDER_STATUS_FLOW.filter(
  (status) => status !== 'ENTREGUE',
);

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
};

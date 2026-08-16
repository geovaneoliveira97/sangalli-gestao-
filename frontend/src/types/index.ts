export type UserRole = 'ADMIN' | 'ATENDENTE' | 'MECANICO';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
  createdAt?: string;
}

export interface Client {
  id: string;
  name: string;
  cpf: string;
  phone: string;
  whatsapp?: string | null;
  email?: string | null;
  zipCode?: string | null;
  street?: string | null;
  number?: string | null;
  district?: string | null;
  city?: string | null;
  state?: string | null;
  createdAt?: string;
  vehicles?: Vehicle[];
  _count?: { vehicles: number };
}

export interface Vehicle {
  id: string;
  clientId: string;
  plate: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  mileage: number;
  notes?: string | null;
  createdAt?: string;
  client?: Pick<Client, 'id' | 'name'> | Client;
  workOrders?: WorkOrder[];
}

export interface Service {
  id: string;
  name: string;
  description?: string | null;
  defaultPrice: number;
  active: boolean;
}

export interface Part {
  id: string;
  name: string;
  code: string;
  manufacturer?: string | null;
  price: number;
  stock: number;
  active: boolean;
}

export type WorkOrderStatus =
  | 'EM_DIAGNOSTICO'
  | 'AGUARDANDO_APROVACAO'
  | 'EM_MANUTENCAO'
  | 'EM_FUNILARIA'
  | 'EM_PINTURA'
  | 'EM_TESTE'
  | 'PRONTO'
  | 'ENTREGUE'
  | 'CANCELADO';

export type PhotoCategory = 'ENTRADA' | 'DURANTE' | 'FINALIZACAO';

export type PaymentMethod =
  | 'DINHEIRO'
  | 'PIX'
  | 'CARTAO_CREDITO'
  | 'CARTAO_DEBITO'
  | 'BOLETO'
  | 'TRANSFERENCIA';

export interface WorkOrderService {
  id: string;
  workOrderId: string;
  serviceId: string;
  price: number;
  service: Service;
}

export interface WorkOrderPart {
  id: string;
  workOrderId: string;
  partId: string;
  quantity: number;
  unitPrice: number;
  part: Part;
}

export interface WorkOrderPhoto {
  id: string;
  workOrderId: string;
  url: string;
  publicId: string;
  category: PhotoCategory;
  caption?: string | null;
  createdAt: string;
}

export interface Payment {
  id: string;
  workOrderId: string;
  amount: number;
  method: PaymentMethod;
  paidAt: string;
  notes?: string | null;
}

export interface StatusHistoryEntry {
  id: string;
  status: WorkOrderStatus;
  note?: string | null;
  createdAt: string;
  user?: { id: string; name: string } | null;
}

export interface WorkOrderTotals {
  servicesTotal: number;
  partsTotal: number;
  laborCost: number;
  total: number;
  paid: number;
  remaining: number;
}

export interface WorkOrder {
  id: string;
  number: number;
  clientId: string;
  vehicleId: string;
  problemDescription: string;
  diagnosis?: string | null;
  status: WorkOrderStatus;
  entryDate: string;
  estimatedDelivery?: string | null;
  completedAt?: string | null;
  laborCost: number;
  internalNotes?: string | null;
  publicNotes?: string | null;
  publicToken: string;
  createdAt: string;
  client: Client | { id: string; name: string };
  vehicle: Vehicle | { id: string; plate: string; brand: string; model: string };
  services: WorkOrderService[];
  parts: WorkOrderPart[];
  photos: WorkOrderPhoto[];
  payments: Payment[];
  statusHistory: StatusHistoryEntry[];
  totals: WorkOrderTotals;
}

export interface PublicWorkOrder {
  number: number;
  status: WorkOrderStatus;
  entryDate: string;
  estimatedDelivery?: string | null;
  completedAt?: string | null;
  publicNotes?: string | null;
  client: { firstName: string };
  vehicle: { plate: string; brand: string; model: string; year: number; color: string };
  services: { name: string; price: number }[];
  parts: { name: string; quantity: number; unitPrice: number }[];
  photos: { url: string; category: PhotoCategory; caption?: string | null }[];
  statusHistory: { status: WorkOrderStatus; createdAt: string }[];
  totals: WorkOrderTotals;
}

export interface DashboardSummary {
  cards: {
    inService: number;
    inMaintenance: number;
    inBodywork: number;
    readyForDelivery: number;
  };
  upcomingDeliveries: {
    id: string;
    number: number;
    vehicle: string;
    plate: string;
    estimatedDelivery: string;
  }[];
}

export interface ReportsData {
  indicators: {
    revenue: number;
    completedWorkOrders: number;
    averageTicket: number;
    averageServiceTimeDays: number;
    vehiclesServed: number;
    newClients: number;
  };
  charts: {
    revenueByMonth: { month: string; total: number }[];
    topServices: { name: string; count: number }[];
    ordersByStatus: { status: WorkOrderStatus; count: number }[];
  };
}

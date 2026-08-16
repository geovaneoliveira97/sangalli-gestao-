import { api } from './api';
import type { PaymentMethod, WorkOrder, WorkOrderStatus } from '../types';

export interface CreateWorkOrderInput {
  clientId: string;
  vehicleId: string;
  problemDescription: string;
  diagnosis?: string | null;
  estimatedDelivery?: string | null;
  laborCost: number;
  internalNotes?: string | null;
  publicNotes?: string | null;
}

export async function listWorkOrders(params?: {
  status?: WorkOrderStatus;
  search?: string;
}): Promise<WorkOrder[]> {
  const { data } = await api.get<WorkOrder[]>('/ordens', { params });
  return data;
}

export async function getWorkOrder(id: string): Promise<WorkOrder> {
  const { data } = await api.get<WorkOrder>(`/ordens/${id}`);
  return data;
}

export async function createWorkOrder(input: CreateWorkOrderInput): Promise<WorkOrder> {
  const { data } = await api.post<WorkOrder>('/ordens', input);
  return data;
}

export async function updateWorkOrder(
  id: string,
  input: Partial<CreateWorkOrderInput>,
): Promise<WorkOrder> {
  const { data } = await api.put<WorkOrder>(`/ordens/${id}`, input);
  return data;
}

export async function updateWorkOrderStatus(
  id: string,
  status: WorkOrderStatus,
  note?: string,
): Promise<WorkOrder> {
  const { data } = await api.post<WorkOrder>(`/ordens/${id}/status`, { status, note });
  return data;
}

export async function addWorkOrderService(
  id: string,
  serviceId: string,
  price?: number,
): Promise<WorkOrder> {
  const { data } = await api.post<WorkOrder>(`/ordens/${id}/servicos`, { serviceId, price });
  return data;
}

export async function removeWorkOrderService(id: string, itemId: string): Promise<WorkOrder> {
  const { data } = await api.delete<WorkOrder>(`/ordens/${id}/servicos/${itemId}`);
  return data;
}

export async function addWorkOrderPart(
  id: string,
  partId: string,
  quantity: number,
  unitPrice?: number,
): Promise<WorkOrder> {
  const { data } = await api.post<WorkOrder>(`/ordens/${id}/pecas`, { partId, quantity, unitPrice });
  return data;
}

export async function removeWorkOrderPart(id: string, itemId: string): Promise<WorkOrder> {
  const { data } = await api.delete<WorkOrder>(`/ordens/${id}/pecas/${itemId}`);
  return data;
}

export async function addWorkOrderPayment(
  id: string,
  amount: number,
  method: PaymentMethod,
  notes?: string,
): Promise<WorkOrder> {
  const { data } = await api.post<WorkOrder>(`/ordens/${id}/pagamentos`, { amount, method, notes });
  return data;
}

export async function uploadWorkOrderPhoto(
  id: string,
  file: File,
  category: string,
  caption?: string,
): Promise<void> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('category', category);
  if (caption) formData.append('caption', caption);

  await api.post(`/ordens/${id}/fotos`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}

export async function deleteWorkOrderPhoto(id: string, photoId: string): Promise<void> {
  await api.delete(`/ordens/${id}/fotos/${photoId}`);
}

/**
 * O endpoint de QR Code exige autenticação (Bearer token), então a imagem é buscada
 * via axios (que já injeta o header) e convertida em uma Object URL para uso em <img>.
 */
export async function fetchWorkOrderQrCodeUrl(id: string): Promise<string> {
  const response = await api.get(`/ordens/${id}/qrcode`, { responseType: 'blob' });
  return URL.createObjectURL(response.data as Blob);
}

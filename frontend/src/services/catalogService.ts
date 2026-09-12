import { api } from './api';
import type { Part, Service } from '../types';

export type ServiceInput = Omit<Service, 'id'>;
export type PartInput = Omit<Part, 'id'>;

export async function listServices(onlyActive = false): Promise<Service[]> {
  const { data } = await api.get<Service[]>('/servicos', { params: { active: onlyActive } });
  return data;
}

export async function createService(input: ServiceInput): Promise<Service> {
  const { data } = await api.post<Service>('/servicos', input);
  return data;
}

export async function updateService(id: string, input: Partial<ServiceInput>): Promise<Service> {
  const { data } = await api.put<Service>(`/servicos/${id}`, input);
  return data;
}

export interface DeleteCatalogItemResult {
  deleted: boolean;
  deactivated: boolean;
  usageCount?: number;
}

export async function deleteService(id: string): Promise<DeleteCatalogItemResult> {
  const { data } = await api.delete<DeleteCatalogItemResult>(`/servicos/${id}`);
  return data;
}

export async function listParts(params?: { onlyActive?: boolean; search?: string }): Promise<Part[]> {
  const { data } = await api.get<Part[]>('/pecas', {
    params: { active: params?.onlyActive, search: params?.search },
  });
  return data;
}

export async function createPart(input: PartInput): Promise<Part> {
  const { data } = await api.post<Part>('/pecas', input);
  return data;
}

export async function updatePart(id: string, input: Partial<PartInput>): Promise<Part> {
  const { data } = await api.put<Part>(`/pecas/${id}`, input);
  return data;
}

export async function deletePart(id: string): Promise<DeleteCatalogItemResult> {
  const { data } = await api.delete<DeleteCatalogItemResult>(`/pecas/${id}`);
  return data;
}

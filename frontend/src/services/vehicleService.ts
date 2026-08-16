import { api } from './api';
import type { Vehicle } from '../types';

export type VehicleInput = Omit<Vehicle, 'id' | 'createdAt' | 'client' | 'workOrders'>;

export async function listVehicles(params?: { clientId?: string; search?: string }): Promise<Vehicle[]> {
  const { data } = await api.get<Vehicle[]>('/veiculos', { params });
  return data;
}

export async function getVehicle(id: string): Promise<Vehicle> {
  const { data } = await api.get<Vehicle>(`/veiculos/${id}`);
  return data;
}

export async function createVehicle(input: VehicleInput): Promise<Vehicle> {
  const { data } = await api.post<Vehicle>('/veiculos', input);
  return data;
}

export async function updateVehicle(id: string, input: Partial<VehicleInput>): Promise<Vehicle> {
  const { data } = await api.put<Vehicle>(`/veiculos/${id}`, input);
  return data;
}

export async function deleteVehicle(id: string): Promise<void> {
  await api.delete(`/veiculos/${id}`);
}

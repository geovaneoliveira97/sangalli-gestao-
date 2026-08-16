import { api } from './api';
import type { Client } from '../types';

export type ClientInput = Omit<Client, 'id' | 'createdAt' | 'vehicles' | '_count'>;

export async function listClients(search?: string): Promise<Client[]> {
  const { data } = await api.get<Client[]>('/clientes', { params: { search } });
  return data;
}

export async function getClient(id: string): Promise<Client> {
  const { data } = await api.get<Client>(`/clientes/${id}`);
  return data;
}

export async function createClient(input: ClientInput): Promise<Client> {
  const { data } = await api.post<Client>('/clientes', input);
  return data;
}

export async function updateClient(id: string, input: Partial<ClientInput>): Promise<Client> {
  const { data } = await api.put<Client>(`/clientes/${id}`, input);
  return data;
}

export async function deleteClient(id: string): Promise<void> {
  await api.delete(`/clientes/${id}`);
}

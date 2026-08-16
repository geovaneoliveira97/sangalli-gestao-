import { api } from './api';
import type { User } from '../types';

export interface UserInput {
  name: string;
  email: string;
  password?: string;
  role: User['role'];
  active?: boolean;
}

export async function listUsers(): Promise<User[]> {
  const { data } = await api.get<User[]>('/usuarios');
  return data;
}

export async function createUser(input: UserInput): Promise<User> {
  const { data } = await api.post<User>('/usuarios', input);
  return data;
}

export async function updateUser(id: string, input: Partial<UserInput>): Promise<User> {
  const { data } = await api.put<User>(`/usuarios/${id}`, input);
  return data;
}

export async function deactivateUser(id: string): Promise<void> {
  await api.delete(`/usuarios/${id}`);
}

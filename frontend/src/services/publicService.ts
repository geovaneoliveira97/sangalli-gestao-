import axios from 'axios';
import { API_URL } from './api';
import type { PublicWorkOrder } from '../types';

// Cliente sem interceptors de autenticação: a página de acompanhamento é pública.
const publicClient = axios.create({ baseURL: API_URL });

export async function fetchPublicWorkOrder(token: string): Promise<PublicWorkOrder> {
  const { data } = await publicClient.get<PublicWorkOrder>(`/acompanhar/${token}`);
  return data;
}

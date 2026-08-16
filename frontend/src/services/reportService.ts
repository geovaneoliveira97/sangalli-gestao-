import { api } from './api';
import type { DashboardSummary, ReportsData, WorkOrderStatus } from '../types';

export async function fetchDashboardSummary(): Promise<DashboardSummary> {
  const { data } = await api.get<DashboardSummary>('/dashboard');
  return data;
}

export interface ReportsFilters {
  startDate?: string;
  endDate?: string;
  status?: WorkOrderStatus;
}

export async function fetchReports(filters: ReportsFilters): Promise<ReportsData> {
  const { data } = await api.get<ReportsData>('/relatorios', { params: filters });
  return data;
}

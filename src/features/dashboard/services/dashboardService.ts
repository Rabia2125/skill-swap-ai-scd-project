import { request } from '../../../services/apiClient';
import { DashboardStatsResponse } from '../types';

export const dashboardService = {
  getDashboardStats: () => request<DashboardStatsResponse>('/api/stats')
};

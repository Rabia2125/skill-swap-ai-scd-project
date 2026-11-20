import { request } from '../../../services/apiClient';
import { SwapRequest } from '../../../types';
import { CreateSwapRequestPayload, SwapRequestTab } from '../types';

export const swapService = {
  getSwapRequests: (tab?: SwapRequestTab) =>
    request<{ requests: SwapRequest[] }>(`/api/swaps/requests${tab ? `?tab=${tab}` : ''}`),

  createSwapRequest: (data: CreateSwapRequestPayload) =>
    request<{ message: string; request: SwapRequest }>('/api/swaps/requests', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  acceptSwapRequest: (id: string) =>
    request<{ message: string; request: SwapRequest; conversationId: string }>(
      `/api/swaps/requests/${id}/accept`,
      { method: 'POST' }
    ),

  rejectSwapRequest: (id: string) =>
    request<{ message: string; request: SwapRequest }>(`/api/swaps/requests/${id}/reject`, {
      method: 'POST'
    }),

  cancelSwapRequest: (id: string) =>
    request<{ message: string; request: SwapRequest }>(`/api/swaps/requests/${id}/cancel`, {
      method: 'POST'
    })
};

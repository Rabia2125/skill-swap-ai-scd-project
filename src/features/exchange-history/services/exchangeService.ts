import { request } from '../../../services/apiClient';
import { ExchangeRecord } from '../../../types';
import { CompleteExchangePayload } from '../types';

export const exchangeService = {
  getExchanges: () => request<{ exchanges: ExchangeRecord[] }>('/api/exchanges'),

  completeExchange: (id: string, data: CompleteExchangePayload) =>
    request<{ message: string; exchange: ExchangeRecord }>(`/api/exchanges/${id}/complete`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
};

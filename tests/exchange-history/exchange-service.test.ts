import { describe, it, expect } from 'vitest';
import { exchangeService } from '../../src/features/exchange-history/services/exchangeService';
import { createMockFetch, mockExchanges, mockFetchResponse } from '../helpers/testUtils';

describe('exchangeService', () => {
  it('fetches exchange history from GET /api/exchanges', async () => {
    createMockFetch(() => mockFetchResponse({ exchanges: mockExchanges }));
    const res = await exchangeService.getExchanges();
    expect(res.exchanges).toHaveLength(2);
  });

  it('completes an exchange via PUT /api/exchanges/:id/complete', async () => {
    const fetchSpy = createMockFetch(() =>
      mockFetchResponse({ message: 'Done', exchange: mockExchanges[1] })
    );

    await exchangeService.completeExchange('ex_1', { rating: 5, review: 'Great session!' });
    expect(fetchSpy).toHaveBeenCalledWith(
      '/api/exchanges/ex_1/complete',
      expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify({ rating: 5, review: 'Great session!' })
      })
    );
  });
});

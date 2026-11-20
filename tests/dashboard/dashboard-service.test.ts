import { describe, it, expect } from 'vitest';
import { dashboardService } from '../../src/features/dashboard/services/dashboardService';
import { createMockFetch, mockFetchResponse } from '../helpers/testUtils';

describe('dashboardService', () => {
  it('fetches dashboard stats from GET /api/stats', async () => {
    const fetchSpy = createMockFetch(() =>
      mockFetchResponse({
        stats: {
          skillsOffered: 2,
          skillsWanted: 1,
          sentRequestsCount: 0,
          receivedRequestsCount: 1,
          acceptedExchangesCount: 1,
          unreadMessagesCount: 2,
          exchangesCompletedCount: 3
        },
        recentRequests: [],
        smartMatches: []
      })
    );

    const res = await dashboardService.getDashboardStats();
    expect(res.stats.skillsOffered).toBe(2);
    expect(fetchSpy).toHaveBeenCalledWith('/api/stats', expect.any(Object));
  });

  it('rejects when /api/stats returns 401 unauthorized', async () => {
    createMockFetch(() => mockFetchResponse({ error: 'Authentication required' }, false, 401));
    await expect(dashboardService.getDashboardStats()).rejects.toThrow('Authentication required');
  });
});

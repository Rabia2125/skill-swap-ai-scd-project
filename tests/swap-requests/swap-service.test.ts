import { describe, it, expect } from 'vitest';
import { swapService } from '../../src/features/swap-requests/services/swapService';
import { createMockFetch, mockFetchResponse, mockSwapRequests } from '../helpers/testUtils';

describe('swapService', () => {
  it('fetches swap requests filtered by tab', async () => {
    const fetchSpy = createMockFetch(() => mockFetchResponse({ requests: mockSwapRequests }));

    const res = await swapService.getSwapRequests('received');
    expect(res.requests).toHaveLength(1);
    expect(fetchSpy).toHaveBeenCalledWith('/api/swaps/requests?tab=received', expect.any(Object));
  });

  it('creates, accepts, rejects, and cancels swap requests via POST', async () => {
    const fetchSpy = createMockFetch((url) => {
      if (url.endsWith('/accept')) {
        return mockFetchResponse({ message: 'Accepted', request: mockSwapRequests[0], conversationId: 'conv_1' });
      }
      return mockFetchResponse({ message: 'OK', request: mockSwapRequests[0] });
    });

    await swapService.createSwapRequest({
      receiverId: 'user_maya',
      offeredSkill: 'React.js',
      requestedSkill: 'Figma',
      message: 'Let us swap!'
    });
    await swapService.acceptSwapRequest('req_1');
    await swapService.rejectSwapRequest('req_1');
    await swapService.cancelSwapRequest('req_1');

    expect(fetchSpy).toHaveBeenNthCalledWith(1, '/api/swaps/requests', expect.objectContaining({ method: 'POST' }));
    expect(fetchSpy).toHaveBeenNthCalledWith(2, '/api/swaps/requests/req_1/accept', expect.objectContaining({ method: 'POST' }));
    expect(fetchSpy).toHaveBeenNthCalledWith(3, '/api/swaps/requests/req_1/reject', expect.objectContaining({ method: 'POST' }));
    expect(fetchSpy).toHaveBeenNthCalledWith(4, '/api/swaps/requests/req_1/cancel', expect.objectContaining({ method: 'POST' }));
  });
});

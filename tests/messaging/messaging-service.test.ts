import { describe, it, expect } from 'vitest';
import { messagingService } from '../../src/features/messaging/services/messagingService';
import { createMockFetch, mockConversations, mockFetchResponse, mockMessages } from '../helpers/testUtils';

describe('messagingService', () => {
  it('fetches conversations and conversation messages', async () => {
    const fetchSpy = createMockFetch((url) => {
      if (url === '/api/conversations') return mockFetchResponse({ conversations: mockConversations });
      return mockFetchResponse({ messages: mockMessages });
    });

    const convRes = await messagingService.getConversations();
    expect(convRes.conversations).toHaveLength(1);

    const msgRes = await messagingService.getMessages('conv_1');
    expect(msgRes.messages).toHaveLength(2);
    expect(fetchSpy).toHaveBeenCalledWith('/api/conversations/conv_1/messages', expect.any(Object));
  });

  it('sends text and optional meeting info via POST', async () => {
    const fetchSpy = createMockFetch(() => mockFetchResponse({ message: mockMessages[1] }));

    await messagingService.sendMessage('conv_1', 'Join here', {
      provider: 'Google Meet',
      url: 'https://meet.google.com/abc-defg-hij'
    });

    expect(fetchSpy).toHaveBeenCalledWith(
      '/api/conversations/conv_1/messages',
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('Google Meet')
      })
    );
  });
});

import { describe, it, expect } from 'vitest';
import { notificationService } from '../../src/features/notifications/services/notificationService';
import { createMockFetch, mockFetchResponse, mockNotifications } from '../helpers/testUtils';

describe('notificationService', () => {
  it('fetches notifications from GET /api/notifications', async () => {
    createMockFetch(() => mockFetchResponse({ notifications: mockNotifications }));
    const res = await notificationService.getNotifications();
    expect(res.notifications).toHaveLength(2);
    expect(res.notifications[0].read).toBe(false);
  });

  it('marks all notifications read via PUT /api/notifications/read-all', async () => {
    const fetchSpy = createMockFetch(() => mockFetchResponse({ message: 'All read' }));
    const res = await notificationService.markNotificationsRead();
    expect(res.message).toBe('All read');
    expect(fetchSpy).toHaveBeenCalledWith(
      '/api/notifications/read-all',
      expect.objectContaining({ method: 'PUT' })
    );
  });
});

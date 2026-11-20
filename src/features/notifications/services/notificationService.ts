import { request } from '../../../services/apiClient';
import { NotificationItem } from '../../../types';

export const notificationService = {
  getNotifications: () => request<{ notifications: NotificationItem[] }>('/api/notifications'),

  markNotificationsRead: () =>
    request<{ message: string }>('/api/notifications/read-all', { method: 'PUT' })
};

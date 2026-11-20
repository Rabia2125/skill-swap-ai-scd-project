import { request } from '../../../services/apiClient';

export const settingsService = {
  updatePassword: (currentPassword: string, newPassword: string) =>
    request<{ message: string }>('/api/settings/password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword })
    })
};

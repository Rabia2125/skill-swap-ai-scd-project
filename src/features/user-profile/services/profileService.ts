import { request } from '../../../services/apiClient';
import { User } from '../../../types';
import { UpdateProfilePayload } from '../types';

export const profileService = {
  updateProfile: (profileData: UpdateProfilePayload) =>
    request<{ message: string; user: User }>('/api/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    }),

  getUserById: (id: string) => request<{ user: User }>(`/api/users/${id}`)
};

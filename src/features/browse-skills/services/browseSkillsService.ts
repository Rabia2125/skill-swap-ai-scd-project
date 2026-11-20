import { request } from '../../../services/apiClient';
import { User } from '../../../types';
import { BrowseUsersParams, CategoryCount } from '../types';

export const browseSkillsService = {
  getUsers: (params?: BrowseUsersParams) => {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.category) query.set('category', params.category);
    if (params?.level) query.set('level', params.level);
    if (params?.location) query.set('location', params.location);
    const qs = query.toString();
    return request<{ users: User[]; count: number }>(`/api/users${qs ? `?${qs}` : ''}`);
  },

  getCategories: () => request<{ categories: CategoryCount[] }>('/api/skills/categories')
};

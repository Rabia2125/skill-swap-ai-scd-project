import { describe, it, expect } from 'vitest';
import { browseSkillsService } from '../../src/features/browse-skills/services/browseSkillsService';
import { createMockFetch, mockFetchResponse, mockUserAlex } from '../helpers/testUtils';

describe('browseSkillsService', () => {
  it('builds query string for search, category, level, and location', async () => {
    const fetchSpy = createMockFetch(() => mockFetchResponse({ users: [mockUserAlex], count: 1 }));

    const res = await browseSkillsService.getUsers({
      search: 'React',
      category: 'Programming',
      level: 'Expert',
      location: 'San Francisco'
    });

    expect(res.count).toBe(1);
    expect(fetchSpy).toHaveBeenCalledWith(
      '/api/users?search=React&category=Programming&level=Expert&location=San+Francisco',
      expect.any(Object)
    );
  });

  it('calls GET /api/users without query string when no params passed', async () => {
    const fetchSpy = createMockFetch(() => mockFetchResponse({ users: [], count: 0 }));
    await browseSkillsService.getUsers();
    expect(fetchSpy).toHaveBeenCalledWith('/api/users', expect.any(Object));
  });

  it('fetches public categories from GET /api/skills/categories', async () => {
    createMockFetch(() =>
      mockFetchResponse({ categories: [{ name: 'Programming', count: 5 }] })
    );
    const res = await browseSkillsService.getCategories();
    expect(res.categories).toHaveLength(1);
    expect(res.categories[0].name).toBe('Programming');
  });
});

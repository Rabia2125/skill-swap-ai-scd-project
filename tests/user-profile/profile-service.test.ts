import { describe, it, expect } from 'vitest';
import { profileService } from '../../src/features/user-profile/services/profileService';
import { createMockFetch, mockFetchResponse, mockUserAlex, mockUserMaya } from '../helpers/testUtils';

describe('profileService', () => {
  it('sends PUT /api/profile with updated profile fields', async () => {
    const fetchSpy = createMockFetch(() =>
      mockFetchResponse({ message: 'Profile saved', user: mockUserAlex })
    );

    const res = await profileService.updateProfile({ title: 'Staff Engineer', bio: 'Updated bio' });
    expect(res.message).toBe('Profile saved');
    expect(fetchSpy).toHaveBeenCalledWith(
      '/api/profile',
      expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify({ title: 'Staff Engineer', bio: 'Updated bio' })
      })
    );
  });

  it('fetches public peer profile via GET /api/users/:id', async () => {
    createMockFetch(() => mockFetchResponse({ user: mockUserMaya }));
    const res = await profileService.getUserById('user_maya');
    expect(res.user.name).toBe('Maya Lin');
  });

  it('propagates 404 error when peer user is not found', async () => {
    createMockFetch(() => mockFetchResponse({ error: 'User not found' }, false, 404));
    await expect(profileService.getUserById('missing_id')).rejects.toThrow('User not found');
  });
});

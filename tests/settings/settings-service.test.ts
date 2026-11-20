import { describe, it, expect } from 'vitest';
import { settingsService } from '../../src/features/settings/services/settingsService';
import { createMockFetch, mockFetchResponse } from '../helpers/testUtils';

describe('settingsService', () => {
  it('sends PUT /api/settings/password with current and new password', async () => {
    const fetchSpy = createMockFetch(() =>
      mockFetchResponse({ message: 'Password changed' })
    );

    const res = await settingsService.updatePassword('old123', 'new456');
    expect(res.message).toBe('Password changed');
    expect(fetchSpy).toHaveBeenCalledWith(
      '/api/settings/password',
      expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify({ currentPassword: 'old123', newPassword: 'new456' })
      })
    );
  });

  it('throws error when current password is incorrect (400)', async () => {
    createMockFetch(() => mockFetchResponse({ error: 'Current password is incorrect' }, false, 400));
    await expect(settingsService.updatePassword('wrong', 'new456')).rejects.toThrow(
      'Current password is incorrect'
    );
  });
});

import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SettingsPage } from '../../src/features/settings/pages/SettingsPage';
import { AuthProvider } from '../../src/context/AuthContext';
import { setStoredAuth, getStoredToken } from '../../src/services/apiClient';
import { createMockFetch, mockFetchResponse, mockUserAlex } from '../helpers/testUtils';

describe('Settings Feature (SettingsPage)', () => {
  it('displays account info, updates password on valid submission, and toggles preferences', async () => {
    const user = userEvent.setup();
    setStoredAuth('jwt_alex', mockUserAlex);

    const fetchSpy = createMockFetch((url, init) => {
      if (url === '/api/auth/me') return mockFetchResponse({ user: mockUserAlex });
      if (url === '/api/settings/password' && init?.method === 'PUT') {
        return mockFetchResponse({ message: 'Password updated successfully.' });
      }
      return mockFetchResponse({});
    });

    render(
      <AuthProvider>
        <SettingsPage />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByText('Alex Rivera')).toBeInTheDocument());
    expect(screen.getByText('alex.rivera@example.com')).toBeInTheDocument();

    await user.type(screen.getByLabelText('Current Password'), 'password123');
    await user.type(screen.getByLabelText('New Password'), 'newsecure123');
    await user.type(screen.getByLabelText('Confirm New Password'), 'newsecure123');
    await user.click(screen.getByRole('button', { name: /update password/i }));

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent('Password updated successfully.');
    });

    const emailCheckbox = screen.getByLabelText(/email notifications for swap requests/i) as HTMLInputElement;
    expect(emailCheckbox.checked).toBe(true);
    await user.click(emailCheckbox);
    expect(emailCheckbox.checked).toBe(false);

    expect(fetchSpy).toHaveBeenCalledWith(
      '/api/settings/password',
      expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify({ currentPassword: 'password123', newPassword: 'newsecure123' })
      })
    );
  });

  it('rejects mismatched new passwords and short password (< 6 chars)', async () => {
    const user = userEvent.setup();
    setStoredAuth('jwt_alex', mockUserAlex);
    createMockFetch(() => mockFetchResponse({ user: mockUserAlex }));

    render(
      <AuthProvider>
        <SettingsPage />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByText('Alex Rivera')).toBeInTheDocument());

    await user.type(screen.getByLabelText('Current Password'), 'password123');
    await user.type(screen.getByLabelText('New Password'), 'abcdef');
    await user.type(screen.getByLabelText('Confirm New Password'), 'xyz123');
    await user.click(screen.getByRole('button', { name: /update password/i }));

    expect(screen.getByRole('alert')).toHaveTextContent('New passwords do not match.');

    await user.clear(screen.getByLabelText('New Password'));
    await user.clear(screen.getByLabelText('Confirm New Password'));
    await user.type(screen.getByLabelText('New Password'), '12345');
    await user.type(screen.getByLabelText('Confirm New Password'), '12345');
    await user.click(screen.getByRole('button', { name: /update password/i }));

    expect(screen.getByRole('alert')).toHaveTextContent(
      'New password must be at least 6 characters.'
    );
  });

  it('signs out and clears stored token when Sign Out is clicked', async () => {
    const user = userEvent.setup();
    setStoredAuth('jwt_alex', mockUserAlex);
    createMockFetch(() => mockFetchResponse({ user: mockUserAlex }));

    render(
      <AuthProvider>
        <SettingsPage />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByText('Alex Rivera')).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: /sign out/i }));
    expect(getStoredToken()).toBeNull();
  });
});

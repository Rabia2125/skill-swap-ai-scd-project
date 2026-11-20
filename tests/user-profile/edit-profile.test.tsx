import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProfilePage } from '../../src/features/user-profile/pages/ProfilePage';
import { AuthProvider } from '../../src/context/AuthContext';
import { setStoredAuth } from '../../src/services/apiClient';
import { createMockFetch, mockFetchResponse, mockUserAlex } from '../helpers/testUtils';

describe('Edit Profile Flow (ProfilePage)', () => {
  it('updates profile fields, calls PUT /api/profile, and displays success banner', async () => {
    const user = userEvent.setup();
    const updatedUser = {
      ...mockUserAlex,
      name: 'Alex Rivera Jr.',
      profile: { ...mockUserAlex.profile, title: 'Principal Architect' }
    };

    setStoredAuth('jwt_alex', mockUserAlex);
    const fetchSpy = createMockFetch((url, init) => {
      if (url === '/api/auth/me') return mockFetchResponse({ user: mockUserAlex });
      if (url === '/api/profile' && init?.method === 'PUT') {
        return mockFetchResponse({ message: 'Updated', user: updatedUser });
      }
      return mockFetchResponse({});
    });

    render(
      <AuthProvider>
        <ProfilePage />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByText('Alex Rivera')).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: /edit profile/i }));

    const nameInput = screen.getByLabelText('Full Name');
    const titleInput = screen.getByLabelText('Headline / Professional Title');
    await user.clear(nameInput);
    await user.type(nameInput, 'Alex Rivera Jr.');
    await user.clear(titleInput);
    await user.type(titleInput, 'Principal Architect');

    await user.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent(
        'Profile updated and synchronized with Browse Skills!'
      );
    });
    expect(screen.getByText('Alex Rivera Jr.')).toBeInTheDocument();
    expect(screen.getByText('Principal Architect')).toBeInTheDocument();
    expect(fetchSpy).toHaveBeenCalledWith('/api/profile', expect.objectContaining({ method: 'PUT' }));
  });

  it('displays error message when saving profile fails on server', async () => {
    const user = userEvent.setup();
    setStoredAuth('jwt_alex', mockUserAlex);
    createMockFetch((url, init) => {
      if (url === '/api/auth/me') return mockFetchResponse({ user: mockUserAlex });
      if (url === '/api/profile' && init?.method === 'PUT') {
        return mockFetchResponse({ error: 'Database write failed' }, false, 500);
      }
      return mockFetchResponse({});
    });

    render(
      <AuthProvider>
        <ProfilePage />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByText('Alex Rivera')).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: /edit profile/i }));
    await user.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent('Database write failed');
    });
  });
});

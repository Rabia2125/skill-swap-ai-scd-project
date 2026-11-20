import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from '../../src/context/AuthContext';
import { setStoredAuth, getStoredToken } from '../../src/services/apiClient';
import { createMockFetch, mockFetchResponse, mockUserAlex } from '../helpers/testUtils';

function AuthConsumerProbe() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  return (
    <div>
      <span data-testid="loading">{String(isLoading)}</span>
      <span data-testid="authenticated">{String(isAuthenticated)}</span>
      <span data-testid="user-name">{user?.name || 'guest'}</span>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

describe('AuthContext & Session Management', () => {
  it('restores authenticated user when stored token validates via /api/auth/me', async () => {
    setStoredAuth('valid_token', mockUserAlex);
    createMockFetch(() => mockFetchResponse({ user: mockUserAlex }));

    render(
      <AuthProvider>
        <AuthConsumerProbe />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });
    expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
    expect(screen.getByTestId('user-name')).toHaveTextContent('Alex Rivera');
  });

  it('clears stored auth when /api/auth/me rejects expired token', async () => {
    setStoredAuth('expired_token', mockUserAlex);
    createMockFetch(() => mockFetchResponse({ error: 'Token expired' }, false, 401));

    render(
      <AuthProvider>
        <AuthConsumerProbe />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });
    expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
    expect(screen.getByTestId('user-name')).toHaveTextContent('guest');
    expect(getStoredToken()).toBeNull();
  });

  it('logs out user and removes token from localStorage', async () => {
    const user = userEvent.setup();
    setStoredAuth('valid_token', mockUserAlex);
    createMockFetch(() => mockFetchResponse({ user: mockUserAlex }));

    render(
      <AuthProvider>
        <AuthConsumerProbe />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
    });

    await user.click(screen.getByText('Logout'));

    expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
    expect(getStoredToken()).toBeNull();
  });

  it('throws an error if useAuth is called outside AuthProvider', () => {
    const BrokenComponent = () => {
      useAuth();
      return null;
    };

    expect(() => render(<BrokenComponent />)).toThrow('useAuth must be used within an AuthProvider');
  });
});

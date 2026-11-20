import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthModal } from '../../src/features/authentication/components/AuthModal';
import { AuthProvider, useAuth } from '../../src/context/AuthContext';
import { createMockFetch, mockFetchResponse, mockUserAlex } from '../helpers/testUtils';

function AuthModalLauncher({ initialTab = 'login' as const }: { initialTab?: 'login' | 'register' }) {
  const { openAuthModal, user } = useAuth();
  return (
    <div>
      <button onClick={() => openAuthModal('Sign in to continue', initialTab)}>Open Modal</button>
      {user && <span data-testid="logged-in-user">{user.name}</span>}
      <AuthModal />
    </div>
  );
}

describe('Login Feature (AuthModal)', () => {
  it('submits valid credentials and authenticates the user', async () => {
    const user = userEvent.setup();
    const fetchSpy = createMockFetch((url) => {
      if (url === '/api/auth/login') {
        return mockFetchResponse({ token: 'jwt_123', user: mockUserAlex, message: 'Signed in' });
      }
      return mockFetchResponse({});
    });

    render(
      <AuthProvider>
        <AuthModalLauncher />
      </AuthProvider>
    );

    await user.click(screen.getByText('Open Modal'));
    await user.type(screen.getByLabelText('Email Address'), 'alex.rivera@example.com');
    await user.type(screen.getByLabelText('Password'), 'password123');

    // Note: tab switcher also has "Sign In"; click submit button inside form
    const signInButtons = screen.getAllByRole('button', { name: /sign in/i });
    await user.click(signInButtons[signInButtons.length - 1]);

    await waitFor(() => {
      expect(screen.getByTestId('logged-in-user')).toHaveTextContent('Alex Rivera');
    });
    expect(fetchSpy).toHaveBeenCalledWith(
      '/api/auth/login',
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('shows validation error when email or password is empty', async () => {
    const user = userEvent.setup();
    render(
      <AuthProvider>
        <AuthModalLauncher />
      </AuthProvider>
    );

    await user.click(screen.getByText('Open Modal'));
    const signInButtons = screen.getAllByRole('button', { name: /sign in/i });
    await user.click(signInButtons[signInButtons.length - 1]);

    expect(screen.getByRole('alert')).toHaveTextContent('Please provide both email and password.');
  });

  it('displays server error message when credentials are rejected (401)', async () => {
    const user = userEvent.setup();
    createMockFetch(() => mockFetchResponse({ error: 'Invalid email or password' }, false, 401));

    render(
      <AuthProvider>
        <AuthModalLauncher />
      </AuthProvider>
    );

    await user.click(screen.getByText('Open Modal'));
    await user.type(screen.getByLabelText('Email Address'), 'alex.rivera@example.com');
    await user.type(screen.getByLabelText('Password'), 'wrongpass');
    const signInButtons = screen.getAllByRole('button', { name: /sign in/i });
    await user.click(signInButtons[signInButtons.length - 1]);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Invalid email or password');
    });
  });

  it('supports 1-click demo login for Alex Rivera', async () => {
    const user = userEvent.setup();
    const fetchSpy = createMockFetch(() =>
      mockFetchResponse({ token: 'demo_jwt', user: mockUserAlex, message: 'OK' })
    );

    render(
      <AuthProvider>
        <AuthModalLauncher />
      </AuthProvider>
    );

    await user.click(screen.getByText('Open Modal'));
    await user.click(screen.getByText('Alex Rivera'));

    await waitFor(() => {
      expect(screen.getByTestId('logged-in-user')).toHaveTextContent('Alex Rivera');
    });
    expect(fetchSpy).toHaveBeenCalledWith(
      '/api/auth/login',
      expect.objectContaining({
        body: JSON.stringify({ email: 'alex.rivera@example.com', password: 'password123' })
      })
    );
  });

  it('closes the modal when close button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <AuthProvider>
        <AuthModalLauncher />
      </AuthProvider>
    );

    await user.click(screen.getByText('Open Modal'));
    expect(screen.getByText('Welcome Back')).toBeInTheDocument();

    await user.click(screen.getByLabelText('Close authentication modal'));
    expect(screen.queryByText('Welcome Back')).not.toBeInTheDocument();
  });
});

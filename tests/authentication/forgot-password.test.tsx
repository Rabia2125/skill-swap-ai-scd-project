import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthModal } from '../../src/features/authentication/components/AuthModal';
import { AuthProvider, useAuth } from '../../src/context/AuthContext';
import { createMockFetch, mockFetchResponse } from '../helpers/testUtils';

function ForgotLauncher() {
  const { openAuthModal } = useAuth();
  return (
    <div>
      <button onClick={() => openAuthModal('Login', 'login')}>Open Auth</button>
      <AuthModal />
    </div>
  );
}

describe('Forgot Password Feature (AuthModal)', () => {
  it('submits reset request and renders confirmation with dev token', async () => {
    const user = userEvent.setup();
    createMockFetch(() =>
      mockFetchResponse({
        message: 'Password reset instructions generated.',
        devResetToken: 'reset_token_abcdef1234567890'
      })
    );

    render(
      <AuthProvider>
        <ForgotLauncher />
      </AuthProvider>
    );

    await user.click(screen.getByText('Open Auth'));
    await user.click(screen.getByText('Forgot password?'));
    expect(screen.getByText('Reset Password')).toBeInTheDocument();

    await user.type(screen.getByLabelText('Email Address'), 'alex.rivera@example.com');
    await user.click(screen.getByRole('button', { name: /send password reset token/i }));

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent('Password reset instructions generated.');
      expect(screen.getByRole('status')).toHaveTextContent('reset_token_abcd');
    });
  });

  it('validates that an email is entered before requesting reset', async () => {
    const user = userEvent.setup();
    render(
      <AuthProvider>
        <ForgotLauncher />
      </AuthProvider>
    );

    await user.click(screen.getByText('Open Auth'));
    await user.click(screen.getByText('Forgot password?'));
    await user.click(screen.getByRole('button', { name: /send password reset token/i }));

    expect(screen.getByRole('alert')).toHaveTextContent('Please enter your email address.');
  });

  it('displays server error when reset request fails', async () => {
    const user = userEvent.setup();
    createMockFetch(() => mockFetchResponse({ error: 'Account not found' }, false, 404));

    render(
      <AuthProvider>
        <ForgotLauncher />
      </AuthProvider>
    );

    await user.click(screen.getByText('Open Auth'));
    await user.click(screen.getByText('Forgot password?'));
    await user.type(screen.getByLabelText('Email Address'), 'unknown@example.com');
    await user.click(screen.getByRole('button', { name: /send password reset token/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Account not found');
    });
  });

  it('navigates back to Sign In when clicking Back to Sign In', async () => {
    const user = userEvent.setup();
    render(
      <AuthProvider>
        <ForgotLauncher />
      </AuthProvider>
    );

    await user.click(screen.getByText('Open Auth'));
    await user.click(screen.getByText('Forgot password?'));
    await user.click(screen.getByRole('button', { name: /back to sign in/i }));

    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
  });
});

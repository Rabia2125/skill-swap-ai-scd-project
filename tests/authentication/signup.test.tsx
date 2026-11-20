import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthModal } from '../../src/features/authentication/components/AuthModal';
import { AuthProvider, useAuth } from '../../src/context/AuthContext';
import { createMockFetch, mockFetchResponse, mockUserAlex } from '../helpers/testUtils';

function RegisterLauncher() {
  const { openAuthModal, user } = useAuth();
  return (
    <div>
      <button onClick={() => openAuthModal('Join SkillSwap', 'register')}>Open Register</button>
      {user && <span data-testid="registered-user">{user.name}</span>}
      <AuthModal />
    </div>
  );
}

describe('Signup Feature (AuthModal)', () => {
  it('registers a new user when all fields are valid and terms are accepted', async () => {
    const user = userEvent.setup();
    const fetchSpy = createMockFetch(() =>
      mockFetchResponse({ token: 'new_jwt', user: mockUserAlex, message: 'Created' }, true, 201)
    );

    render(
      <AuthProvider>
        <RegisterLauncher />
      </AuthProvider>
    );

    await user.click(screen.getByText('Open Register'));
    await user.type(screen.getByLabelText('Full Name'), 'Alex Rivera');
    await user.type(screen.getByLabelText('Email Address'), 'alex.rivera@example.com');
    await user.type(screen.getByLabelText('Location'), 'San Francisco, CA');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.type(screen.getByLabelText('Confirm'), 'password123');
    await user.click(screen.getByRole('checkbox'));
    await user.click(screen.getByRole('button', { name: /create free account/i }));

    await waitFor(() => {
      expect(screen.getByTestId('registered-user')).toHaveTextContent('Alex Rivera');
    });
    expect(fetchSpy).toHaveBeenCalledWith(
      '/api/auth/register',
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('validates required fields before calling API', async () => {
    const user = userEvent.setup();
    const fetchSpy = createMockFetch(() => mockFetchResponse({}));

    render(
      <AuthProvider>
        <RegisterLauncher />
      </AuthProvider>
    );

    await user.click(screen.getByText('Open Register'));
    await user.click(screen.getByRole('button', { name: /create free account/i }));

    expect(screen.getByRole('alert')).toHaveTextContent('Please fill in all required fields.');
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('rejects mismatched password and confirm password', async () => {
    const user = userEvent.setup();
    render(
      <AuthProvider>
        <RegisterLauncher />
      </AuthProvider>
    );

    await user.click(screen.getByText('Open Register'));
    await user.type(screen.getByLabelText('Full Name'), 'Jane Doe');
    await user.type(screen.getByLabelText('Email Address'), 'jane@example.com');
    await user.type(screen.getByLabelText('Location'), 'Austin, TX');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.type(screen.getByLabelText('Confirm'), 'different123');
    await user.click(screen.getByRole('button', { name: /create free account/i }));

    expect(screen.getByRole('alert')).toHaveTextContent('Passwords do not match.');
  });

  it('enforces minimum password length boundary (< 6 chars)', async () => {
    const user = userEvent.setup();
    render(
      <AuthProvider>
        <RegisterLauncher />
      </AuthProvider>
    );

    await user.click(screen.getByText('Open Register'));
    await user.type(screen.getByLabelText('Full Name'), 'Jane Doe');
    await user.type(screen.getByLabelText('Email Address'), 'jane@example.com');
    await user.type(screen.getByLabelText('Location'), 'Austin, TX');
    await user.type(screen.getByLabelText('Password'), '12345');
    await user.type(screen.getByLabelText('Confirm'), '12345');
    await user.click(screen.getByRole('button', { name: /create free account/i }));

    expect(screen.getByRole('alert')).toHaveTextContent('Password must be at least 6 characters.');
  });

  it('requires accepting Terms and Conditions checkbox', async () => {
    const user = userEvent.setup();
    render(
      <AuthProvider>
        <RegisterLauncher />
      </AuthProvider>
    );

    await user.click(screen.getByText('Open Register'));
    await user.type(screen.getByLabelText('Full Name'), 'Jane Doe');
    await user.type(screen.getByLabelText('Email Address'), 'jane@example.com');
    await user.type(screen.getByLabelText('Location'), 'Austin, TX');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.type(screen.getByLabelText('Confirm'), 'password123');
    await user.click(screen.getByRole('button', { name: /create free account/i }));

    expect(screen.getByRole('alert')).toHaveTextContent(
      'You must accept the Terms and Conditions to create an account.'
    );
  });

  it('shows server error when registering with an existing email (409)', async () => {
    const user = userEvent.setup();
    createMockFetch(() => mockFetchResponse({ error: 'Email is already registered' }, false, 409));

    render(
      <AuthProvider>
        <RegisterLauncher />
      </AuthProvider>
    );

    await user.click(screen.getByText('Open Register'));
    await user.type(screen.getByLabelText('Full Name'), 'Alex');
    await user.type(screen.getByLabelText('Email Address'), 'alex.rivera@example.com');
    await user.type(screen.getByLabelText('Location'), 'SF');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.type(screen.getByLabelText('Confirm'), 'password123');
    await user.click(screen.getByRole('checkbox'));
    await user.click(screen.getByRole('button', { name: /create free account/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Email is already registered');
    });
  });
});

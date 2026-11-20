import { describe, it, expect } from 'vitest';
import { authService } from '../../src/features/authentication/services/authService';
import { setStoredAuth } from '../../src/services/apiClient';
import { createMockFetch, mockFetchResponse, mockUserAlex } from '../helpers/testUtils';

describe('authService', () => {
  it('calls POST /api/auth/register with registration payload', async () => {
    const fetchSpy = createMockFetch(() =>
      mockFetchResponse({ token: 'tok', user: mockUserAlex, message: 'OK' }, true, 201)
    );

    const res = await authService.register({
      name: 'Alex Rivera',
      email: 'alex@example.com',
      password: 'password123',
      location: 'San Francisco'
    });

    expect(res.token).toBe('tok');
    expect(fetchSpy).toHaveBeenCalledWith(
      '/api/auth/register',
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('calls POST /api/auth/login and returns token and user', async () => {
    createMockFetch(() =>
      mockFetchResponse({ token: 'login_tok', user: mockUserAlex, message: 'Welcome' })
    );

    const res = await authService.login({ email: 'alex@example.com', password: 'password123' });
    expect(res.user.id).toBe('user_alex');
    expect(res.token).toBe('login_tok');
  });

  it('attaches Bearer token header on getMe when stored in localStorage', async () => {
    setStoredAuth('stored_jwt_abc', mockUserAlex);
    const fetchSpy = createMockFetch(() => mockFetchResponse({ user: mockUserAlex }));

    const res = await authService.getMe();
    expect(res.user.email).toBe('alex.rivera@example.com');

    const [, options] = fetchSpy.mock.calls[0];
    const headers = options?.headers as Headers;
    expect(headers.get('Authorization')).toBe('Bearer stored_jwt_abc');
  });

  it('throws descriptive error when API responds with 401', async () => {
    createMockFetch(() => mockFetchResponse({ error: 'Unauthorized access' }, false, 401));

    await expect(
      authService.login({ email: 'alex@example.com', password: 'bad' })
    ).rejects.toThrow('Unauthorized access');
  });

  it('calls POST /api/auth/forgot-password with email', async () => {
    const fetchSpy = createMockFetch(() =>
      mockFetchResponse({ message: 'Reset link sent', devResetToken: 'abc' })
    );

    const res = await authService.forgotPassword('alex@example.com');
    expect(res.message).toBe('Reset link sent');
    expect(fetchSpy).toHaveBeenCalledWith(
      '/api/auth/forgot-password',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ email: 'alex@example.com' })
      })
    );
  });
});

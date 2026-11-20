import { request } from '../../../services/apiClient';
import { User } from '../../../types';
import {
  AuthResponse,
  ForgotPasswordResponse,
  LoginCredentials,
  RegisterPayload
} from '../types';

export const authService = {
  register: (body: RegisterPayload) =>
    request<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(body)
    }),

  login: (body: LoginCredentials) =>
    request<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(body)
    }),

  getMe: () => request<{ user: User }>('/api/auth/me'),

  forgotPassword: (email: string) =>
    request<ForgotPasswordResponse>('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    })
};

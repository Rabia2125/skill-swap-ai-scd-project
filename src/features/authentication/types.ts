import { User } from '../../types';

export type AuthTab = 'login' | 'register' | 'forgot';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  location: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  message: string;
}

export interface ForgotPasswordResponse {
  message: string;
  devResetToken?: string;
  instructions?: string;
}

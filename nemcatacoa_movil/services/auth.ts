import { request } from '@/services/http';

export interface AuthResponse {
  token: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload extends LoginPayload {
  nombres: string;
  apellidos: string;
}

export const login = (payload: LoginPayload) =>
  request<AuthResponse>('/auth/login', { method: 'POST', body: payload });

export const register = (payload: RegisterPayload) =>
  request<AuthResponse>('/auth/register', { method: 'POST', body: payload });

export const forgotPassword = (email: string) =>
  request<{ message: string }>('/auth/forgot-password', {
    method: 'POST',
    body: { email },
  });

export const resetPassword = (token: string, password: string) =>
  request<{ message: string }>('/auth/reset-password', {
    method: 'POST',
    body: { token, password },
  });

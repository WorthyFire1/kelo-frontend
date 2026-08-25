import { apiRequest } from '@/api/client';

interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

interface RegisterCredentials {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  accessToken: string;
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
}

export const authService = {
  register(credentials: RegisterCredentials): Promise<AuthResponse> {
    return apiRequest<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  login(credentials: LoginCredentials): Promise<AuthResponse> {
    return apiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ ...credentials, rememberMe: credentials.rememberMe ?? false }),
    });
  },
};

import api from '@/lib/api';
import { User, ApiResponse } from '@/types';

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export const authService = {
  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    const { data } = await api.post<ApiResponse<AuthResponse>>(
      '/auth/register',
      payload
    );
    return data.data!;
  },

  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const { data } = await api.post<ApiResponse<AuthResponse>>(
      '/auth/login',
      payload
    );
    return data.data!;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },

  getMe: async (): Promise<User> => {
    const { data } = await api.get<ApiResponse<{ user: User }>>('/auth/me');
    return data.data!.user;
  },

  updateProfile: async (payload: {
    name?: string;
    avatar?: string;
  }): Promise<User> => {
    const { data } = await api.patch<ApiResponse<{ user: User }>>(
      '/auth/profile',
      payload
    );
    return data.data!.user;
  },

  changePassword: async (payload: {
    currentPassword: string;
    newPassword: string;
  }): Promise<void> => {
    await api.patch('/auth/change-password', payload);
  },
};
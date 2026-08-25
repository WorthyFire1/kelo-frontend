import { apiRequest } from '@/api/client';

export interface UserProfile {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  createdAt: string;
  lastLoginAt: string | null;
}

export interface UpdateUserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export const userService = {
  getProfile(): Promise<UserProfile> {
    return apiRequest<UserProfile>('/user/profile');
  },

  updateProfile(profile: UpdateUserProfile): Promise<{ message: string }> {
    return apiRequest<{ message: string }>('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(profile),
    });
  },
};

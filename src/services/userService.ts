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

export interface UserStats {
  ordersCount: number;
  wishlistCount: number;
  reviewsCount: number;
  totalSpent: number;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
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

  getStats(): Promise<UserStats> {
    return apiRequest<UserStats>('/user/stats');
  },

  changePassword(request: ChangePasswordRequest): Promise<{ message: string }> {
    return apiRequest<{ message: string }>('/user/change-password', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },
};

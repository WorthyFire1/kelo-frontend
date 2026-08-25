import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authTokenStorage } from '@/lib/authTokenStorage';
import { getJwtRoles } from '@/lib/jwt';
import type { AuthResponse } from '@/services/authService';

export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  phone?: string;
  roles: string[];
  isAdmin: boolean;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  setSession: (response: AuthResponse) => void;
  updateUser: (profile: Pick<AuthUser, 'firstName' | 'lastName' | 'email' | 'phone'>) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setSession: (response) => {
        const roles = getJwtRoles(response.accessToken);
        const name = `${response.firstName ?? ''} ${response.lastName ?? ''}`.trim() || response.email;

        authTokenStorage.set(response.accessToken);
        set({
          token: response.accessToken,
          user: {
            id: response.userId,
            firstName: response.firstName ?? '',
            lastName: response.lastName ?? '',
            name,
            email: response.email,
            phone: '',
            roles,
            isAdmin: roles.some((role) => role.toLocaleLowerCase() === 'admin'),
          },
        });
      },
      updateUser: (profile) => set((state) => {
        if (!state.user) return state;

        const name = `${profile.firstName} ${profile.lastName}`.trim() || profile.email;
        return { user: { ...state.user, ...profile, name } };
      }),
      logout: () => {
        authTokenStorage.remove();
        set({ user: null, token: null });
      },
    }),
    { name: 'kelo-auth', version: 2 },
  ),
);

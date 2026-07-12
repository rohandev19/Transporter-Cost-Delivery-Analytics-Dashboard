import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, UserRole } from '../types/auth';
import { ROLE_PERMISSIONS } from '../constants/roles';
import { nanoid } from 'nanoid';

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  login: (role: UserRole, name: string, email: string) => void;
  logout: () => void;
  hasPermission: (permission: keyof typeof ROLE_PERMISSIONS.admin) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,

      login: (role, name, email) => {
        const user: User = {
          id: nanoid(),
          name,
          email,
          role,
        };
        set({ isAuthenticated: true, user });
      },

      logout: () => {
        set({ isAuthenticated: false, user: null });
      },

      hasPermission: (permission) => {
        const { user } = get();
        if (!user) return false;
        return ROLE_PERMISSIONS[user.role][permission];
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);

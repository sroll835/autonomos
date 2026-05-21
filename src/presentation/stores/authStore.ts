import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../../domain/entities/User';
import { RegisterDTO } from '../../domain/repositories/IAuthRepository';
import { container } from '../../di/container';

const authRepo = container.repos.auth;

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

interface AuthActions {
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterDTO) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

/** Store de autenticación con persistencia */
export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set) => ({
      user: null,
      isLoading: false,
      error: null,
      isAuthenticated: false,

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const { user } = await authRepo.login(email, password);
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (e: unknown) {
          set({ error: (e as Error).message, isLoading: false });
          throw e;
        }
      },

      register: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const { user } = await authRepo.register(data);
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (e: unknown) {
          set({ error: (e as Error).message, isLoading: false });
          throw e;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await authRepo.logout();
        } finally {
          set({ user: null, isAuthenticated: false, isLoading: false, error: null });
        }
      },

      loadUser: async () => {
        set({ isLoading: true });
        try {
          const user = await authRepo.getCurrentUser();
          set({ user, isAuthenticated: !!user, isLoading: false });
        } catch {
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
      },

      updateUser: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const updated = await authRepo.updateProfile(data);
          set({ user: updated, isLoading: false });
        } catch (e: unknown) {
          set({ error: (e as Error).message, isLoading: false });
          throw e;
        }
      },

      clearError: () => set({ error: null }),
      reset: () => set({ user: null, isLoading: false, error: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);

import { create } from "zustand";
import { persist } from "zustand/middleware";
import * as authApi from "@/features/auth/api/authApi";
import type { Credenciales, Usuario } from "@/features/auth/types/auth.types";
import { queryClient } from "@/shared/api/queryClient";

interface AuthState {
  user: Usuario | null;
  checking: boolean;
  login: (credentials: Credenciales) => Promise<void>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
  clearSession: () => void;
}

let sessionCheck: Promise<void> | undefined;

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      checking: true,
      clearSession: () => {
        if (get().user) queryClient.clear();
        set({ user: null, checking: false });
      },
      login: async (credentials) => {
        await authApi.login(credentials);
        try {
          const user = await authApi.me();
          queryClient.clear();
          set({ user, checking: false });
        } catch (error) {
          get().clearSession();
          throw error;
        }
      },
      logout: async () => {
        await authApi.logout();
        get().clearSession();
      },
      checkSession: () => {
        if (sessionCheck) return sessionCheck;
        set({ checking: true });
        sessionCheck = authApi
          .me()
          .then((user) => {
            set({ user, checking: false });
          })
          .catch(() => get().clearSession())
          .finally(() => {
            sessionCheck = undefined;
          });
        return sessionCheck;
      },
    }),
    { name: "food-store-auth", partialize: ({ user }) => ({ user }) },
  ),
);

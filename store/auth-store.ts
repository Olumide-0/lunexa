import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type AuthUser = {
  id?: string;
  email: string;
  firstName?: string;
  lastName?: string;
};

type AuthView = "login" | "register" | "forgot" | "reset";

interface AuthState {
  isLoggedIn: boolean;
  user: AuthUser | null;
  authModal: AuthView | null; // which auth modal view is open, if any
  resetToken: string | null; // token from the reset email link (never saved)
  isLogoutModalOpen: boolean;
  logIn: (user: AuthUser) => void;
  logOut: () => void;
  checkSession: () => Promise<void>;
  openAuthModal: (view: AuthView) => void;
  openResetModal: (token: string) => void;
  closeAuthModal: () => void;
  openLogoutModal: () => void;
  closeLogoutModal: () => void;
}

// The REAL login is the secure httpOnly cookie on the server.
// This store only remembers who to show in the UI, and checkSession() keeps it honest.
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isLoggedIn: false,
      user: null,
      authModal: null,
      resetToken: null,
      isLogoutModalOpen: false,

      logIn: (user) => set({ isLoggedIn: true, user }),
      logOut: () => set({ isLoggedIn: false, user: null }),

      // Ask the server who is logged in (runs once when the site loads)
      checkSession: async () => {
        await useAuthStore.persist.rehydrate(); // load the cached name first
        try {
          const response = await fetch("/api/auth/me");
          if (response.status === 401) {
            set({ isLoggedIn: false, user: null }); // no valid cookie: not logged in
            return;
          }
          if (!response.ok) return; // server problem: keep showing the cached user
          const data: { user: AuthUser | null } = await response.json();
          if (data.user) set({ isLoggedIn: true, user: data.user });
        } catch {
          // Offline: keep the cached user for now
        }
      },

      openAuthModal: (view) => set({ authModal: view }),
      openResetModal: (token) => set({ authModal: "reset", resetToken: token }),
      closeAuthModal: () => set({ authModal: null, resetToken: null }),
      openLogoutModal: () => set({ isLogoutModalOpen: true }),
      closeLogoutModal: () => set({ isLogoutModalOpen: false }),
    }),
    {
      name: "lunexa-auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ isLoggedIn: state.isLoggedIn, user: state.user }),
      skipHydration: true, // loaded after the page mounts (see navbar)
    }
  )
);
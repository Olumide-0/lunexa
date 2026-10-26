import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type AuthUser = {
  email: string;
  firstName?: string;
  lastName?: string;
};

type AuthView = "login" | "register";

interface AuthState {
  isLoggedIn: boolean;
  user: AuthUser | null;
  authModal: AuthView | null;   // which auth modal is open, if any
  isLogoutModalOpen: boolean;
  logIn: (user: AuthUser) => void;
  logOut: () => void;
  openAuthModal: (view: AuthView) => void;
  closeAuthModal: () => void;
  openLogoutModal: () => void;
  closeLogoutModal: () => void;
}

// Temporary "fake" auth until the backend exists.
// Never store passwords here: only who is signed in.
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isLoggedIn: false,
      user: null,
      authModal: null,
      isLogoutModalOpen: false,

      logIn: (user) => set({ isLoggedIn: true, user }),
      logOut: () => set({ isLoggedIn: false, user: null }),

      openAuthModal: (view) => set({ authModal: view }),
      closeAuthModal: () => set({ authModal: null }),
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
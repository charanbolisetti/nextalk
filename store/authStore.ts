import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  _id: string;
  username: string;
  email: string;
  avatar: string;
  isOnline: boolean;
  lastSeen: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

const STORAGE_KEY = 'nextalk-auth';

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setAuth: (user, token) => set({ user, token }),
      logout: () => set({ user: null, token: null }),
      updateUser: (updated) => set((s) => ({ user: s.user ? { ...s.user, ...updated } : null })),
    }),
    { name: STORAGE_KEY }
  )
);

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key !== STORAGE_KEY) return;

    if (event.newValue === null) {
      useAuthStore.setState({ user: null, token: null });
      return;
    }

    try {
      const parsed = JSON.parse(event.newValue);
      const state = parsed?.state ?? parsed;
      useAuthStore.setState({
        user: state?.user ?? null,
        token: state?.token ?? null,
      });
    } catch (error) {
      console.error('Failed to sync auth state from storage event', error);
    }
  });
}

'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/lib/types';
import { USERS } from '@/lib/data/users';

interface AuthState {
  currentUser: User | null;
  login: (userId: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      currentUser: null, // default: logged out
      login: (userId: string) => {
        const user = USERS.find((u) => u.id === userId) ?? null;
        set({ currentUser: user });
      },
      logout: () => set({ currentUser: null }),
    }),
    { name: 'bd-auth' }
  )
);

"use client";

import { User } from "@supabase/supabase-js";
import { create } from "zustand";

interface AuthState {
  currentUser: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  currentUser: null,
  isLoading: true, // Start as loading until Supabase session is checked
  setUser: (user: User | null) => set({ currentUser: user }),
  setLoading: (loading: boolean) => set({ isLoading: loading }),
  logout: () => {
    // Sign out is handled by the component that calls this
    // (it calls supabase.auth.signOut() first, then this clears local state)
    set({ currentUser: null, isLoading: false });
  },
}));

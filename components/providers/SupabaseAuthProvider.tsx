"use client";

import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/authStore";
import { useEffect, useRef } from "react";

/**
 * SupabaseAuthProvider
 *
 * Subscribes to Supabase auth state changes and hydrates the Zustand auth store
 * with the user's profile data from the `public.profiles` table.
 *
 * Place this in app/layout.tsx to ensure auth state is available globally.
 */
export default function SupabaseAuthProvider({ children }: { children: React.ReactNode }) {
  const setUser = useAuthStore((s) => s.setUser);
  const setLoading = useAuthStore((s) => s.setLoading);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const supabase = createClient();

    // Check initial session
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    // Subscribe to auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setUser, setLoading]);

  return <>{children}</>;
}

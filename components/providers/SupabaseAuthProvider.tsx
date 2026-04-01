'use client';

import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/store/authStore';
import type { User } from '@/lib/types';
import { useEffect, useRef } from 'react';

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

    // Fetch profile and hydrate store
    async function loadUserProfile(authUserId: string, email: string) {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUserId)
        .single();

      if (error || !profile) {
        console.error('Failed to load user profile:', error?.message);
        setUser(null);
        setLoading(false);
        return;
      }

      const user = {
        id: profile.id,
        full_name: profile.full_name,
        email: profile.email || email,
        role: profile.role as 'admin' | 'bd',
        bd_member_id: profile.bd_member_id ?? null,
        avatar_initials: profile.avatar_initials || '',
      };

      setUser(user as User);
      setLoading(false);
    }

    // Check initial session
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        loadUserProfile(user.id, user.email ?? '');
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    // Subscribe to auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        loadUserProfile(session.user.id, session.user.email ?? '');
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setUser, setLoading]);

  return <>{children}</>;
}

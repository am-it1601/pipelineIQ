/**
 * Upwork Profiles — TanStack Query Hooks
 *
 * Query hooks for reading profile data.
 * All queries go through /api/profiles endpoints.
 */

import type { UpworkProfile } from '@/types/types';
import { useQuery } from '@tanstack/react-query';
import { profileKeys } from './profile.keys';

// ============================================================
// Helpers
// ============================================================

async function profileFetch<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error ?? `Request failed (${res.status})`);
  }
  return res.json() as Promise<T>;
}

// ============================================================
// Query Hooks
// ============================================================

/**
 * Fetch all upwork profiles, optionally filtered by status.
 *
 * @param status  — 'active' | 'inactive' | undefined (all)
 */
export function useProfileList(status?: string) {
  const url = status ? `/api/profiles?status=${status}` : '/api/profiles';

  return useQuery({
    queryKey: profileKeys.list({ status }),
    queryFn: () => profileFetch<UpworkProfile[]>(url),
    staleTime: 5 * 60 * 1000,      // 5 min
    refetchOnWindowFocus: false,
  });
}

/**
 * Fetch a single profile by ID.
 */
export function useProfileDetail(id: string | undefined) {
  return useQuery({
    queryKey: profileKeys.detail(id ?? ''),
    queryFn: () => profileFetch<UpworkProfile>(`/api/profiles/${id}`),
    enabled: !!id,
  });
}

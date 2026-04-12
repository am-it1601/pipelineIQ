/**
 * Auth API — TanStack Query Hooks
 *
 * Query hooks for all GET endpoints in the auth module.
 * Uses fetch() to call the API routes and returns typed responses.
 */

import { useQuery } from '@tanstack/react-query';
import type {
  AuthContext,
  UserRecord,
  UserWithDetails,
  MfaStatus,
} from '@/lib/auth/types/auth.types';

// ============================================================
// Shared fetch helper
// ============================================================

async function authFetch<T>(url: string): Promise<T> {
  const res = await fetch(url);
  const json = await res.json();

  if (!res.ok) {
    throw new Error(json?.error?.message ?? `Request failed with status ${res.status}`);
  }

  return json.data as T;
}

// ============================================================
// Query Key Factory
// ============================================================

export const authKeys = {
  all: ['auth'] as const,
  me: () => [...authKeys.all, 'me'] as const,
  mfaStatus: () => [...authKeys.all, 'mfa-status'] as const,
  users: () => [...authKeys.all, 'users'] as const,
  userList: (params: { page?: number; perPage?: number }) =>
    [...authKeys.users(), 'list', params] as const,
  userDetail: (id: string) => [...authKeys.users(), 'detail', id] as const,
};

// ============================================================
// Query Hooks
// ============================================================

/**
 * GET /api/auth/me — Current user principal + profile
 */
export function useCurrentUser() {
  return useQuery({
    queryKey: authKeys.me(),
    queryFn: () => authFetch<{ principal: AuthContext; profile: UserRecord }>('/api/auth/me'),
  });
}

/**
 * GET /api/auth/me/mfa/status — Current user's MFA status and factors
 */
export function useMfaStatus() {
  return useQuery({
    queryKey: authKeys.mfaStatus(),
    queryFn: () => authFetch<MfaStatus>('/api/auth/me/mfa/status'),
  });
}

/**
 * GET /api/auth/users — Paginated user list
 */
export function useUserList(params: { page?: number; perPage?: number } = {}) {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set('page', String(params.page));
  if (params.perPage) searchParams.set('perPage', String(params.perPage));

  const queryString = searchParams.toString();
  const url = `/api/auth/users${queryString ? `?${queryString}` : ''}`;

  return useQuery({
    queryKey: authKeys.userList(params),
    queryFn: async () => {
      const res = await fetch(url);
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json?.error?.message ?? 'Failed to fetch users');
      }

      return {
        users: json.data as UserWithDetails[],
        meta: json.meta as { page: number; perPage: number; total: number; lastPage: number },
      };
    },
  });
}

/**
 * GET /api/auth/users/:id — Single user details
 */
export function useUserDetail(userId: string | undefined) {
  return useQuery({
    queryKey: authKeys.userDetail(userId ?? ''),
    queryFn: () => authFetch<UserWithDetails>(`/api/auth/users/${userId}`),
    enabled: !!userId,
  });
}

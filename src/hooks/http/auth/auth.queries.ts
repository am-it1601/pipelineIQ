/**
 * Auth API — TanStack Query Hooks
 *
 * Query hooks for all GET endpoints in the auth/user module.
 * Uses fetch() to call the API routes and returns typed responses.
 */

import { useQuery } from '@tanstack/react-query';
import type {
  AuthContext,
  UserRecord,
  UserWithDetails,
  GroupInfo,
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
  userList: (params: { page?: number; perPage?: number; status?: string; group?: string; search?: string }) =>
    [...authKeys.users(), 'list', params] as const,
  userDetail: (id: string) => [...authKeys.users(), 'detail', id] as const,
  invitations: () => [...authKeys.all, 'invitations'] as const,
  invitationList: (params: { page?: number; perPage?: number }) =>
    [...authKeys.invitations(), 'list', params] as const,
  groups: () => [...authKeys.all, 'groups'] as const,
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
 * GET /api/users — Paginated user list with filters
 */
export function useUserList(params: {
  page?: number;
  perPage?: number;
  status?: string;
  group?: string;
  search?: string;
} = {}) {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set('page', String(params.page));
  if (params.perPage) searchParams.set('perPage', String(params.perPage));
  if (params.status) searchParams.set('status', params.status);
  if (params.group) searchParams.set('group', params.group);
  if (params.search) searchParams.set('search', params.search);

  const queryString = searchParams.toString();
  const url = `/api/users${queryString ? `?${queryString}` : ''}`;

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
 * GET /api/users/invitations — Paginated invitation list
 */
export function useInvitationList(params: { page?: number; perPage?: number } = {}) {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set('page', String(params.page));
  if (params.perPage) searchParams.set('perPage', String(params.perPage));

  const queryString = searchParams.toString();
  const url = `/api/users/invitations${queryString ? `?${queryString}` : ''}`;

  return useQuery({
    queryKey: authKeys.invitationList(params),
    queryFn: async () => {
      const res = await fetch(url);
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json?.error?.message ?? 'Failed to fetch invitations');
      }

      return {
        invitations: json.data as UserWithDetails[],
        meta: json.meta as { page: number; perPage: number; total: number; lastPage: number },
      };
    },
  });
}

/**
 * GET /api/users/:id — Single user details
 */
export function useUserDetail(userId: string | undefined) {
  return useQuery({
    queryKey: authKeys.userDetail(userId ?? ''),
    queryFn: () => authFetch<UserWithDetails>(`/api/auth/users/${userId}`),
    enabled: !!userId,
  });
}

/**
 * GET /api/users/groups — All user groups (cached aggressively)
 *
 * Groups change rarely, so we cache for 10 minutes and keep stale data
 * indefinitely while refetching in the background.
 */
export function useGroupList() {
  return useQuery({
    queryKey: authKeys.groups(),
    queryFn: () => authFetch<GroupInfo[]>('/api/users/groups'),
    staleTime: 10 * 60 * 1000,     // 10 minutes before considered stale
    gcTime: 30 * 60 * 1000,        // keep in garbage-collection cache 30 min
    refetchOnWindowFocus: false,    // no refetch on tab switch
  });
}

/**
 * Auth API — TanStack Mutation Hooks
 *
 * Mutation hooks for all POST/PATCH/DELETE endpoints in the auth module.
 * Each mutation auto-invalidates relevant queries on success.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { MfaEnrollmentResult } from '@/lib/auth/types/auth.types';
import { authKeys } from './auth.queries';

// ============================================================
// Shared fetch helper
// ============================================================

async function authMutate<T = void>(
  url: string,
  options: { method?: string; body?: unknown } = {}
): Promise<T> {
  const { method = 'POST', body } = options;

  const res = await fetch(url, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json?.error?.message ?? `Request failed with status ${res.status}`);
  }

  return json.data as T;
}

// ============================================================
// MFA Self-Service Mutations
// ============================================================

/**
 * POST /api/auth/me/mfa/enroll — Start TOTP enrollment
 */
export function useEnrollMfa() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authMutate<MfaEnrollmentResult>('/api/auth/me/mfa/enroll'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.mfaStatus() });
    },
  });
}

/**
 * POST /api/auth/me/mfa/verify — Verify TOTP enrollment
 */
export function useVerifyMfa() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { factorId: string; code: string }) =>
      authMutate('/api/auth/me/mfa/verify', { body: input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.mfaStatus() });
      queryClient.invalidateQueries({ queryKey: authKeys.me() });
    },
  });
}

/**
 * POST /api/auth/me/mfa/unenroll — Remove own MFA factor
 */
export function useUnenrollMfa() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { factorId: string }) =>
      authMutate('/api/auth/me/mfa/unenroll', { body: input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.mfaStatus() });
      queryClient.invalidateQueries({ queryKey: authKeys.me() });
    },
  });
}

// ============================================================
// User Management Mutations
// ============================================================

/**
 * POST /api/users — Invite a new user
 */
export function useInviteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { email: string; groupSlug: string; fullName?: string }) =>
      authMutate<{ userId: string }>('/api/users', { body: input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.users() });
      queryClient.invalidateQueries({ queryKey: authKeys.invitations() });
    },
  });
}

/**
 * POST /api/users/invitations/:id — Resend invitation
 */
export function useResendInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) =>
      authMutate(`/api/users/invitations/${userId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.invitations() });
    },
  });
}

/**
 * DELETE /api/users/invitations/:id — Revoke invitation (hard delete)
 */
export function useRevokeInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) =>
      authMutate(`/api/users/invitations/${userId}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.invitations() });
      queryClient.invalidateQueries({ queryKey: authKeys.users() });
    },
  });
}

/**
 * PATCH /api/auth/users/:id — Update user (profile, status, groups)
 */
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      ...data
    }: {
      userId: string;
      full_name?: string;
      avatar_initials?: string;
      status?: 'invited' | 'active' | 'suspended';
      groupSlugs?: string[];
    }) => authMutate(`/api/auth/users/${userId}`, { method: 'PATCH', body: data }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: authKeys.userDetail(variables.userId) });
      queryClient.invalidateQueries({ queryKey: authKeys.users() });
    },
  });
}

/**
 * DELETE /api/auth/users/:id — Delete user
 */
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) =>
      authMutate(`/api/auth/users/${userId}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.users() });
    },
  });
}

/**
 * POST /api/auth/users/:id/ban — Ban a user
 */
export function useBanUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => authMutate(`/api/auth/users/${userId}/ban`),
    onSuccess: (_data, userId) => {
      queryClient.invalidateQueries({ queryKey: authKeys.userDetail(userId) });
      queryClient.invalidateQueries({ queryKey: authKeys.users() });
    },
  });
}

/**
 * POST /api/auth/users/:id/unban — Unban a user
 */
export function useUnbanUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => authMutate(`/api/auth/users/${userId}/unban`),
    onSuccess: (_data, userId) => {
      queryClient.invalidateQueries({ queryKey: authKeys.userDetail(userId) });
      queryClient.invalidateQueries({ queryKey: authKeys.users() });
    },
  });
}

/**
 * POST /api/auth/users/:id/verify-email — Force-verify email
 */
export function useVerifyUserEmail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => authMutate(`/api/auth/users/${userId}/verify-email`),
    onSuccess: (_data, userId) => {
      queryClient.invalidateQueries({ queryKey: authKeys.userDetail(userId) });
    },
  });
}

/**
 * POST /api/auth/users/:id/reset-password — Send password reset link
 */
export function useSendPasswordReset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) =>
      authMutate<{ link: string }>(`/api/auth/users/${userId}/reset-password`),
    onSuccess: (_data, userId) => {
      queryClient.invalidateQueries({ queryKey: authKeys.userDetail(userId) });
    },
  });
}

/**
 * POST /api/auth/users/:id/magic-link — Send magic link
 */
export function useSendMagicLink() {
  return useMutation({
    mutationFn: (userId: string) =>
      authMutate<{ link: string }>(`/api/auth/users/${userId}/magic-link`),
  });
}

/**
 * POST /api/auth/users/:id/mfa/reset — Admin reset user's MFA
 */
export function useAdminResetUserMfa() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) =>
      authMutate<{ deletedCount: number }>(`/api/auth/users/${userId}/mfa/reset`),
    onSuccess: (_data, userId) => {
      queryClient.invalidateQueries({ queryKey: authKeys.userDetail(userId) });
    },
  });
}

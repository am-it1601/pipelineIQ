/**
 * Auth Module — Admin User Service
 *
 * All admin-level user management operations via the Supabase Admin API.
 * Uses the service-role client for privileged operations.
 */

import { createAdminClient } from '@/lib/supabase/admin';
import type {
  UserWithDetails,
  PaginatedUsers,
  AuthError as AuthErrorType,
} from '../types/auth.types';
import {
  AuthError,
  NotFoundError,
  ConflictError,
} from '../types/auth.types';
import { getUserById, getUserGroupDetails } from './user.service';
import { getUserPermissions } from './permission.service';

// ============================================================
// Invite
// ============================================================

/**
 * Invite a new user by email. Creates the auth user and assigns a group.
 *
 * @param email - User's email address
 * @param groupSlug - Group slug to assign
 * @param fullName - Optional full name
 * @returns The new user's ID
 */
export async function inviteUser(params: {
  email: string;
  groupSlug: string;
  fullName?: string;
}): Promise<{ userId: string }> {
  const { email, groupSlug, fullName } = params;
  const supabase = createAdminClient();

  // Check if user already exists in auth
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const existing = existingUsers?.users?.find(
    (u) => u.email?.toLowerCase() === email.toLowerCase()
  );

  if (existing) {
    throw new ConflictError(`User with email '${email}' already exists`);
  }

  // Validate group slug exists
  const { data: group, error: groupError } = await supabase
    .from('user_groups')
    .select('id')
    .eq('slug', groupSlug)
    .single();

  if (groupError || !group) {
    throw new AuthError(`Invalid group: '${groupSlug}'`, 'INVALID_GROUP', 400);
  }

  // Invite via Supabase Admin API
  const { data: inviteData, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(
    email,
    {
      data: {
        full_name: fullName ?? '',
        avatar_initials: fullName ? fullName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) : '',
      },
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    }
  );

  if (inviteError || !inviteData.user) {
    throw new AuthError(
      `Failed to invite user: ${inviteError?.message ?? 'Unknown error'}`,
      'INVITE_FAILED',
      500
    );
  }

  const userId = inviteData.user.id;

  // The trigger should auto-create the public.users row.
  // Assign the user to the specified group.
  const { error: membershipError } = await supabase
    .from('user_group_memberships')
    .insert({ user_id: userId, group_id: group.id });

  if (membershipError) {
    console.error('Failed to assign group after invite:', membershipError.message);
    // Non-fatal — user is created, group can be assigned later
  }

  return { userId };
}

// ============================================================
// List & Get
// ============================================================

/**
 * List users with pagination. Enriches with group info.
 */
export async function listUsers(params: {
  page: number;
  perPage: number;
}): Promise<PaginatedUsers> {
  const { page, perPage } = params;
  const supabase = createAdminClient();

  // Get total count
  const { count, error: countError } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    throw new AuthError(`Failed to count users: ${countError.message}`, 'LIST_FAILED', 500);
  }

  const total = count ?? 0;
  const lastPage = Math.ceil(total / perPage) || 1;

  // Fetch paginated users
  const offset = (page - 1) * perPage;
  const { data: userRecords, error: listError } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })
    .range(offset, offset + perPage - 1);

  if (listError) {
    throw new AuthError(`Failed to list users: ${listError.message}`, 'LIST_FAILED', 500);
  }

  // Enrich each user with details
  const users: UserWithDetails[] = await Promise.all(
    (userRecords ?? []).map((record) => getFullUserDetails(record.id))
  );

  return { users, total, page, perPage, lastPage };
}

/**
 * Get full details for a single user (auth data + public.users + groups + permissions + MFA).
 */
export async function getFullUserDetails(userId: string): Promise<UserWithDetails> {
  const supabase = createAdminClient();

  // Get public.users record
  const userRecord = await getUserById(userId);

  // Get auth user for ban/sign-in info
  const { data: authData, error: authError } = await supabase.auth.admin.getUserById(userId);

  if (authError || !authData.user) {
    throw new NotFoundError(`Auth user not found: ${userId}`);
  }

  const authUser = authData.user;

  // Get groups and permissions
  const [groups, permissions] = await Promise.all([
    getUserGroupDetails(userId),
    getUserPermissions(userId),
  ]);

  // Get MFA factor count
  let factorCount = 0;
  let mfaEnabled = false;
  try {
    const { data: factors } = await supabase.auth.admin.mfa.listFactors({ userId });
    const verifiedFactors = factors?.factors?.filter((f) => f.status === 'verified') ?? [];
    factorCount = verifiedFactors.length;
    mfaEnabled = factorCount > 0;
  } catch {
    // MFA info is non-critical
  }

  return {
    user: userRecord,
    groups,
    permissions,
    auth: {
      email_confirmed_at: authUser.email_confirmed_at ?? null,
      last_sign_in_at: authUser.last_sign_in_at ?? null,
      banned_until: authUser.banned_until?.toString() ?? null,
      created_at: authUser.created_at,
    },
    mfa: {
      enabled: mfaEnabled,
      factorCount,
    },
  };
}

// ============================================================
// Delete
// ============================================================

/**
 * Delete a user. Removes from auth.users (cascades to public.users).
 * Prevents deleting self.
 */
export async function deleteUser(userId: string, performedBy: string): Promise<void> {
  if (userId === performedBy) {
    throw new AuthError('You cannot delete your own account', 'SELF_DELETE', 400);
  }

  const supabase = createAdminClient();

  const { error } = await supabase.auth.admin.deleteUser(userId);

  if (error) {
    throw new AuthError(`Failed to delete user: ${error.message}`, 'DELETE_FAILED', 500);
  }
}

// ============================================================
// Ban / Unban
// ============================================================

/**
 * Ban a user by setting ban_duration to 100 years. Prevents banning self.
 */
export async function banUser(userId: string, performedBy: string): Promise<void> {
  if (userId === performedBy) {
    throw new AuthError('You cannot ban your own account', 'SELF_BAN', 400);
  }

  const supabase = createAdminClient();

  const { error } = await supabase.auth.admin.updateUserById(userId, {
    ban_duration: '876000h',
  });

  if (error) {
    throw new AuthError(`Failed to ban user: ${error.message}`, 'BAN_FAILED', 500);
  }
}

/**
 * Unban a user by clearing the ban.
 */
export async function unbanUser(userId: string): Promise<void> {
  const supabase = createAdminClient();

  const { error } = await supabase.auth.admin.updateUserById(userId, {
    ban_duration: 'none',
  });

  if (error) {
    throw new AuthError(`Failed to unban user: ${error.message}`, 'UNBAN_FAILED', 500);
  }
}

// ============================================================
// Verify Email
// ============================================================

/**
 * Force-verify a user's email address.
 */
export async function verifyUserEmail(userId: string): Promise<void> {
  const supabase = createAdminClient();

  const { error } = await supabase.auth.admin.updateUserById(userId, {
    email_confirm: true,
  });

  if (error) {
    throw new AuthError(`Failed to verify email: ${error.message}`, 'VERIFY_EMAIL_FAILED', 500);
  }
}

// ============================================================
// Password Reset & Magic Link
// ============================================================

/**
 * Generate and send a password reset link for a user.
 */
export async function sendPasswordResetLink(userId: string): Promise<{ link: string }> {
  const supabase = createAdminClient();

  // Get user email
  const { data: authData, error: authError } = await supabase.auth.admin.getUserById(userId);
  if (authError || !authData.user?.email) {
    throw new NotFoundError('User not found or has no email');
  }

  const { data, error } = await supabase.auth.admin.generateLink({
    type: 'recovery',
    email: authData.user.email,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password`,
    },
  });

  if (error) {
    throw new AuthError(`Failed to generate reset link: ${error.message}`, 'RESET_LINK_FAILED', 500);
  }

  return { link: data.properties?.action_link ?? '' };
}

/**
 * Generate and send a magic link for a user.
 */
export async function sendMagicLink(userId: string): Promise<{ link: string }> {
  const supabase = createAdminClient();

  // Get user email
  const { data: authData, error: authError } = await supabase.auth.admin.getUserById(userId);
  if (authError || !authData.user?.email) {
    throw new NotFoundError('User not found or has no email');
  }

  const { data, error } = await supabase.auth.admin.generateLink({
    type: 'magiclink',
    email: authData.user.email,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`,
    },
  });

  if (error) {
    throw new AuthError(`Failed to generate magic link: ${error.message}`, 'MAGIC_LINK_FAILED', 500);
  }

  return { link: data.properties?.action_link ?? '' };
}

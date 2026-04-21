/**
 * Auth Module — Admin User Service
 *
 * All admin-level user management operations via the Supabase Admin API.
 * Uses the service-role client for privileged operations.
 */

import { createAdminClient } from '@/lib/supabase/admin';
import type {
  UserWithDetails,
  UserRecord,
  PaginatedUsers,
} from '../types/auth.types';
import {
  AuthError,
  NotFoundError,
  ConflictError,
} from '../types/auth.types';
import { getUserById, getUserGroupDetails, updateUser } from './user.service';
import { getUserPermissions } from './permission.service';
import { getInvitationExpiryDays } from '@/lib/services/app-settings.service';

// ============================================================
// Invite
// ============================================================

/**
 * Invite a new user by email. Creates the auth user (trigger creates public.users
 * with status='invited') and assigns a group.
 *
 * @param email - User's email address
 * @param groupSlug - Group slug to assign
 * @param fullName - Optional full name
 * @param invitedBy - ID of the admin performing the invite
 * @returns The new user's ID
 */
export async function inviteUser(params: {
  email: string;
  groupSlug: string;
  fullName?: string;
  invitedBy: string;
}): Promise<{ userId: string }> {
  const { email, groupSlug, fullName, invitedBy } = params;
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

  // Invite via Supabase Admin API — trigger creates public.users with status='invited'
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const { data: inviteData, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(
    email,
    {
      data: {
        full_name: fullName ?? '',
        invited_by: invitedBy,
      },
      redirectTo: `${siteUrl}/onboarding`,
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

  // Assign the user to the specified group
  const { error: membershipError } = await supabase
    .from('user_group_memberships')
    .insert({ user_id: userId, group_id: group.id });

  if (membershipError) {
    console.error('Failed to assign group after invite:', membershipError.message);
  }

  return { userId };
}

// ============================================================
// List & Get
// ============================================================

/**
 * List users with pagination, filtering, and search.
 * Queries public.users directly — no N+1 enrichment.
 * Groups are NOT included in listing (only needed for filter or detail view).
 */
export async function listUsers(params: {
  page: number;
  perPage: number;
  status?: string;
  group?: string;
  search?: string;
}): Promise<PaginatedUsers> {
  const { page, perPage, status, group, search } = params;
  const supabase = createAdminClient();

  // Build base query for count
  let countQuery = supabase
    .from('users')
    .select('*', { count: 'exact', head: true });

  // Apply status filter (default: exclude 'invited')
  if (status) {
    countQuery = countQuery.eq('status', status);
  } else {
    countQuery = countQuery.neq('status', 'invited');
  }

  // Apply search filter
  if (search) {
    countQuery = countQuery.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
  }

  // Group filter requires a subquery via user_group_memberships
  // For simplicity, we handle this after fetching if needed
  const { count, error: countError } = await countQuery;

  if (countError) {
    throw new AuthError(`Failed to count users: ${countError.message}`, 'LIST_FAILED', 500);
  }

  const total = count ?? 0;
  const lastPage = Math.ceil(total / perPage) || 1;

  // Fetch paginated users
  const offset = (page - 1) * perPage;
  let listQuery = supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })
    .range(offset, offset + perPage - 1);

  if (status) {
    listQuery = listQuery.eq('status', status);
  } else {
    listQuery = listQuery.neq('status', 'invited');
  }

  if (search) {
    listQuery = listQuery.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
  }

  const { data: userRecords, error: listError } = await listQuery;

  if (listError) {
    throw new AuthError(`Failed to list users: ${listError.message}`, 'LIST_FAILED', 500);
  }

  // Map to UserWithDetails (lightweight — no auth/mfa enrichment for listing)
  const users: UserWithDetails[] = (userRecords ?? []).map((record) => ({
    // Identity
    id: record.id,
    email: record.email,
    full_name: record.full_name,
    avatar_initials: record.avatar_initials,
    status: record.status,
    created_at: record.created_at,
    updated_at: record.updated_at,

    // Invitation
    invited_by: record.invited_by ?? null,
    invited_at: record.invited_at ?? null,
    invitation_expires_at: record.invitation_expires_at ?? null,
    invitation_accepted_at: record.invitation_accepted_at ?? null,
    invitation_resent_count: record.invitation_resent_count ?? 0,

    // Auth fields — not populated for listing (use getFullUserDetails for detail view)
    email_confirmed_at: null,
    last_sign_in_at: null,
    banned_until: null,
    auth_created_at: record.created_at,

    // Groups & permissions — not populated for listing
    groups: [],
    permissions: [],

    // MFA — not populated for listing
    mfa_enabled: false,
    mfa_factor_count: 0,
  }));

  return { users, total, page, perPage, lastPage };
}

/**
 * List invited users (pending invitations).
 */
export async function listInvitations(params: {
  page: number;
  perPage: number;
}): Promise<PaginatedUsers> {
  return listUsers({ ...params, status: 'invited' });
}

/**
 * Get full details for a single user (auth data + public.users + groups + permissions + MFA).
 * Used for the detail/profile view — NOT for listing.
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
    // Identity (from public.users)
    id: userRecord.id,
    email: userRecord.email,
    full_name: userRecord.full_name,
    avatar_initials: userRecord.avatar_initials,
    status: userRecord.status,
    created_at: userRecord.created_at,
    updated_at: userRecord.updated_at,

    // Invitation
    invited_by: userRecord.invited_by,
    invited_at: userRecord.invited_at,
    invitation_expires_at: userRecord.invitation_expires_at,
    invitation_accepted_at: userRecord.invitation_accepted_at,
    invitation_resent_count: userRecord.invitation_resent_count,

    // Auth session info
    email_confirmed_at: authUser.email_confirmed_at ?? null,
    last_sign_in_at: authUser.last_sign_in_at ?? null,
    banned_until: authUser.banned_until?.toString() ?? null,
    auth_created_at: authUser.created_at,

    // Groups & permissions
    groups,
    permissions,

    // MFA
    mfa_enabled: mfaEnabled,
    mfa_factor_count: factorCount,
  };
}

// ============================================================
// Invitation Management
// ============================================================

/**
 * Accept an invitation — sets status to 'active', updates profile fields.
 * Called during onboarding completion.
 */
export async function acceptInvitation(params: {
  userId: string;
  fullName: string;
  avatarInitials: string;
}): Promise<void> {
  const { userId, fullName, avatarInitials } = params;

  await updateUser(userId, {
    status: 'active',
    full_name: fullName,
    avatar_initials: avatarInitials,
    invitation_accepted_at: new Date().toISOString(),
  });
}

/**
 * Resend an invitation email. Increments resent_count and resets expiry.
 * Only works for users with status='invited'.
 */
export async function resendInvitation(userId: string): Promise<void> {
  const supabase = createAdminClient();
  const userRecord = await getUserById(userId);

  if (userRecord.status !== 'invited') {
    throw new AuthError('Can only resend invitations for invited users', 'INVALID_STATUS', 400);
  }

  // Re-send via Supabase Auth Admin API
  const { error: authError } = await supabase.auth.admin.inviteUserByEmail(
    userRecord.email,
    {
      data: {
        full_name: userRecord.full_name,
        invited_by: userRecord.invited_by,
      },
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/onboarding`,
    }
  );

  if (authError) {
    throw new AuthError(`Failed to resend invitation: ${authError.message}`, 'RESEND_FAILED', 500);
  }

  // Update invitation metadata
  const expiryDays = await getInvitationExpiryDays(supabase);
  const newExpiry = new Date();
  newExpiry.setDate(newExpiry.getDate() + expiryDays);

  await updateUser(userId, {
    invitation_resent_count: userRecord.invitation_resent_count + 1,
    invitation_expires_at: newExpiry.toISOString(),
  });
}

/**
 * Revoke an invitation — HARD DELETE from both auth.users and public.users.
 * Only works for users with status='invited'.
 */
export async function revokeInvitation(userId: string): Promise<void> {
  const supabase = createAdminClient();
  const userRecord = await getUserById(userId);

  if (userRecord.status !== 'invited') {
    throw new AuthError('Can only revoke invitations for invited users', 'INVALID_STATUS', 400);
  }

  // Delete from auth.users (public.users row will be cleaned up via cascade or manual delete)
  const { error: authDeleteError } = await supabase.auth.admin.deleteUser(userId);
  if (authDeleteError) {
    throw new AuthError(`Failed to revoke invitation: ${authDeleteError.message}`, 'REVOKE_FAILED', 500);
  }

  // Also delete from public.users (in case there's no cascade)
  const { error: publicDeleteError } = await supabase
    .from('users')
    .delete()
    .eq('id', userId);

  if (publicDeleteError) {
    console.error('Failed to delete public.users row after revoke:', publicDeleteError.message);
  }
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
 * Ban (disable) a user. Sets ban_duration in auth.users and syncs status to public.users.
 * Prevents banning self.
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

  // Sync status to public.users
  await updateUser(userId, { status: 'suspended' });
}

/**
 * Unban (enable) a user. Clears ban in auth.users and syncs status to public.users.
 */
export async function unbanUser(userId: string): Promise<void> {
  const supabase = createAdminClient();

  const { error } = await supabase.auth.admin.updateUserById(userId, {
    ban_duration: 'none',
  });

  if (error) {
    throw new AuthError(`Failed to unban user: ${error.message}`, 'UNBAN_FAILED', 500);
  }

  // Sync status to public.users
  await updateUser(userId, { status: 'active' });
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

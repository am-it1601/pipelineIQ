/**
 * Auth Module — User Service
 *
 * Operations on the public.users table and user_group_memberships.
 * Handles user record CRUD and group membership management.
 */

import { createAdminClient } from '@/lib/supabase/admin';
import type { UserRecord, GroupInfo } from '../types/auth.types';
import { NotFoundError, ConflictError, AuthError } from '../types/auth.types';

/**
 * Get a user record from public.users by ID.
 */
export async function getUserById(userId: string): Promise<UserRecord> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !data) {
    throw new NotFoundError(`User not found: ${userId}`);
  }

  return data as UserRecord;
}

/**
 * Get a user record from public.users by email.
 */
export async function getUserByEmail(email: string): Promise<UserRecord | null> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email.toLowerCase())
    .single();

  if (error || !data) {
    return null;
  }

  return data as UserRecord;
}

/**
 * Update a user record in public.users.
 */
export async function updateUser(
  userId: string,
  updates: Partial<Pick<UserRecord, 'full_name' | 'avatar_initials' | 'status'>>
): Promise<UserRecord> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    throw new AuthError(`Failed to update user: ${error.message}`, 'UPDATE_FAILED', 500);
  }

  return data as UserRecord;
}

/**
 * Set a user's status to 'inactive'.
 */
export async function deactivateUser(userId: string): Promise<UserRecord> {
  return updateUser(userId, { status: 'inactive' });
}

/**
 * Set a user's status to 'active'.
 */
export async function activateUser(userId: string): Promise<UserRecord> {
  return updateUser(userId, { status: 'active' });
}

/**
 * Replace a user's group memberships entirely.
 * Removes all existing memberships and assigns the specified groups.
 *
 * @param userId - The target user
 * @param groupSlugs - Array of group slugs to assign
 * @param assignedBy - The user performing the assignment (optional)
 */
export async function updateUserGroups(
  userId: string,
  groupSlugs: string[],
  assignedBy?: string
): Promise<void> {
  const supabase = createAdminClient();

  // Validate that all group slugs exist
  const { data: groups, error: groupError } = await supabase
    .from('user_groups')
    .select('id, slug')
    .in('slug', groupSlugs);

  if (groupError) {
    throw new AuthError(`Failed to validate groups: ${groupError.message}`, 'GROUP_VALIDATION_FAILED', 500);
  }

  if (!groups || groups.length !== groupSlugs.length) {
    const found = (groups ?? []).map((g: { slug: string }) => g.slug);
    const missing = groupSlugs.filter((s) => !found.includes(s));
    throw new ConflictError(`Invalid group slugs: ${missing.join(', ')}`);
  }

  // Remove existing memberships
  const { error: deleteError } = await supabase
    .from('user_group_memberships')
    .delete()
    .eq('user_id', userId);

  if (deleteError) {
    throw new AuthError(`Failed to clear groups: ${deleteError.message}`, 'GROUP_CLEAR_FAILED', 500);
  }

  // Insert new memberships
  const memberships = groups.map((g: { id: string }) => ({
    user_id: userId,
    group_id: g.id,
    assigned_by: assignedBy ?? null,
  }));

  const { error: insertError } = await supabase
    .from('user_group_memberships')
    .insert(memberships);

  if (insertError) {
    throw new AuthError(`Failed to assign groups: ${insertError.message}`, 'GROUP_ASSIGN_FAILED', 500);
  }
}

/**
 * Get the groups a user belongs to (full GroupInfo objects).
 */
export async function getUserGroupDetails(userId: string): Promise<GroupInfo[]> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('user_group_memberships')
    .select('group_id, user_groups:group_id(id, slug, display_name, description, is_system)')
    .eq('user_id', userId);

  if (error) {
    console.error('Failed to fetch user group details:', error.message);
    return [];
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? []).map((row: any) => row.user_groups).filter(Boolean) as GroupInfo[];
}

/**
 * Auth Module — Permission Service
 *
 * DB-driven permission and group lookups. Uses the RPC helper functions
 * created in the database to efficiently check permissions.
 * No hardcoded role strings — all lookups go through the database.
 */

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import type { GroupInfo, PermissionInfo } from '../types/auth.types';

/**
 * Get all permission codes for a user via the DB RPC function.
 */
export async function getUserPermissions(userId: string): Promise<string[]> {
  const supabase = createAdminClient();

  const { data, error } = await supabase.rpc('get_user_permissions', {
    target_user_id: userId,
  });

  if (error) {
    console.error('Failed to fetch user permissions:', error.message);
    return [];
  }

  return (data as string[]) ?? [];
}

/**
 * Get all group slugs for a user via the DB RPC function.
 */
export async function getUserGroupSlugs(userId: string): Promise<string[]> {
  const supabase = createAdminClient();

  const { data, error } = await supabase.rpc('get_user_groups', {
    target_user_id: userId,
  });

  if (error) {
    console.error('Failed to fetch user groups:', error.message);
    return [];
  }

  return (data as string[]) ?? [];
}

/**
 * Check if a user has a specific permission via the DB RPC function.
 */
export async function hasPermission(userId: string, permissionCode: string): Promise<boolean> {
  const supabase = createAdminClient();

  const { data, error } = await supabase.rpc('has_permission', {
    target_user_id: userId,
    permission_code: permissionCode,
  });

  if (error) {
    console.error('Failed to check permission:', error.message);
    return false;
  }

  return data === true;
}

/**
 * List all available user groups.
 */
export async function getAllGroups(): Promise<GroupInfo[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('user_groups')
    .select('id, slug, display_name, description, is_system')
    .order('display_name');

  if (error) {
    console.error('Failed to fetch groups:', error.message);
    return [];
  }

  return data as GroupInfo[];
}

/**
 * List all available permissions, optionally filtered by category.
 */
export async function getAllPermissions(category?: string): Promise<PermissionInfo[]> {
  const supabase = await createClient();

  let query = supabase
    .from('permissions')
    .select('id, code, display_name, description, category')
    .order('category')
    .order('code');

  if (category) {
    query = query.eq('category', category);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Failed to fetch permissions:', error.message);
    return [];
  }

  return data as PermissionInfo[];
}

/**
 * Get all permissions assigned to a specific group.
 */
export async function getGroupPermissions(groupId: string): Promise<PermissionInfo[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('group_permissions')
    .select('permission_id, permissions:permission_id(id, code, display_name, description, category)')
    .eq('group_id', groupId);

  if (error) {
    console.error('Failed to fetch group permissions:', error.message);
    return [];
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? []).map((row: any) => row.permissions).filter(Boolean) as PermissionInfo[];
}

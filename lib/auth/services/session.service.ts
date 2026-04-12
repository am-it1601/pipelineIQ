/**
 * Auth Module — Session Service
 *
 * Handles session-related operations: retrieving the current authenticated
 * principal from Supabase auth and the corresponding public.users record.
 */

import { createClient } from '@/lib/supabase/server';
import type { AuthContext, UserRecord } from '../types/auth.types';
import { UnauthenticatedError, NotFoundError } from '../types/auth.types';
import { getUserPermissions, getUserGroupSlugs } from './permission.service';

/**
 * Get the current authenticated principal from the Supabase auth session.
 * Returns the raw Supabase user object.
 *
 * @throws UnauthenticatedError if no valid session exists
 */
export async function getPrincipal() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    throw new UnauthenticatedError();
  }

  return user;
}

/**
 * Get the current user's record from public.users.
 *
 * @throws UnauthenticatedError if no valid session
 * @throws NotFoundError if user record doesn't exist in public.users
 */
export async function getCurrentUserRecord(): Promise<UserRecord> {
  const principal = await getPrincipal();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', principal.id)
    .single();

  if (error || !data) {
    throw new NotFoundError('User record not found');
  }

  return data as UserRecord;
}

/**
 * Build a full AuthContext for the current request.
 * Includes the user's groups and permissions loaded from the database.
 *
 * @throws UnauthenticatedError if no valid session
 */
export async function getAuthContext(): Promise<AuthContext> {
  const principal = await getPrincipal();

  const [groups, permissions] = await Promise.all([
    getUserGroupSlugs(principal.id),
    getUserPermissions(principal.id),
  ]);

  return {
    userId: principal.id,
    email: principal.email ?? '',
    groups,
    permissions,
  };
}

/**
 * Auth Module — Session Service
 *
 * Handles session-related operations: retrieving the current authenticated
 * principal from Supabase auth and the corresponding public.users record.
 */

import { createClient } from '@/lib/supabase/server';
import type { AuthContext, UserRecord } from '../types/auth.types';
import { UnauthenticatedError, NotFoundError, ForbiddenError } from '../types/auth.types';
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
 * Blocks non-active users with descriptive errors.
 *
 * @throws UnauthenticatedError if no valid session
 * @throws ForbiddenError if user status is not 'active'
 */
export async function getAuthContext(): Promise<AuthContext> {
  const userRecord = await getCurrentUserRecord();

  // Block non-active users
  if (userRecord.status === 'invited') {
    throw new ForbiddenError(
      'Your account setup is not complete. Please check your email for the invitation link.'
    );
  }
  if (userRecord.status === 'suspended') {
    throw new ForbiddenError(
      'Your account has been disabled. Please contact your administrator.'
    );
  }

  const [groups, permissions] = await Promise.all([
    getUserGroupSlugs(userRecord.id),
    getUserPermissions(userRecord.id),
  ]);

  return {
    userId: userRecord.id,
    email: userRecord.email,
    groups,
    permissions,
  };
}

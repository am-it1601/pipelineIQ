'use server';

/**
 * Auth Module — Session Actions
 *
 * Server actions for session and current user operations.
 */

import type { ActionResult, AuthContext, UserRecord } from '../types/auth.types';
import { AuthError } from '../types/auth.types';
import { getAuthContext, getCurrentUserRecord } from '../services/session.service';

/**
 * Get the current authenticated principal (auth identity + groups + permissions).
 */
export async function getPrincipal(): Promise<ActionResult<AuthContext>> {
  try {
    const context = await getAuthContext();
    return { success: true, data: context };
  } catch (error) {
    if (error instanceof AuthError) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Failed to get principal' };
  }
}

/**
 * Get the current user's profile from public.users.
 */
export async function getCurrentUserProfile(): Promise<ActionResult<UserRecord>> {
  try {
    const record = await getCurrentUserRecord();
    return { success: true, data: record };
  } catch (error) {
    if (error instanceof AuthError) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Failed to get user profile' };
  }
}

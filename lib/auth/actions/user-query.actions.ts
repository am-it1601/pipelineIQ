'use server';

/**
 * Auth Module — User Query Actions
 *
 * Server actions for listing and viewing users.
 */

import type { ActionResult, PaginatedUsers, UserWithDetails } from '../types/auth.types';
import { AuthError } from '../types/auth.types';
import { requirePermission } from '../services/authorization.service';
import { listUsers as listUsersService, getFullUserDetails } from '../services/admin-user.service';
import { paginationSchema, userIdParamSchema } from '../validation/auth.schemas';

/**
 * List all users with pagination.
 * Requires: users:list permission
 */
export async function listUsers(params: {
  page?: number;
  perPage?: number;
}): Promise<ActionResult<PaginatedUsers>> {
  try {
    await requirePermission('users:list');

    const validated = paginationSchema.parse(params);
    const result = await listUsersService(validated);

    return { success: true, data: result };
  } catch (error) {
    if (error instanceof AuthError) {
      return { success: false, error: error.message };
    }
    console.error('listUsers action error:', error);
    return { success: false, error: 'Failed to list users' };
  }
}

/**
 * Get detailed information about a specific user.
 * Requires: users:view permission
 */
export async function getUserDetails(userId: string): Promise<ActionResult<UserWithDetails>> {
  try {
    await requirePermission('users:view');

    const { id } = userIdParamSchema.parse({ id: userId });
    const details = await getFullUserDetails(id);

    return { success: true, data: details };
  } catch (error) {
    if (error instanceof AuthError) {
      return { success: false, error: error.message };
    }
    console.error('getUserDetails action error:', error);
    return { success: false, error: 'Failed to get user details' };
  }
}

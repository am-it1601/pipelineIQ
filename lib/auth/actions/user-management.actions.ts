'use server';

/**
 * Auth Module — User Management Actions
 *
 * Server actions for admin user management operations.
 * Each action enforces permissions before calling the service layer.
 */

import type { ActionResult } from '../types/auth.types';
import { AuthError } from '../types/auth.types';
import { requirePermission } from '../services/authorization.service';
import {
  inviteUser as inviteUserService,
  deleteUser as deleteUserService,
  banUser as banUserService,
  unbanUser as unbanUserService,
  verifyUserEmail as verifyUserEmailService,
  sendPasswordResetLink as sendPasswordResetLinkService,
  sendMagicLink as sendMagicLinkService,
} from '../services/admin-user.service';
import {
  deactivateUser as deactivateUserService,
  activateUser as activateUserService,
  updateUserGroups as updateUserGroupsService,
} from '../services/user.service';
import {
  inviteUserSchema,
  userIdParamSchema,
  updateUserGroupsSchema,
} from '../validation/auth.schemas';

// ============================================================
// Helper
// ============================================================

function handleError(error: unknown, fallback: string): ActionResult<never> {
  if (error instanceof AuthError) {
    return { success: false, error: error.message };
  }
  console.error(fallback, error);
  return { success: false, error: fallback };
}

// ============================================================
// Actions
// ============================================================

/**
 * Invite a new user.
 * Requires: users:invite
 */
export async function inviteUser(input: {
  email: string;
  groupSlug: string;
  fullName?: string;
}): Promise<ActionResult<{ userId: string }>> {
  try {
    await requirePermission('users:invite');
    const validated = inviteUserSchema.parse(input);
    const result = await inviteUserService(validated);
    return { success: true, data: result };
  } catch (error) {
    return handleError(error, 'Failed to invite user');
  }
}

/**
 * Delete a user.
 * Requires: users:delete
 */
export async function deleteUser(userId: string): Promise<ActionResult<void>> {
  try {
    const context = await requirePermission('users:delete');
    const { id } = userIdParamSchema.parse({ id: userId });
    await deleteUserService(id, context.userId);
    return { success: true, data: undefined };
  } catch (error) {
    return handleError(error, 'Failed to delete user');
  }
}

/**
 * Ban a user.
 * Requires: users:ban
 */
export async function banUser(userId: string): Promise<ActionResult<void>> {
  try {
    const context = await requirePermission('users:ban');
    const { id } = userIdParamSchema.parse({ id: userId });
    await banUserService(id, context.userId);
    return { success: true, data: undefined };
  } catch (error) {
    return handleError(error, 'Failed to ban user');
  }
}

/**
 * Unban a user.
 * Requires: users:ban
 */
export async function unbanUser(userId: string): Promise<ActionResult<void>> {
  try {
    await requirePermission('users:ban');
    const { id } = userIdParamSchema.parse({ id: userId });
    await unbanUserService(id);
    return { success: true, data: undefined };
  } catch (error) {
    return handleError(error, 'Failed to unban user');
  }
}

/**
 * Force-verify a user's email.
 * Requires: users:verify_email
 */
export async function verifyUserEmail(userId: string): Promise<ActionResult<void>> {
  try {
    await requirePermission('users:verify_email');
    const { id } = userIdParamSchema.parse({ id: userId });
    await verifyUserEmailService(id);
    return { success: true, data: undefined };
  } catch (error) {
    return handleError(error, 'Failed to verify email');
  }
}

/**
 * Update a user's group memberships.
 * Requires: users:manage_groups
 */
export async function updateUserGroups(
  userId: string,
  groupSlugs: string[]
): Promise<ActionResult<void>> {
  try {
    const context = await requirePermission('users:manage_groups');
    const { id } = userIdParamSchema.parse({ id: userId });
    const { groupSlugs: validated } = updateUserGroupsSchema.parse({ groupSlugs });
    await updateUserGroupsService(id, validated, context.userId);
    return { success: true, data: undefined };
  } catch (error) {
    return handleError(error, 'Failed to update user groups');
  }
}

/**
 * Deactivate a user (set status to 'inactive').
 * Requires: users:update
 */
export async function deactivateUser(userId: string): Promise<ActionResult<void>> {
  try {
    await requirePermission('users:update');
    const { id } = userIdParamSchema.parse({ id: userId });
    await deactivateUserService(id);
    return { success: true, data: undefined };
  } catch (error) {
    return handleError(error, 'Failed to deactivate user');
  }
}

/**
 * Activate a user (set status to 'active').
 * Requires: users:update
 */
export async function activateUser(userId: string): Promise<ActionResult<void>> {
  try {
    await requirePermission('users:update');
    const { id } = userIdParamSchema.parse({ id: userId });
    await activateUserService(id);
    return { success: true, data: undefined };
  } catch (error) {
    return handleError(error, 'Failed to activate user');
  }
}

/**
 * Send a password reset link to a user.
 * Requires: users:send_password_reset
 */
export async function sendPasswordReset(userId: string): Promise<ActionResult<{ link: string }>> {
  try {
    await requirePermission('users:send_password_reset');
    const { id } = userIdParamSchema.parse({ id: userId });
    const result = await sendPasswordResetLinkService(id);
    return { success: true, data: result };
  } catch (error) {
    return handleError(error, 'Failed to send password reset');
  }
}

/**
 * Send a magic link to a user.
 * Requires: users:send_magic_link
 */
export async function sendMagicLink(userId: string): Promise<ActionResult<{ link: string }>> {
  try {
    await requirePermission('users:send_magic_link');
    const { id } = userIdParamSchema.parse({ id: userId });
    const result = await sendMagicLinkService(id);
    return { success: true, data: result };
  } catch (error) {
    return handleError(error, 'Failed to send magic link');
  }
}

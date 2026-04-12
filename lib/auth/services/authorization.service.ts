/**
 * Auth Module — Authorization Service
 *
 * Permission-based guard functions for protecting server actions and API routes.
 * All guards return an AuthContext on success or throw on failure.
 * No hardcoded role strings — all checks are permission-based.
 */

import type { AuthContext } from '../types/auth.types';
import { UnauthenticatedError, ForbiddenError } from '../types/auth.types';
import { getAuthContext } from './session.service';

/**
 * Require the request to be authenticated.
 * Returns the full AuthContext (userId, email, groups, permissions).
 *
 * @throws UnauthenticatedError if no valid session
 */
export async function requireAuthenticated(): Promise<AuthContext> {
  return getAuthContext();
}

/**
 * Require the current user to have a specific permission.
 *
 * @throws UnauthenticatedError if no session
 * @throws ForbiddenError if user lacks the permission
 */
export async function requirePermission(permissionCode: string): Promise<AuthContext> {
  const context = await getAuthContext();

  if (!context.permissions.includes(permissionCode)) {
    throw new ForbiddenError(
      `Permission '${permissionCode}' is required for this operation`
    );
  }

  return context;
}

/**
 * Require the current user to have at least one of the specified permissions.
 *
 * @throws UnauthenticatedError if no session
 * @throws ForbiddenError if user lacks all of the permissions
 */
export async function requireAnyPermission(permissionCodes: string[]): Promise<AuthContext> {
  const context = await getAuthContext();

  const hasAny = permissionCodes.some((code) => context.permissions.includes(code));
  if (!hasAny) {
    throw new ForbiddenError(
      `One of the following permissions is required: ${permissionCodes.join(', ')}`
    );
  }

  return context;
}

/**
 * Require the current user to have all of the specified permissions.
 *
 * @throws UnauthenticatedError if no session
 * @throws ForbiddenError if user lacks any of the permissions
 */
export async function requireAllPermissions(permissionCodes: string[]): Promise<AuthContext> {
  const context = await getAuthContext();

  const missing = permissionCodes.filter((code) => !context.permissions.includes(code));
  if (missing.length > 0) {
    throw new ForbiddenError(
      `Missing required permissions: ${missing.join(', ')}`
    );
  }

  return context;
}

/**
 * Require the current user to be the specified user (identity check).
 *
 * @throws UnauthenticatedError if no session
 * @throws ForbiddenError if the current user is not the target user
 */
export async function requireSelf(userId: string): Promise<AuthContext> {
  const context = await getAuthContext();

  if (context.userId !== userId) {
    throw new ForbiddenError('You can only perform this action on your own account');
  }

  return context;
}

/**
 * Require the current user to either be the target user OR have a specific permission.
 * Useful for "admin or self" type operations.
 *
 * @throws UnauthenticatedError if no session
 * @throws ForbiddenError if neither condition is met
 */
export async function requireSelfOrPermission(
  userId: string,
  permissionCode: string
): Promise<AuthContext> {
  const context = await getAuthContext();

  if (context.userId === userId) {
    return context;
  }

  if (!context.permissions.includes(permissionCode)) {
    throw new ForbiddenError(
      `You must be the target user or have '${permissionCode}' permission`
    );
  }

  return context;
}

/**
 * GET    /api/auth/users/:id — Get user details
 * PATCH  /api/auth/users/:id — Update user (groups, status, profile)
 * DELETE /api/auth/users/:id — Delete user
 */

import { NextRequest } from 'next/server';
import { requirePermission } from '@/lib/auth/services/authorization.service';
import { getFullUserDetails, deleteUser } from '@/lib/auth/services/admin-user.service';
import { updateUser, updateUserGroups } from '@/lib/auth/services/user.service';
import { userIdParamSchema, updateUserProfileSchema } from '@/lib/auth/validation/auth.schemas';
import { apiSuccess, apiError } from '@/lib/auth/utils/api.utils';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    await requirePermission('users:view');
    const { id } = userIdParamSchema.parse(await context.params);
    const details = await getFullUserDetails(id);
    return apiSuccess(details);
  } catch (error) {
    return apiError(error);
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const authContext = await requirePermission('users:update');
    const { id } = userIdParamSchema.parse(await context.params);
    const body = await request.json();
    const validated = updateUserProfileSchema.parse(body);

    // Handle group updates separately (requires manage_groups permission)
    if (validated.groupSlugs) {
      await requirePermission('users:manage_groups');
      await updateUserGroups(id, validated.groupSlugs, authContext.userId);
    }

    // Handle profile field updates
    const profileUpdates: Record<string, unknown> = {};
    if (validated.full_name !== undefined) profileUpdates.full_name = validated.full_name;
    if (validated.avatar_initials !== undefined) profileUpdates.avatar_initials = validated.avatar_initials;
    if (validated.status !== undefined) profileUpdates.status = validated.status;

    if (Object.keys(profileUpdates).length > 0) {
      await updateUser(id, profileUpdates as Parameters<typeof updateUser>[1]);
    }

    // Return updated details
    const details = await getFullUserDetails(id);
    return apiSuccess(details);
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const authContext = await requirePermission('users:delete');
    const { id } = userIdParamSchema.parse(await context.params);
    await deleteUser(id, authContext.userId);
    return apiSuccess({ deleted: true });
  } catch (error) {
    return apiError(error);
  }
}

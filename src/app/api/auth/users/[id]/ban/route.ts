/**
 * POST /api/auth/users/:id/ban — Ban a user
 */

import { NextRequest } from 'next/server';
import { requirePermission } from '@/lib/auth/services/authorization.service';
import { banUser } from '@/lib/auth/services/admin-user.service';
import { userIdParamSchema } from '@/lib/auth/validation/auth.schemas';
import { apiSuccess, apiError } from '@/lib/auth/utils/api.utils';

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_request: NextRequest, context: RouteContext) {
  try {
    const authContext = await requirePermission('users:ban');
    const { id } = userIdParamSchema.parse(await context.params);
    await banUser(id, authContext.userId);
    return apiSuccess({ banned: true });
  } catch (error) {
    return apiError(error);
  }
}

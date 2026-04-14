/**
 * POST /api/auth/users/:id/reset-password — Send password reset link
 */

import { NextRequest } from 'next/server';
import { requirePermission } from '@/lib/auth/services/authorization.service';
import { sendPasswordResetLink } from '@/lib/auth/services/admin-user.service';
import { userIdParamSchema } from '@/lib/auth/validation/auth.schemas';
import { apiSuccess, apiError } from '@/lib/auth/utils/api.utils';

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_request: NextRequest, context: RouteContext) {
  try {
    await requirePermission('users:send_password_reset');
    const { id } = userIdParamSchema.parse(await context.params);
    const result = await sendPasswordResetLink(id);
    return apiSuccess(result);
  } catch (error) {
    return apiError(error);
  }
}

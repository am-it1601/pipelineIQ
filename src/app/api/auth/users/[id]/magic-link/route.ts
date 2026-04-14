/**
 * POST /api/auth/users/:id/magic-link — Send magic link
 */

import { NextRequest } from 'next/server';
import { requirePermission } from '@/lib/auth/services/authorization.service';
import { sendMagicLink } from '@/lib/auth/services/admin-user.service';
import { userIdParamSchema } from '@/lib/auth/validation/auth.schemas';
import { apiSuccess, apiError } from '@/lib/auth/utils/api.utils';

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_request: NextRequest, context: RouteContext) {
  try {
    await requirePermission('users:send_magic_link');
    const { id } = userIdParamSchema.parse(await context.params);
    const result = await sendMagicLink(id);
    return apiSuccess(result);
  } catch (error) {
    return apiError(error);
  }
}

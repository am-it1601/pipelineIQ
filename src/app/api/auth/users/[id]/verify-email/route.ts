/**
 * POST /api/auth/users/:id/verify-email — Force-verify a user's email
 */

import { NextRequest } from 'next/server';
import { requirePermission } from '@/lib/auth/services/authorization.service';
import { verifyUserEmail } from '@/lib/auth/services/admin-user.service';
import { userIdParamSchema } from '@/lib/auth/validation/auth.schemas';
import { apiSuccess, apiError } from '@/lib/auth/utils/api.utils';

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_request: NextRequest, context: RouteContext) {
  try {
    await requirePermission('users:verify_email');
    const { id } = userIdParamSchema.parse(await context.params);
    await verifyUserEmail(id);
    return apiSuccess({ verified: true });
  } catch (error) {
    return apiError(error);
  }
}

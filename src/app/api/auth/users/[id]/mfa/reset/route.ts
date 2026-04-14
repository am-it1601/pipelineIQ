/**
 * POST /api/auth/users/:id/mfa/reset — Admin reset all MFA factors for a user
 */

import { NextRequest } from 'next/server';
import { requirePermission } from '@/lib/auth/services/authorization.service';
import { adminResetAllUserFactors } from '@/lib/auth/services/mfa.service';
import { userIdParamSchema } from '@/lib/auth/validation/auth.schemas';
import { apiSuccess, apiError } from '@/lib/auth/utils/api.utils';

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_request: NextRequest, context: RouteContext) {
  try {
    await requirePermission('users:reset_mfa');
    const { id } = userIdParamSchema.parse(await context.params);
    const result = await adminResetAllUserFactors(id);
    return apiSuccess(result);
  } catch (error) {
    return apiError(error);
  }
}

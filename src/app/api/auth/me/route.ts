/**
 * GET /api/auth/me — Get current authenticated user's context
 */

import { requireAuthenticated } from '@/lib/auth/services/authorization.service';
import { getCurrentUserRecord } from '@/lib/auth/services/session.service';
import { apiSuccess, apiError } from '@/lib/auth/utils/api.utils';

export async function GET() {
  try {
    const context = await requireAuthenticated();
    const userRecord = await getCurrentUserRecord();

    return apiSuccess({
      principal: context,
      profile: userRecord,
    });
  } catch (error) {
    return apiError(error);
  }
}

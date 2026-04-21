/**
 * GET /api/auth/me/mfa/status — Get current MFA status and factors
 */

import { requireAuthenticated } from '@/lib/auth/services/authorization.service';
import { getMfaStatus } from '@/lib/auth/services/mfa.service';
import { apiSuccess, apiError } from '@/lib/auth/utils/api.utils';

export async function GET() {
  try {
    await requireAuthenticated();
    const status = await getMfaStatus();
    return apiSuccess(status);
  } catch (error) {
    return apiError(error);
  }
}

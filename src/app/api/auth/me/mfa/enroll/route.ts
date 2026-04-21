/**
 * POST /api/auth/me/mfa/enroll — Start TOTP MFA enrollment
 */

import { requireAuthenticated } from '@/lib/auth/services/authorization.service';
import { enrollTotpFactor } from '@/lib/auth/services/mfa.service';
import { apiSuccess, apiError } from '@/lib/auth/utils/api.utils';

export async function POST() {
  try {
    await requireAuthenticated();
    const result = await enrollTotpFactor();
    return apiSuccess(result, undefined, 201);
  } catch (error) {
    return apiError(error);
  }
}

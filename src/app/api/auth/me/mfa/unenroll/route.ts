/**
 * POST /api/auth/me/mfa/unenroll — Remove own MFA factor
 */

import { NextRequest } from 'next/server';
import { requireAuthenticated } from '@/lib/auth/services/authorization.service';
import { unenrollFactor } from '@/lib/auth/services/mfa.service';
import { mfaUnenrollSchema } from '@/lib/auth/validation/auth.schemas';
import { apiSuccess, apiError } from '@/lib/auth/utils/api.utils';

export async function POST(request: NextRequest) {
  try {
    await requireAuthenticated();

    const body = await request.json();
    const { factorId } = mfaUnenrollSchema.parse(body);

    await unenrollFactor(factorId);
    return apiSuccess({ unenrolled: true });
  } catch (error) {
    return apiError(error);
  }
}

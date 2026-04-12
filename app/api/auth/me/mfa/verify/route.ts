/**
 * POST /api/auth/me/mfa/verify — Verify TOTP enrollment
 */

import { NextRequest } from 'next/server';
import { requireAuthenticated } from '@/lib/auth/services/authorization.service';
import { challengeAndVerify } from '@/lib/auth/services/mfa.service';
import { mfaVerifySchema } from '@/lib/auth/validation/auth.schemas';
import { apiSuccess, apiError } from '@/lib/auth/utils/api.utils';

export async function POST(request: NextRequest) {
  try {
    await requireAuthenticated();

    const body = await request.json();
    const { factorId, code } = mfaVerifySchema.parse(body);

    await challengeAndVerify(factorId, code);
    return apiSuccess({ verified: true });
  } catch (error) {
    return apiError(error);
  }
}

'use server';

/**
 * Auth Module — MFA Actions
 *
 * Server actions for MFA (2FA) operations.
 * Self-service and admin operations.
 */

import type {
  ActionResult,
  MfaEnrollmentResult,
  MfaStatus,
} from '../types/auth.types';
import { AuthError } from '../types/auth.types';
import { requireAuthenticated, requirePermission } from '../services/authorization.service';
import {
  enrollTotpFactor,
  challengeAndVerify,
  unenrollFactor,
  getMfaStatus as getMfaStatusService,
  adminResetAllUserFactors,
} from '../services/mfa.service';
import { mfaVerifySchema, mfaUnenrollSchema, userIdParamSchema } from '../validation/auth.schemas';

// ============================================================
// Helper
// ============================================================

function handleError(error: unknown, fallback: string): ActionResult<never> {
  if (error instanceof AuthError) {
    return { success: false, error: error.message };
  }
  console.error(fallback, error);
  return { success: false, error: fallback };
}

// ============================================================
// Self-service MFA Actions
// ============================================================

/**
 * Start TOTP MFA enrollment.
 * Returns QR code, secret, and URI for the authenticator app.
 */
export async function enrollMfa(): Promise<ActionResult<MfaEnrollmentResult>> {
  try {
    await requireAuthenticated();
    const result = await enrollTotpFactor();
    return { success: true, data: result };
  } catch (error) {
    return handleError(error, 'Failed to enroll MFA');
  }
}

/**
 * Verify MFA enrollment by submitting a TOTP code.
 */
export async function verifyMfaEnrollment(input: {
  factorId: string;
  code: string;
}): Promise<ActionResult<void>> {
  try {
    await requireAuthenticated();
    const { factorId, code } = mfaVerifySchema.parse(input);
    await challengeAndVerify(factorId, code);
    return { success: true, data: undefined };
  } catch (error) {
    return handleError(error, 'Failed to verify MFA');
  }
}

/**
 * Unenroll (remove) an MFA factor.
 */
export async function unenrollMfa(factorId: string): Promise<ActionResult<void>> {
  try {
    await requireAuthenticated();
    const { factorId: validatedId } = mfaUnenrollSchema.parse({ factorId });
    await unenrollFactor(validatedId);
    return { success: true, data: undefined };
  } catch (error) {
    return handleError(error, 'Failed to unenroll MFA');
  }
}

/**
 * Get current MFA status and enrolled factors.
 */
export async function getMfaStatus(): Promise<ActionResult<MfaStatus>> {
  try {
    await requireAuthenticated();
    const status = await getMfaStatusService();
    return { success: true, data: status };
  } catch (error) {
    return handleError(error, 'Failed to get MFA status');
  }
}

// ============================================================
// Admin MFA Actions
// ============================================================

/**
 * Admin: Reset all MFA factors for a specific user.
 * Requires: users:reset_mfa
 */
export async function adminResetUserMfa(
  userId: string
): Promise<ActionResult<{ deletedCount: number }>> {
  try {
    await requirePermission('users:reset_mfa');
    const { id } = userIdParamSchema.parse({ id: userId });
    const result = await adminResetAllUserFactors(id);
    return { success: true, data: result };
  } catch (error) {
    return handleError(error, 'Failed to reset user MFA');
  }
}

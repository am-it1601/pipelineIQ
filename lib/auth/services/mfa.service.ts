/**
 * Auth Module — MFA Service
 *
 * Handles Multi-Factor Authentication (TOTP) operations.
 * Self-service: enroll, verify, unenroll, status
 * Admin: list factors, delete factor, reset all factors
 */

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import type { MfaEnrollmentResult, MfaStatus, MfaFactor } from '../types/auth.types';
import { AuthError, NotFoundError } from '../types/auth.types';

// ============================================================
// Self-Service MFA Operations
// ============================================================

/**
 * Start TOTP factor enrollment. Returns QR code and secret for the user
 * to add to their authenticator app.
 */
export async function enrollTotpFactor(): Promise<MfaEnrollmentResult> {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.mfa.enroll({
    factorType: 'totp',
  });

  if (error || !data) {
    throw new AuthError(
      `Failed to enroll MFA: ${error?.message ?? 'Unknown error'}`,
      'MFA_ENROLL_FAILED',
      500
    );
  }

  return {
    factorId: data.id,
    qrCode: data.totp.qr_code,
    secret: data.totp.secret,
    uri: data.totp.uri,
  };
}

/**
 * Challenge and verify a TOTP factor in a single step.
 * Used during enrollment confirmation and subsequent logins.
 */
export async function challengeAndVerify(
  factorId: string,
  code: string
): Promise<void> {
  const supabase = await createClient();

  // Create challenge
  const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
    factorId,
  });

  if (challengeError || !challengeData) {
    throw new AuthError(
      `MFA challenge failed: ${challengeError?.message ?? 'Unknown error'}`,
      'MFA_CHALLENGE_FAILED',
      500
    );
  }

  // Verify
  const { error: verifyError } = await supabase.auth.mfa.verify({
    factorId,
    challengeId: challengeData.id,
    code,
  });

  if (verifyError) {
    throw new AuthError(
      `MFA verification failed: ${verifyError.message}`,
      'MFA_VERIFY_FAILED',
      400
    );
  }
}

/**
 * Unenroll (remove) a factor from the current user's account.
 */
export async function unenrollFactor(factorId: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase.auth.mfa.unenroll({ factorId });

  if (error) {
    throw new AuthError(
      `Failed to unenroll factor: ${error.message}`,
      'MFA_UNENROLL_FAILED',
      500
    );
  }
}

/**
 * Get the current user's MFA status and enrolled factors.
 */
export async function getMfaStatus(): Promise<MfaStatus> {
  const supabase = await createClient();

  const { data: aalData, error: aalError } =
    await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

  if (aalError) {
    throw new AuthError(
      `Failed to get MFA status: ${aalError.message}`,
      'MFA_STATUS_FAILED',
      500
    );
  }

  const { data: factorsData, error: factorsError } =
    await supabase.auth.mfa.listFactors();

  if (factorsError) {
    throw new AuthError(
      `Failed to list factors: ${factorsError.message}`,
      'MFA_LIST_FAILED',
      500
    );
  }

  const factors: MfaFactor[] = [
    ...(factorsData.totp ?? []).map(mapFactor),
    ...(factorsData.phone ?? []).map(mapFactor),
  ];

  return {
    currentLevel: aalData.currentLevel ?? 'aal1',
    nextLevel: aalData.nextLevel ?? 'aal1',
    factors,
  };
}

// ============================================================
// Admin MFA Operations
// ============================================================

/**
 * Admin: list all MFA factors for a user.
 */
export async function adminListUserFactors(userId: string): Promise<MfaFactor[]> {
  const supabase = createAdminClient();

  const { data, error } = await supabase.auth.admin.mfa.listFactors({ userId });

  if (error) {
    throw new AuthError(
      `Failed to list user factors: ${error.message}`,
      'MFA_ADMIN_LIST_FAILED',
      500
    );
  }

  return (data.factors ?? []).map(mapFactor);
}

/**
 * Admin: delete a specific MFA factor for a user.
 */
export async function adminDeleteUserFactor(
  userId: string,
  factorId: string
): Promise<void> {
  const supabase = createAdminClient();

  const { error } = await supabase.auth.admin.mfa.deleteFactor({
    userId,
    id: factorId,
  });

  if (error) {
    throw new AuthError(
      `Failed to delete factor: ${error.message}`,
      'MFA_ADMIN_DELETE_FAILED',
      500
    );
  }
}

/**
 * Admin: reset all MFA factors for a user (delete all).
 */
export async function adminResetAllUserFactors(userId: string): Promise<{ deletedCount: number }> {
  const factors = await adminListUserFactors(userId);

  for (const factor of factors) {
    await adminDeleteUserFactor(userId, factor.id);
  }

  return { deletedCount: factors.length };
}

// ============================================================
// Helpers
// ============================================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapFactor(f: any): MfaFactor {
  return {
    id: f.id,
    type: f.factor_type ?? f.type ?? 'totp',
    friendly_name: f.friendly_name ?? null,
    status: f.status ?? 'unverified',
    created_at: f.created_at,
    updated_at: f.updated_at,
  };
}

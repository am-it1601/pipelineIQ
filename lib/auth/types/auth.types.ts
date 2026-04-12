/**
 * Auth Module — Type Definitions & Error Classes
 *
 * Central type definitions for the authentication & authorization module.
 * All types are auth-specific and independent of existing application types.
 */

// ============================================================
// Role & Permission Types (DB-driven, no hardcoded strings)
// ============================================================

/** User status in public.users */
export type UserStatus = 'active' | 'inactive' | 'suspended';

// ============================================================
// Auth Context Types
// ============================================================

/** Authenticated principal from Supabase auth session */
export interface AuthContext {
  userId: string;
  email: string;
  groups: string[];       // group slugs loaded from DB
  permissions: string[];  // permission codes loaded from DB
}

/** User record from public.users table */
export interface UserRecord {
  id: string;
  email: string;
  full_name: string;
  avatar_initials: string;
  status: UserStatus;
  created_at: string;
  updated_at: string;
}

/** Full user details enriched with auth data and group/permission info */
export interface UserWithDetails {
  user: UserRecord;
  groups: GroupInfo[];
  permissions: string[];
  auth: {
    email_confirmed_at: string | null;
    last_sign_in_at: string | null;
    banned_until: string | null;
    created_at: string;
  };
  mfa: {
    enabled: boolean;
    factorCount: number;
  };
}

/** Group summary info */
export interface GroupInfo {
  id: string;
  slug: string;
  display_name: string;
  description: string | null;
  is_system: boolean;
}

/** Permission record */
export interface PermissionInfo {
  id: string;
  code: string;
  display_name: string;
  description: string | null;
  category: string;
}

/** Paginated user list response */
export interface PaginatedUsers {
  users: UserWithDetails[];
  total: number;
  page: number;
  perPage: number;
  lastPage: number;
}

// ============================================================
// MFA Types
// ============================================================

export interface MfaFactor {
  id: string;
  type: 'totp' | 'phone';
  friendly_name: string | null;
  status: 'verified' | 'unverified';
  created_at: string;
  updated_at: string;
}

export interface MfaEnrollmentResult {
  factorId: string;
  qrCode: string;     // SVG data URL for QR code
  secret: string;      // TOTP secret for manual entry
  uri: string;         // otpauth:// URI
}

export interface MfaStatus {
  currentLevel: 'aal1' | 'aal2';
  nextLevel: 'aal1' | 'aal2';
  factors: MfaFactor[];
}

// ============================================================
// Action & API Response Types
// ============================================================

/** Server action return type */
export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

/** API success response (OpenAPI standard) */
export interface ApiSuccessResponse<T> {
  data: T;
  meta?: Record<string, unknown>;
}

/** API error response (OpenAPI standard) */
export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
  };
}

// ============================================================
// Error Classes
// ============================================================

export class AuthError extends Error {
  public readonly code: string;
  public readonly statusCode: number;

  constructor(message: string, code: string, statusCode: number = 500) {
    super(message);
    this.name = 'AuthError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

export class UnauthenticatedError extends AuthError {
  constructor(message = 'Authentication required') {
    super(message, 'UNAUTHENTICATED', 401);
    this.name = 'UnauthenticatedError';
  }
}

export class ForbiddenError extends AuthError {
  constructor(message = 'Insufficient permissions') {
    super(message, 'FORBIDDEN', 403);
    this.name = 'ForbiddenError';
  }
}

export class NotFoundError extends AuthError {
  constructor(message = 'Resource not found') {
    super(message, 'NOT_FOUND', 404);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends AuthError {
  constructor(message = 'Resource conflict') {
    super(message, 'CONFLICT', 409);
    this.name = 'ConflictError';
  }
}

export class ValidationError extends AuthError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR', 400);
    this.name = 'ValidationError';
  }
}

/**
 * Auth Module — Zod Validation Schemas
 *
 * All input validation schemas for auth-related operations.
 * Used at the action/route handler level before calling services.
 */

import { z } from 'zod';

// ============================================================
// User Management Schemas
// ============================================================

/** Invite a new user */
export const inviteUserSchema = z.object({
  email: z.string().email('Invalid email address').transform((v) => v.toLowerCase().trim()),
  groupSlug: z.string().min(1, 'Group is required').trim(),
  fullName: z.string().trim().optional(),
});

export type InviteUserInput = z.infer<typeof inviteUserSchema>;

/** Update user groups */
export const updateUserGroupsSchema = z.object({
  groupSlugs: z.array(z.string().min(1)).min(1, 'At least one group is required'),
});

export type UpdateUserGroupsInput = z.infer<typeof updateUserGroupsSchema>;

/** Update user status */
export const updateUserStatusSchema = z.object({
  status: z.enum(['invited', 'active', 'suspended']),
});

export type UpdateUserStatusInput = z.infer<typeof updateUserStatusSchema>;

/** Update user profile fields */
export const updateUserProfileSchema = z.object({
  full_name: z.string().trim().min(1).optional(),
  avatar_initials: z.string().trim().max(3).optional(),
  status: z.enum(['invited', 'active', 'suspended']).optional(),
  groupSlugs: z.array(z.string().min(1)).min(1).optional(),
});

export type UpdateUserProfileInput = z.infer<typeof updateUserProfileSchema>;

// ============================================================
// Query / Pagination Schemas
// ============================================================

/** Pagination parameters */
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(100).default(50),
});

export type PaginationInput = z.infer<typeof paginationSchema>;

/** User listing query parameters */
export const listUsersQuerySchema = paginationSchema.extend({
  status: z.enum(['invited', 'active', 'suspended']).optional(),
  group: z.string().min(1).optional(),
  search: z.string().min(1).optional(),
});

export type ListUsersQueryInput = z.infer<typeof listUsersQuerySchema>;

/** User ID path parameter */
export const userIdParamSchema = z.object({
  id: z.string().uuid('Invalid user ID'),
});

export type UserIdParamInput = z.infer<typeof userIdParamSchema>;

// ============================================================
// MFA Schemas
// ============================================================

/** Verify MFA enrollment */
export const mfaVerifySchema = z.object({
  factorId: z.string().uuid('Invalid factor ID'),
  code: z.string().length(6, 'Code must be 6 digits').regex(/^\d{6}$/, 'Code must be numeric'),
});

export type MfaVerifyInput = z.infer<typeof mfaVerifySchema>;

/** Unenroll MFA factor */
export const mfaUnenrollSchema = z.object({
  factorId: z.string().uuid('Invalid factor ID'),
});

export type MfaUnenrollInput = z.infer<typeof mfaUnenrollSchema>;

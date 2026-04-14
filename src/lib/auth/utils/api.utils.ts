/**
 * Auth Module — API Utilities
 *
 * Shared helpers for API route handlers.
 * Provides consistent OpenAPI-standard JSON responses.
 */

import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { AuthError } from '../types/auth.types';

/**
 * Create a success response with optional metadata.
 */
export function apiSuccess<T>(data: T, meta?: Record<string, unknown>, status = 200) {
  const body: { data: T; meta?: Record<string, unknown> } = { data };
  if (meta) body.meta = meta;
  return NextResponse.json(body, { status });
}

/**
 * Handle errors and return an OpenAPI-standard error response.
 * Supports AuthError (domain), ZodError (validation), and generic errors.
 */
export function apiError(error: unknown): NextResponse {
  // Domain errors (AuthError, NotFoundError, ConflictError, ForbiddenError)
  if (error instanceof AuthError) {
    return NextResponse.json(
      { error: { code: error.code, message: error.message } },
      { status: error.statusCode }
    );
  }

  // Zod validation errors
  if (error instanceof ZodError) {
    const firstIssue = error.issues[0];
    const message = firstIssue
      ? `${firstIssue.path.join('.')}: ${firstIssue.message}`
      : 'Validation failed';

    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message, details: error.issues } },
      { status: 400 }
    );
  }

  // Generic errors
  const message = error instanceof Error ? error.message : 'An unexpected error occurred';
  console.error('Unhandled API error:', error);
  return NextResponse.json(
    { error: { code: 'INTERNAL_ERROR', message } },
    { status: 500 }
  );
}

/**
 * Auth Module — API Utilities
 *
 * Shared helpers for API route handlers.
 * Provides consistent OpenAPI-standard JSON responses.
 */

import { NextResponse } from 'next/server';
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
 */
export function apiError(error: unknown): NextResponse {
  if (error instanceof AuthError) {
    return NextResponse.json(
      { error: { code: error.code, message: error.message } },
      { status: error.statusCode }
    );
  }

  console.error('Unhandled API error:', error);
  return NextResponse.json(
    { error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } },
    { status: 500 }
  );
}

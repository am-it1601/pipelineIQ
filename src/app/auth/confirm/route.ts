import { type EmailOtpType } from '@supabase/supabase-js';
import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /auth/confirm
 *
 * Handles the Supabase email confirmation callback.
 * Exchanges the token_hash for a session, then redirects
 * to /onboarding (for invites) or /dashboard (for other types).
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;

  const redirectTo = request.nextUrl.clone();
  redirectTo.searchParams.delete('token_hash');
  redirectTo.searchParams.delete('type');

  if (token_hash && type) {
    const supabase = await createClient();

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });

    if (!error) {
      // For invite type, redirect to onboarding so the user can set password & name
      if (type === 'invite') {
        redirectTo.pathname = '/onboarding';
      } else {
        redirectTo.pathname = '/dashboard';
      }
      return NextResponse.redirect(redirectTo);
    }

    // If error, check if it's an expired link
    if (error.message.includes('expired') || error.message.includes('invalid')) {
      redirectTo.pathname = '/invite-expired';
      return NextResponse.redirect(redirectTo);
    }
  }

  // Fallback — redirect to the invite-expired page
  redirectTo.pathname = '/invite-expired';
  return NextResponse.redirect(redirectTo);
}

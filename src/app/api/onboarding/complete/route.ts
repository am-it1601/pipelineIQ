import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { acceptInvitation } from '@/lib/auth/services/admin-user.service';

/**
 * POST /api/onboarding/complete
 *
 * Called when the invited user finishes the onboarding form.
 * Body: { first_name, last_name, password }
 *
 * The user is already signed-in via the Supabase magic link at this point.
 * This route:
 *   1. Sets the user's password
 *   2. Updates public.users: status → 'active', full_name, avatar_initials
 *   3. Sets invitation_accepted_at
 */
export async function POST(req: NextRequest) {
  try {
    // The user should already be authenticated via the magic link
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated. Please use the invitation link.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { first_name, last_name, password } = body as {
      first_name: string;
      last_name: string;
      password: string;
    };

    if (!first_name?.trim() || !last_name?.trim() || !password) {
      return NextResponse.json(
        { error: 'First name, last name, and password are required.' },
        { status: 400 }
      );
    }

    // Password policy: min 8 chars, 1 special, 1 number
    const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
    if (!passwordRegex.test(password)) {
      return NextResponse.json(
        {
          error:
            'Password must be at least 8 characters with 1 number and 1 special character.',
        },
        { status: 400 }
      );
    }

    const full_name = `${first_name.trim()} ${last_name.trim()}`;
    const avatar_initials = `${first_name[0]}${last_name[0]}`.toUpperCase();

    // 1. Set the user's password
    const { error: pwError } = await supabase.auth.updateUser({ password });
    if (pwError) {
      return NextResponse.json(
        { error: `Failed to set password: ${pwError.message}` },
        { status: 500 }
      );
    }

    // 2. Accept invitation — sets status='active', updates profile, marks accepted_at
    await acceptInvitation({
      userId: user.id,
      fullName: full_name,
      avatarInitials: avatar_initials,
    });

    return NextResponse.json({ success: true, redirect: '/dashboard' });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Onboarding failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

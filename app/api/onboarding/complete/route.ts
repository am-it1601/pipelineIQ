import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { markInvitationAccepted } from '@/lib/services/invitations.service';

/**
 * POST /api/onboarding/complete
 *
 * Called when the invited user finishes the onboarding form.
 * Body: { first_name, last_name, password }
 *
 * The user is already signed-in via the Supabase magic link at this point.
 * This route:
 *   1. Updates the user's password
 *   2. Upserts their profile row (full_name, role, avatar_initials)
 *   3. If role = bd_member → inserts into bd_members
 *   4. Marks the invitation as accepted
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

    // Determine the role from the user's metadata (set during invite)
    const role = user.user_metadata?.role ?? 'bd_member';
    const profileRole = role === 'admin' ? 'admin' : 'bd';

    // 1. Set the user's password
    const { error: pwError } = await supabase.auth.updateUser({ password });
    if (pwError) {
      return NextResponse.json(
        { error: `Failed to set password: ${pwError.message}` },
        { status: 500 }
      );
    }

    const adminSupabase = createAdminClient();

    // 2. Update auth user metadata
    await adminSupabase.auth.admin.updateUserById(user.id, {
      user_metadata: { full_name, role },
    });

    // 3. Upsert profile row
    const { error: profileError } = await adminSupabase.from('profiles').upsert(
      {
        id: user.id,
        email: user.email!,
        full_name,
        avatar_initials,
        role: profileRole,
        status: 'active',
      },
      { onConflict: 'id' }
    );

    if (profileError) {
      console.error('Profile upsert error:', profileError);
      return NextResponse.json(
        { error: 'Failed to create your profile.' },
        { status: 500 }
      );
    }

    // 4. If BD member, insert into bd_members table
    if (role === 'bd_member') {
      const { error: bdError } = await adminSupabase.from('bd_members').insert({
        full_name,
        email: user.email!,
        avatar_initials,
        status: 'active',
        user_id: user.id,
        monthly_target: 50,
        incentive_eligible: true,
        join_date: new Date().toISOString().split('T')[0],
      });

      if (bdError) {
        console.error('BD member insert error:', bdError);
        // Non-fatal if it's a duplicate
        if (!bdError.message.includes('duplicate')) {
          return NextResponse.json(
            { error: 'Failed to create BD member record.' },
            { status: 500 }
          );
        }
      }
    }

    // 5. Mark invitation as accepted
    await markInvitationAccepted(adminSupabase, user.email!);

    return NextResponse.json({ success: true, redirect: '/dashboard' });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Onboarding failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import {
  getInvitations,
  createInvitation,
} from '@/lib/services/invitations.service';
import type { InvitationRole } from '@/lib/types';

/**
 * GET /api/invitations
 * Returns all invitations. Admin only.
 */
export async function GET() {
  try {
    // Verify the caller is admin
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const adminSupabase = createAdminClient();
    const invitations = await getInvitations(adminSupabase);
    return NextResponse.json(invitations);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * POST /api/invitations
 * Body: { email: string, role: 'admin' | 'bd_member' }
 */
export async function POST(req: NextRequest) {
  try {
    // Verify the caller is admin
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { email, role } = body as { email: string; role: InvitationRole };

    if (!email || !role) {
      return NextResponse.json(
        { error: 'Email and role are required' },
        { status: 400 }
      );
    }

    if (!['admin', 'bd_member'].includes(role)) {
      return NextResponse.json(
        { error: 'Role must be "admin" or "bd_member"' },
        { status: 400 }
      );
    }

    const adminSupabase = createAdminClient();
    const invitation = await createInvitation(adminSupabase, {
      email,
      role,
      invitedBy: user.id,
    });

    return NextResponse.json(invitation, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create invitation';
    const status = message.includes('already') ? 409 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

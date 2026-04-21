import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import {
  resendInvitation,
  revokeInvitation,
} from '@/lib/services/invitations.service';

/**
 * PATCH /api/invitations/[id]
 * Body: { action: 'resend' | 'revoke' }
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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
    const { action } = body as { action: 'resend' | 'revoke' };

    if (!action || !['resend', 'revoke'].includes(action)) {
      return NextResponse.json(
        { error: 'Action must be "resend" or "revoke"' },
        { status: 400 }
      );
    }

    const adminSupabase = createAdminClient();

    let result;
    if (action === 'resend') {
      result = await resendInvitation(adminSupabase, id);
    } else {
      result = await revokeInvitation(adminSupabase, id);
    }

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

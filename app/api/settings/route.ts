import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import {
  getInvitationExpiryDays,
  updateInvitationExpiryDays,
} from '@/lib/services/app-settings.service';

/**
 * GET /api/settings
 * Returns app settings relevant to the current feature.
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const expiryDays = await getInvitationExpiryDays(supabase);
    return NextResponse.json({ invitation_expiry_days: expiryDays });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * PATCH /api/settings
 * Body: { invitation_expiry_days: number }
 * Admin only.
 */
export async function PATCH(req: NextRequest) {
  try {
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
    const { invitation_expiry_days } = body;

    if (invitation_expiry_days !== undefined) {
      const days = Number(invitation_expiry_days);
      if (isNaN(days) || days < 1 || days > 365) {
        return NextResponse.json(
          { error: 'Expiry days must be between 1 and 365' },
          { status: 400 }
        );
      }
      const adminSupabase = createAdminClient();
      await updateInvitationExpiryDays(adminSupabase, days);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

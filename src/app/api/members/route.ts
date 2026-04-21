import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getMembers, createMemberRecord } from '@/lib/services/members.service';

export async function GET() {
  try {
    const supabase = createAdminClient();
    const members = await getMembers(supabase);
    return NextResponse.json(members);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { full_name, email, status, monthly_target, incentive_eligible, join_date } = body;

    if (!email || !full_name) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const member = await createMemberRecord(supabase, {
      full_name,
      email,
      status,
      monthly_target,
      incentive_eligible,
      join_date,
    });

    return NextResponse.json(member, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create member';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

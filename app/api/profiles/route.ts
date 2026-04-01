import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getProfiles, createProfileRecord } from '@/lib/services/profiles.service';

export async function GET() {
  try {
    const supabase = createAdminClient();
    const profiles = await getProfiles(supabase);
    return NextResponse.json(profiles);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { profile_name, profile_link, focus_area, skill_tags, status } = body;

    if (!profile_name) {
      return NextResponse.json({ error: 'Profile name is required' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const profile = await createProfileRecord(supabase, {
      profile_name,
      profile_link,
      focus_area,
      skill_tags,
      status,
    });

    return NextResponse.json(profile, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Insert failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { queryLeads, createLeadRecord } from '@/lib/services/leads.service';
import type { LeadFiltersInput } from '@/lib/services/leads.service';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const filters: LeadFiltersInput = {
      member: searchParams.get('member') ?? searchParams.get('memberId') ?? undefined,
      status: searchParams.get('status') ?? undefined,
      source: searchParams.get('source') ?? undefined,
      engagement: searchParams.get('engagement') ?? undefined,
      bid_type: searchParams.get('bid_type') ?? undefined,
      profile: searchParams.get('profile') ?? undefined,
      hot: searchParams.get('hot') === 'true' ? true : undefined,
      search: searchParams.get('search') ?? undefined,
    };

    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
    const pageSize = Math.min(200, Math.max(1, parseInt(searchParams.get('pageSize') ?? '20', 10)));
    const sortBy = searchParams.get('sortBy') ?? 'created_at';
    const sortDir = searchParams.get('sortDir') === 'asc' ? 'asc' : 'desc';

    const supabase = createAdminClient();
    const result = await queryLeads(supabase, { page, pageSize, filters, sortBy, sortDir });

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const supabase = createAdminClient();

    const lead = await createLeadRecord(supabase, {
      date: body.date,
      project_title: body.project_title,
      lead_source: body.lead_source,
      upwork_link: body.upwork_link,
      profile_used_id: body.profile_used_id,
      assigned_to_id: body.assigned_to_id,
      engagement_type: body.engagement_type,
      proposal_value: body.proposal_value,
      hourly_rate: body.hourly_rate,
      estimated_hours: body.estimated_hours,
      connects_used: body.connects_used,
      bid_type: body.bid_type,
      status: body.status,
      remarks: body.remarks,
      is_hot: body.is_hot,
      created_by_user_id: body.created_by_user_id,
      updated_by_user_id: body.updated_by_user_id,
    });

    return NextResponse.json(lead, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Insert failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

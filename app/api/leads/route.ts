import { NextRequest, NextResponse } from 'next/server';
import { leadsStore } from '@/lib/store/serverStore';
import { generateId } from '@/lib/utils';
import type { LeadLogEntry } from '@/lib/types';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const memberId = searchParams.get('memberId');
  let leads = leadsStore.getAll();
  if (memberId) leads = leads.filter((l) => l.assignedToId === memberId);
  return NextResponse.json(leads);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const now = new Date().toISOString();
  const newLead: LeadLogEntry = {
    ...body,
    id: generateId(),
    createdAt: now,
    updatedAt: now,
  };
  leadsStore.create(newLead);
  return NextResponse.json(newLead, { status: 201 });
}

import { NextRequest, NextResponse } from 'next/server';
import { membersStore } from '@/lib/store/serverStore';
import type { BDMember } from '@/lib/types';

export async function GET() {
  return NextResponse.json(membersStore.getAll());
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const id = `bd${Date.now()}`;
  const member: BDMember = { ...body, id };
  membersStore.create(member);
  return NextResponse.json(member, { status: 201 });
}

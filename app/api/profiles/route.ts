import { NextRequest, NextResponse } from 'next/server';
import { profilesStore } from '@/lib/store/serverStore';
import type { UpworkProfile } from '@/lib/types';

export async function GET() {
  return NextResponse.json(profilesStore.getAll());
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const id = `p${Date.now()}`;
  const profile: UpworkProfile = { ...body, id };
  profilesStore.create(profile);
  return NextResponse.json(profile, { status: 201 });
}

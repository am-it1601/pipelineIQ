import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { markNotificationRead } from "@/lib/services/notifications.service";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(_req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const supabase = createAdminClient();
    await markNotificationRead(supabase, id);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to mark read";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

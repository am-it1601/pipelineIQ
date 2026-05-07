import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getNotifications, markAllNotificationsRead } from "@/lib/services/notifications.service";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const supabase = createAdminClient();
    const notifications = await getNotifications(supabase, userId);
    return NextResponse.json(notifications);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch notifications";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId } = body as { userId: string };
    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const supabase = createAdminClient();
    await markAllNotificationsRead(supabase, userId);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update notifications";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

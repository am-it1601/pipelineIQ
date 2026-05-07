import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { deleteLeadComment } from "@/lib/services/lead-comments.service";

type RouteContext = { params: Promise<{ id: string; commentId: string }> };

export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  try {
    const { commentId } = await params;
    const supabase = createAdminClient();
    await deleteLeadComment(supabase, commentId);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete comment";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

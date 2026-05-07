import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  getLeadComments,
  createLeadComment,
  parseMentions,
} from "@/lib/services/lead-comments.service";
import { createMentionNotifications } from "@/lib/services/notifications.service";
import { getLeadById } from "@/lib/services/leads.service";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const supabase = createAdminClient();
    const comments = await getLeadComments(supabase, id);
    return NextResponse.json(comments);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch comments";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: RouteContext) {
  try {
    const { id: leadId } = await params;
    const body = await req.json();

    const { author_id, content, parent_id } = body as { author_id: string; content: string; parent_id?: string | null };
    if (!author_id || !content?.trim()) {
      return NextResponse.json({ error: "author_id and content are required" }, { status: 400 });
    }

    const supabase = createAdminClient();

    const comment = await createLeadComment(supabase, {
      lead_id: leadId,
      author_id,
      content: content.trim(),
      parent_id: parent_id || null,
    });

    const mentionedNames = parseMentions(content);
    if (mentionedNames.length > 0) {
      const lead = await getLeadById(supabase, leadId).catch(() => null);
      const senderName = comment.author?.full_name ?? "Someone";
      await createMentionNotifications(supabase, {
        mentionedNames,
        senderId: author_id,
        senderName,
        leadId,
        leadTitle: lead?.project_title ?? "a lead",
        commentId: comment.id,
        commentPreview: content.length > 80 ? content.slice(0, 80) + "…" : content,
      });
    }

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create comment";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

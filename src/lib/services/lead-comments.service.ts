import type { SupabaseClient } from "@supabase/supabase-js";

// ============================================================
// TYPES
// ============================================================

export interface CommentAuthor {
  id: string;
  full_name: string;
  avatar_initials: string;
}

export interface LeadComment {
  id: string;
  lead_id: string;
  author_id: string;
  content: string;
  parent_id?: string | null;
  created_at: string;
  updated_at: string;
  author?: CommentAuthor | null;
}

export interface CreateCommentData {
  lead_id: string;
  author_id: string;
  content: string;
  parent_id?: string | null;
}

// ============================================================
// SERVICE FUNCTIONS
// ============================================================

/**
 * Fetch all comments for a lead, newest first.
 */
export async function getLeadComments(
  supabase: SupabaseClient,
  leadId: string
): Promise<LeadComment[]> {
  const { data, error } = await supabase
    .from("lead_comments")
    .select(`
      *,
      author:users(
        id,
        full_name,
        avatar_initials
      )
    `)
    .eq("lead_id", leadId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(`Failed to fetch comments: ${error.message}`);
  return (data ?? []) as unknown as LeadComment[];
}

/**
 * Insert a new comment. Returns the created row with author joined.
 */
export async function createLeadComment(
  supabase: SupabaseClient,
  data: CreateCommentData
): Promise<LeadComment> {
  const { data: row, error } = await supabase
    .from("lead_comments")
    .insert({
      lead_id: data.lead_id,
      author_id: data.author_id,
      content: data.content,
      parent_id: data.parent_id || null,
    })
    .select(`
      *,
      author:users(
        id,
        full_name,
        avatar_initials
      )
    `)
    .single();

  if (error || !row) throw new Error(`Failed to create comment: ${error?.message}`);
  return row as unknown as LeadComment;
}

/**
 * Delete a comment by ID (author must match for non-admin usage).
 */
export async function deleteLeadComment(
  supabase: SupabaseClient,
  commentId: string
): Promise<void> {
  const { error } = await supabase.from("lead_comments").delete().eq("id", commentId);
  if (error) throw new Error(`Failed to delete comment: ${error.message}`);
}

/**
 * Parse @mentions from a comment string.
 * Returns an array of mentioned usernames (the word after @).
 */
export function parseMentions(content: string): string[] {
  const matches = content.match(/@(\w+)/g) ?? [];
  return [...new Set(matches.map((m) => m.slice(1)))];
}

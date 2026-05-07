import type { SupabaseClient } from "@supabase/supabase-js";

// ============================================================
// TYPES — matched to the real DB schema
// notifications columns: id, user_id, from_user_id, comment_id,
//   lead_id, message, is_read, created_at, type, title
// ============================================================

export interface AppNotification {
  id: string;
  user_id: string;        // recipient
  from_user_id: string | null; // sender
  type: "mention" | "comment" | "system";
  title: string;
  message: string;        // body
  lead_id: string | null;
  comment_id: string | null;
  is_read: boolean;
  created_at: string;
  sender?: {
    full_name: string;
    avatar_initials: string;
  } | null;
}

export interface CreateNotificationData {
  user_id: string;
  from_user_id?: string | null;
  type: "mention" | "comment" | "system";
  title: string;
  message: string;
  lead_id?: string | null;
  comment_id?: string | null;
}

// ============================================================
// SERVICE FUNCTIONS
// ============================================================

/**
 * Fetch notifications for a user, newest first.
 */
export async function getNotifications(
  supabase: SupabaseClient,
  userId: string,
  limit = 30
): Promise<AppNotification[]> {
  const { data, error } = await supabase
    .from("notifications")
    .select(`
      *,
      sender:users!notifications_from_user_id_fkey(
        full_name,
        avatar_initials
      )
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(`Failed to fetch notifications: ${error.message}`);
  return (data ?? []) as unknown as AppNotification[];
}

/**
 * Mark a single notification as read.
 */
export async function markNotificationRead(
  supabase: SupabaseClient,
  notificationId: string
): Promise<void> {
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", notificationId);

  if (error) throw new Error(`Failed to mark notification read: ${error.message}`);
}

/**
 * Mark ALL notifications for a user as read.
 */
export async function markAllNotificationsRead(
  supabase: SupabaseClient,
  userId: string
): Promise<void> {
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", userId)
    .eq("is_read", false);

  if (error) throw new Error(`Failed to mark all notifications read: ${error.message}`);
}

/**
 * Bulk-create mention notifications for tagged users.
 * Looks up users whose full_name matches the @mentioned words.
 */
export async function createMentionNotifications(
  supabase: SupabaseClient,
  opts: {
    mentionedNames: string[];
    senderId: string;
    senderName: string;
    leadId: string;
    leadTitle: string;
    commentId: string;
    commentPreview: string;
  }
): Promise<void> {
  if (!opts.mentionedNames.length) return;

  const orFilters = opts.mentionedNames
    .map((name) => `full_name.ilike.%${name}%`)
    .join(",");

  const { data: users, error: userErr } = await supabase
    .from("users")
    .select("id")
    .or(orFilters)
    .neq("id", opts.senderId);

  if (userErr || !users?.length) return;

  const rows = users.map((u) => ({
    user_id: u.id,
    from_user_id: opts.senderId,
    type: "mention" as const,
    title: `${opts.senderName} mentioned you`,
    message: `In "${opts.leadTitle}": ${opts.commentPreview}`,
    lead_id: opts.leadId,
    comment_id: opts.commentId,
    is_read: false,
  }));

  await supabase.from("notifications").insert(rows);
}

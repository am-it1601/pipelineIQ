import type { BDMember } from "@/types/types";
import type { SupabaseClient } from "@supabase/supabase-js";

// ============================================================
// MAPPER
// ============================================================

/**
 * Single authoritative DB row → BDMember mapper.
 * Used by both Server Actions and API Routes.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any

// ============================================================
// SERVICE FUNCTIONS
// ============================================================

export function mapRowToMember(row: Record<string, any>): BDMember {
  return { ...row, status: row.status ?? "active" } as BDMember;
}

/**
 * Returns a list of BD members (role = 'bd').
 */
export async function getMembers(supabase: SupabaseClient, options: any = {}): Promise<BDMember[]> {
  let query = supabase
    .from("bd_members")
    .select(
      "id, full_name, email, status, monthly_target, incentive_eligible, join_date, avatar_initials, created_at, updated_at"
    )
    .eq("is_deleted", false)
    .order("full_name", { ascending: true });

  if (options.active !== undefined) {
    query = query.eq("status", options.active ? "active" : "inactive");
  }

  const { data, error } = await query;
  if (error) throw new Error(`Failed to fetch BD members: ${error.message}`);
  return (data ?? []).map(mapRowToMember);
}

/**
 * Fetches a single BD member by profile ID. Throws if not found.
 */
export async function getMemberById(supabase: SupabaseClient, id: string): Promise<BDMember> {
  const { data, error } = await supabase.from("bd_members").select("*").eq("id", id).single();

  if (error || !data) throw new Error("Member not found");
  return mapRowToMember(data);
}

export interface CreateMemberData {
  full_name: string;
  email: string;
  status?: "active" | "inactive";
  monthly_target?: number;
  incentive_eligible?: boolean;
  join_date?: string;
}

/**
 * Creates a new Supabase Auth user and seeds the auto-created profile row.
 * Returns the new BDMember.
 *
 * NOTE: Requires an admin client — the Supabase Auth Admin API is needed.
 */
export async function createMemberRecord(
  supabase: SupabaseClient,
  data: CreateMemberData
): Promise<BDMember> {
  const {
    full_name,
    email,
    status = "active",
    monthly_target = 50,
    incentive_eligible = true,
    join_date = new Date().toISOString().split("T")[0],
  } = data;

  const avatar_initials = full_name.substring(0, 2).toUpperCase();

  const { data: inserted, error } = await supabase
    .from("bd_members")
    .insert({
      full_name,
      email,
      status,
      monthly_target,
      incentive_eligible,
      join_date,
      avatar_initials,
    })
    .select()
    .single();

  if (error || !inserted) throw new Error(error?.message ?? "Failed to create BD member");

  return mapRowToMember(inserted);
}

export interface UpdateMemberData {
  full_name?: string;
  status?: "active" | "inactive";
  monthly_target?: number;
  incentive_eligible?: boolean;
  join_date?: string;
}

/**
 * Updates a BD member profile row. Also syncs name to Auth metadata when changed.
 * Returns the updated BDMember.
 */
export async function updateMemberRecord(
  supabase: SupabaseClient,
  id: string,
  patch: UpdateMemberData
): Promise<BDMember> {
  const dbPatch: Record<string, unknown> = {};
  if (patch.full_name !== undefined) dbPatch.full_name = patch.full_name;
  if (patch.full_name !== undefined) dbPatch.full_name = patch.full_name;
  if (patch.status !== undefined) dbPatch.status = patch.status;
  if (patch.monthly_target !== undefined) dbPatch.monthly_target = patch.monthly_target;
  if (patch.incentive_eligible !== undefined) dbPatch.incentive_eligible = patch.incentive_eligible;
  if (patch.join_date !== undefined) dbPatch.join_date = patch.join_date;

  const { data, error } = await supabase
    .from("bd_members")
    .update(dbPatch)
    .eq("id", id)
    .select()
    .single();

  if (error || !data) throw new Error("Member not found or update failed");

  // Sync full_name to Auth metadata if changed
  if (patch.full_name !== undefined) {
    await supabase.auth.admin.updateUserById(id, {
      user_metadata: { full_name: patch.full_name },
    });
  }

  return mapRowToMember(data);
}

/**
 * Deletes a BD member's Auth user (cascades to profile via DB trigger).
 */
export async function deleteMemberRecord(supabase: SupabaseClient, id: string): Promise<void> {
  const { error } = await supabase.auth.admin.deleteUser(id);
  if (error) throw new Error(`Failed to delete member: ${error.message}`);
}

export async function deactivateMember(superbase: SupabaseClient, id: string): Promise<void> {
  // TRANSACTION STARTS
  // TODO : Ban User from authentication.
  // TODO : If BD Member : Then mark bd_member as inactive.
  // TRANSACTION COMMIT
}

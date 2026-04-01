import type { SupabaseClient } from "@supabase/supabase-js";
import type { BDMember } from "@/lib/types";

// ============================================================
// MAPPER
// ============================================================

/**
 * Single authoritative DB row → BDMember mapper.
 * Used by both Server Actions and API Routes.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapRowToMember(row: Record<string, any>): BDMember {
  return { ...row, status: row.status ?? 'active' } as BDMember;
}

// ============================================================
// SERVICE FUNCTIONS
// ============================================================

export interface GetMembersOptions {
  /** Filter by active/inactive status. Omit to return all. */
  active?: boolean;
}

/**
 * Returns a list of BD members (role = 'bd').
 */
export async function getMembers(
  supabase: SupabaseClient,
  options: GetMembersOptions = {}
): Promise<BDMember[]> {
  let query = supabase
    .from("profiles")
    .select("id, full_full_name, email, status, monthly_target, incentive_eligible, join_date")
    .eq("role", "bd")
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
export async function getMemberById(
  supabase: SupabaseClient,
  id: string
): Promise<BDMember> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();

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

  const tempPassword = `Temp@${Math.random().toString(36).slice(-8)}!`;

  const { data: authData, error: authError } =
    await supabase.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        full_name: name,
        role: "bd",
        avatar_initials: full_name.substring(0, 2).toUpperCase(),
      },
    });

  if (authError || !authData.user)
    throw new Error(authError?.message ?? "Failed to create auth user");

  const userId = authData.user.id;

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      status,
      monthly_target: monthly_target,
      incentive_eligible: incentive_eligible,
      join_date: join_date,
    })
    .eq("id", userId);

  if (profileError)
    throw new Error(`Failed to update profile: ${profileError.message}`);

  return { id: userId, full_name, email, status, monthly_target, incentive_eligible, join_date, avatar_initials: '', bd_member_id: null, created_at: '', updated_at: '', role: 'bd' } as BDMember;
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
  if (patch.monthly_target !== undefined)
    dbPatch.monthly_target = patch.monthly_target;
  if (patch.incentive_eligible !== undefined)
    dbPatch.incentive_eligible = patch.incentive_eligible;
  if (patch.join_date !== undefined) dbPatch.join_date = patch.join_date;

  const { data, error } = await supabase
    .from("profiles")
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
export async function deleteMemberRecord(
  supabase: SupabaseClient,
  id: string
): Promise<void> {
  const { error } = await supabase.auth.admin.deleteUser(id);
  if (error) throw new Error(`Failed to delete member: ${error.message}`);
}

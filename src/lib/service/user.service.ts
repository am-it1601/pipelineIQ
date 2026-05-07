import { BDMember } from "@/types/types";
import type { SupabaseClient } from "@supabase/supabase-js";

export interface GetMembersOptions {
  /** Filter by active/inactive status. Omit to return all. */
  active?: boolean;
}

export const toggleUserActivationStatus = async (
  supabase: SupabaseClient,
  options: {
    id: string;
    active: boolean;
  }
) => {
  const status = options.active ? "active" : "inactive";

  const { data, error } = await supabase
    .from("bd_members")
    .update({ status })
    .eq("id", options.id)
    .select()
    .single();

  if (error || !data) throw new Error(error?.message ?? "Failed to update user status");

  return data;
};

export async function getUsersFromDb(
  supabase: SupabaseClient,
  options: GetMembersOptions = {}
): Promise<BDMember[]> {

  let query = supabase
    .from("users")
    .select("id, email, full_name, avatar_initials, status, created_at, updated_at")
    .order("full_name", { ascending: true });

  if (options.active !== undefined) {
    query = query.eq("status", options.active ? "active" : "inactive");
  }

  const { data: users, error } = await query;

  if (error) throw new Error(`Failed to fetch users: ${error.message}`);

  return (users ?? []).map(mapRowToMember);
}

export function mapRowToMember(row: Record<string, any>): BDMember {
  return {
    ...row,
    full_name: row.full_name || row.email || "Unknown User",
    status: row.status ?? "active",
  } as BDMember;
}

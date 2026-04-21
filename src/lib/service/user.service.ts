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
  // Fetch users from Supabase authentication system
  const {
    data: { users },
    error,
  } = await supabase.auth.admin.listUsers();

  if (error) throw new Error(`Failed to fetch users: ${error.message}`);

  let filteredUsers = (users ?? []).map((user: any) => ({
    id: user.id,
    email: user.email,
    full_name: user.user_metadata?.full_name ?? "",
    avatar_initials: user.user_metadata?.avatar_initials ?? "",
    status: user.user_metadata?.status ?? "active",
    created_at: user.created_at,
    updated_at: user.updated_at,
  }));

  // Filter by active/inactive status if provided
  if (options.active !== undefined) {
    filteredUsers = filteredUsers.filter((user) => (user.status === "active") === options.active);
  }

  return filteredUsers.map(mapRowToMember);
}

export function mapRowToMember(row: Record<string, any>): BDMember {
  return { ...row, status: row.status ?? "active" } as BDMember;
}

import type { UpworkProfile } from "@/types/types";
import type { SupabaseClient } from "@supabase/supabase-js";

// ============================================================
// MAPPER
// ============================================================

/**
 * Single authoritative DB row → UpworkProfile mapper.
 * Used by both Server Actions and API Routes.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any

// ============================================================
// SERVICE FUNCTIONS
// ============================================================

export interface GetProfilesOptions {
  /** Filter by active/inactive status. Omit to return all. */
  active?: boolean;
}

/**
 * Returns a list of Upwork profiles.
 */
export async function getProfiles(
  supabase: SupabaseClient,
  options: GetProfilesOptions = {}
): Promise<UpworkProfile[]> {
  let query = supabase
    .from("upwork_profiles")
    .select("*")
    .order("name", { ascending: true })
    .order("created_at", { ascending: false });

  if (options.active !== undefined) {
    query = query.eq("is_active", options.active);
  }

  const { data, error } = await query;
  if (error) throw new Error(`Failed to fetch Upwork profiles: ${error.message}`);
  return data;
}

/**
 * Fetches a single Upwork profile by ID. Throws if not found.
 */
export async function getProfileById(supabase: SupabaseClient, id: string): Promise<UpworkProfile> {
  const { data, error } = await supabase.from("upwork_profiles").select("*").eq("id", id).single();

  if (error || !data) throw new Error("Profile not found");
  return data;
}

export interface CreateProfileData {
  profile_name: string;
  profile_link?: string;
  focus_area?: string;
  skill_tags?: string;
  status?: "active" | "inactive";
}

/**
 * Inserts a new Upwork profile. Returns the created UpworkProfile.
 */
export async function createProfileRecord(
  supabase: SupabaseClient,
  data: CreateProfileData
): Promise<UpworkProfile> {
  const { data: row, error } = await supabase
    .from("upwork_profiles")
    .insert({
      profile_name: data.profile_name,
      profile_link: data.profile_link,
      focus_area: data.focus_area ?? "",
      skill_tags: data.skill_tags,
      status: data.status ?? "active",
    })
    .select()
    .single();

  if (error || !row) throw new Error(`Failed to create profile: ${error?.message}`);
  return row;
}

export interface UpdateProfileData {
  profile_name?: string;
  profile_link?: string;
  focus_area?: string;
  skill_tags?: string;
  status?: "active" | "inactive";
}

/**
 * Partially updates an Upwork profile by ID. Returns the updated UpworkProfile.
 */
export async function updateProfileRecord(
  supabase: SupabaseClient,
  id: string,
  patch: UpdateProfileData
): Promise<UpworkProfile> {
  const dbPatch: Record<string, unknown> = {};
  if (patch.profile_name !== undefined) dbPatch.profile_name = patch.profile_name;
  if (patch.profile_link !== undefined) dbPatch.profile_link = patch.profile_link;
  if (patch.focus_area !== undefined) dbPatch.focus_area = patch.focus_area;
  if (patch.skill_tags !== undefined) dbPatch.skill_tags = patch.skill_tags;
  if (patch.status !== undefined) dbPatch.status = patch.status;

  const { data, error } = await supabase
    .from("upwork_profiles")
    .update(dbPatch)
    .eq("id", id)
    .select()
    .single();

  if (error || !data) throw new Error("Profile not found or update failed");
  return data;
}

/**
 * Deletes an Upwork profile by ID.
 */
export async function deleteProfileRecord(supabase: SupabaseClient, id: string): Promise<void> {
  const { error } = await supabase.from("upwork_profiles").delete().eq("id", id);
  if (error) throw new Error(`Failed to delete profile: ${error.message}`);
}

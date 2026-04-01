"use server";

import { createClient } from "@/lib/supabase/server";
import { getMembers } from "../services/members.service";
import { getProfiles } from "../services/profiles.service";
import type { BDMember, UpworkProfile } from "../types";
import { handleError } from "../utils";

export const getBDMembers = async ({
  active,
}: {
  active?: boolean;
} = {}): Promise<BDMember[]> => {
  try {
    const supabase = await createClient();
    return await getMembers(supabase, { active });
  } catch (error) {
    console.error("Error fetching BD members:", error);
    handleError(error);
    return [];
  }
};

export const getUpworkProfiles = async ({
  active,
}: {
  active?: boolean;
} = {}): Promise<UpworkProfile[]> => {
  try {
    const supabase = await createClient();
    return await getProfiles(supabase, { active });
  } catch (error) {
    console.error("Error fetching Upwork profiles:", error);
    handleError(error);
    return [];
  }
};

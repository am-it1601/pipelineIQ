"use server";

import { createClient } from "@/lib/supabase/server";
import type { BDMember } from "../../types/types";
import { getMembers } from "../services/members.service";
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

"use server";

import { UpworkProfile } from "../../types/types";
import { getProfiles } from "../services/profiles.service";
import { createClient } from "../supabase/server";
import { handleError } from "../utils";

export const getUpworkProfiles = async (): Promise<UpworkProfile[]> => {
  try {
    const supabase = await createClient();
    return await getProfiles(supabase);
  } catch (error) {
    console.error("Error fetching Upwork profiles:", error);
    handleError(error);
    return [];
  }
};

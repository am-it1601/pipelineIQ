"use server";
import { BDMember } from "@/types/types";
import { revalidatePath } from "next/cache";
import { getUsersFromDb, toggleUserActivationStatus } from "../service/user.service";
import { createAdminClient } from "../supabase/admin";
import { handleError } from "../utils";

export const toggleActivation = async (id: string, status: boolean) => {
  try {
    const supabase = await createClient();
    const result = await toggleUserActivationStatus(supabase, { id, active: status });

    revalidatePath("/roaster");
    return { success: true, data: result };
  } catch (error) {
    console.error("Error fetching BD members:", error);
    handleError(error);
  }
};

export const getUsers = async (): Promise<BDMember[]> => {
  try {
    const supabase = createAdminClient();
    return await getUsersFromDb(supabase, {});
  } catch (error) {
    console.error("Error fetching BD members:", error);
    handleError(error);
    return [];
  }
};

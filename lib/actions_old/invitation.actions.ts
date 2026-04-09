"use server";

import { getInvitations } from "../services/invitations.service";
import { createClient } from "../supabase/server";
import { handleError } from "../utils";

export const getInvitationsList = async () => {
  try {
    const supabase = await createClient();
    return await getInvitations(supabase);
  } catch (error) {
    console.error("Error fetching invitations:", error);
    handleError(error);
    return [];
  }
};

export const createInvitation = async () => {
  // TODO: implement
};
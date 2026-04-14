/**
 * @deprecated This service is deprecated. Use `lib/auth/services/admin-user.service.ts` instead.
 * Invitations are now managed via the `public.users` table (status='invited').
 * This file is retained for reference only and should not receive new writes.
 */

import type { Invitation, InvitationRole } from "@/types/types";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getInvitationExpiryDays } from "./app-settings.service";

// ============================================================
// MAPPER
// ============================================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRowToInvitation(row: Record<string, any>): Invitation {
  // When joined with profiles, the inviter name comes as a nested object
  const inviterProfile = row.profiles ?? row.inviter;
  return {
    ...row,
    role: row.role as InvitationRole,
    status: row.status,
    invited_by: {
      full_name: inviterProfile?.full_name ?? null,
      avatar_initials: inviterProfile?.full_name?.substring(0, 2).toUpperCase() ?? "U",
    },
  } as Invitation;
}

// ============================================================
// SERVICE FUNCTIONS
// ============================================================

/**
 * Lists all invitations, ordered by created_at DESC.
 * Joins the inviter's profile name.
 * Excludes soft-deleted invitations.
 */
export async function getInvitations(supabase: SupabaseClient): Promise<Invitation[]> {
  const { data, error } = await supabase
    .from("invitations")
    .select("*, profiles:invited_by(full_name)")
    .eq("is_deleted", false)
    .order("created_at", { ascending: false });

  if (error) {
    console.log(error);
  }
  return (data ?? []).map(mapRowToInvitation);
}

/**
 * Creates a new invitation and sends the Supabase invite email.
 *
 * @param adminSupabase - A Supabase client initialised with the service role key.
 */
export async function createInvitation(
  adminSupabase: SupabaseClient,
  params: {
    email: string;
    role: InvitationRole;
    invitedBy: string; // auth.uid() of the admin
  }
): Promise<Invitation> {
  const { email, role, invitedBy } = params;

  // 1. Check for duplicate pending/accepted invitation (excluding soft-deleted)
  const { data: existing } = await adminSupabase
    .from("invitations")
    .select("id, status")
    .eq("email", email)
    .in("status", ["pending", "accepted"])
    .is("deleted_at", null)
    .maybeSingle();

  if (existing) {
    if (existing.status === "accepted") {
      throw new Error("This email has already accepted an invitation.");
    }
    throw new Error("A pending invitation already exists for this email.");
  }

  // 2. Read configurable expiry
  const expiryDays = await getInvitationExpiryDays(adminSupabase);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + expiryDays);

  // 3. Send invite via Supabase Auth Admin API
  const { data: authData, error: authError } = await adminSupabase.auth.admin.inviteUserByEmail(
    email,
    {
      data: { role, invited_by: invitedBy },
      redirectTo: `${process.env.NEXT_PUBLIC_SUPABASE_URL ? process.env.NEXT_PUBLIC_SITE_URL : "http://localhost:3000"}/onboarding`,
    }
  );

  if (authError) {
    throw new Error(`Failed to send invitation email: ${authError.message}`);
  }

  // 4. Insert invitation record for tracking
  const { data: invitation, error: insertError } = await adminSupabase
    .from("invitations")
    .insert({
      email,
      role,
      invited_by: invitedBy,
      expires_at: expiresAt.toISOString(),
      status: "pending",
    })
    .select("*, profiles:invited_by(full_name)")
    .single();

  if (insertError || !invitation) {
    throw new Error(insertError?.message ?? "Failed to create invitation record");
  }

  return mapRowToInvitation(invitation);
}

/**
 * Resends an invitation email. Increments resent_count and resets expires_at.
 * Cannot resend soft-deleted or already accepted invitations.
 */
export async function resendInvitation(
  adminSupabase: SupabaseClient,
  invitationId: string
): Promise<Invitation> {
  // 1. Fetch existing invitation
  const { data: inv, error: fetchError } = await adminSupabase
    .from("invitations")
    .select("*")
    .eq("id", invitationId)
    .is("deleted_at", null)
    .single();

  if (fetchError || !inv) throw new Error("Invitation not found");
  if (inv.status === "accepted") throw new Error("Invitation already accepted");
  if (inv.status === "revoked") throw new Error("Invitation has been revoked");

  // 2. Re-send via Supabase Auth Admin API
  const { error: authError } = await adminSupabase.auth.admin.inviteUserByEmail(inv.email, {
    data: { role: inv.role, invited_by: inv.invited_by },
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/onboarding`,
  });

  if (authError) {
    throw new Error(`Failed to resend invitation email: ${authError.message}`);
  }

  // 3. Update invitation record
  const expiryDays = await getInvitationExpiryDays(adminSupabase);
  const newExpiry = new Date();
  newExpiry.setDate(newExpiry.getDate() + expiryDays);

  const { data: updated, error: updateError } = await adminSupabase
    .from("invitations")
    .update({
      status: "pending",
      expires_at: newExpiry.toISOString(),
      resent_count: (inv.resent_count ?? 0) + 1,
    })
    .eq("id", invitationId)
    .select("*, profiles:invited_by(full_name)")
    .single();

  if (updateError || !updated) throw new Error("Failed to update invitation record");
  return mapRowToInvitation(updated);
}

/**
 * Soft-deletes an invitation by setting deleted_at timestamp.
 */
export async function revokeInvitation(
  adminSupabase: SupabaseClient,
  invitationId: string
): Promise<Invitation> {
  const { data, error } = await adminSupabase
    .from("invitations")
    .update({ deleted_at: new Date().toISOString(), is_deleted: true })
    .eq("id", invitationId)
    .select("*, profiles:invited_by(full_name)")
    .single();

  console.log("Revoke invitation result:", { data, error });
  if (error || !data) throw new Error("Failed to revoke invitation");
  return mapRowToInvitation(data);
}

/**
 * Marks an invitation as accepted. Called during onboarding completion.
 * Does not update soft-deleted invitations.
 */
export async function markInvitationAccepted(
  adminSupabase: SupabaseClient,
  email: string
): Promise<void> {
  const { error } = await adminSupabase
    .from("invitations")
    .update({ status: "accepted", accepted_at: new Date().toISOString() })
    .eq("email", email)
    .eq("status", "pending")
    .is("deleted_at", null);

  if (error) {
    console.error("Failed to mark invitation as accepted:", error.message);
    // Non-fatal — the important part (user creation) already succeeded
  }
}

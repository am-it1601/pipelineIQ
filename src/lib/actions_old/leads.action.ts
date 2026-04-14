"use server";

import { LeadFormInput, leadFormSchema } from "@//components/leads/lead.schema";
import { revalidatePath } from "next/cache";
import type { LeadFiltersInput, PaginatedLeadsResponse } from "../services/leads.service";
import { createLeadRecord, queryLeads, updateLeadRecord } from "../services/leads.service";
import { createClient } from "../supabase/server";

export async function createLead(formData: LeadFormInput) {
  // Validate and transform the input data
  const validatedData = leadFormSchema.parse(formData);

  const supabase = await createClient();

  // Get the current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error("User not authenticated");
  }

  // Fetch user's role from profiles table to determine assigned_to_id
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    throw new Error("Failed to fetch user profile");
  }

  const userRole = profile.role;
  // Admins can assign to anyone; BD members are auto-assigned to themselves
  const assigned_to_id = userRole === "admin" ? validatedData.assigned_to_id : user.id;

  const data = await createLeadRecord(supabase, {
    date: validatedData.lead_date,
    project_title: validatedData.lead_title,
    lead_source: validatedData.lead_source,
    upwork_link: validatedData.lead_upwork_link ?? null,
    profile_used_id: null, // TODO: get from user profile or form
    assigned_to_id,
    engagement_type: validatedData.engagement_type,
    proposal_value: validatedData.lead_budget ?? null,
    hourly_rate: validatedData.proposed_hourly_rate ?? null,
    estimated_hours: validatedData.proposed_duration ? validatedData.proposed_duration * 160 : null,
    connects_used: validatedData.lead_connect ?? null,
    bid_type: validatedData.bid_type ?? null,
    status: "New",
    remarks: validatedData.lead_remarks ?? null,
    is_hot: false,
    created_by_user_id: user.id,
    updated_by_user_id: user.id,
  });

  revalidatePath("/leads");

  return data;
}

export async function getLeads(
  page: number = 1,
  pageSize: number = 20,
  filters?: LeadFiltersInput
): Promise<PaginatedLeadsResponse> {
  const supabase = await createClient();

  // Auth check — getUser validates the session; RLS policies handle row filtering
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error("User not authenticated");
  }

  return queryLeads(supabase, { page, pageSize, filters });
}

export async function toggleLeadHotStatus(leadId: string, is_hot: boolean) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("User not authenticated");

  await updateLeadRecord(supabase, leadId, { is_hot });
  revalidatePath("/leads");
}

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { LeadFormInput, LeadFormValues, leadFormSchema } from '../components/leads/lead.schema';
import { LeadLogEntry } from "@/types/types";
import { useCreateLead, useUpdateLead } from "./http/leads/lead.mutations";
import { useAuth } from "./client/useAuth";
import { toast } from "sonner";

export function useLeadForm(initialLead?: LeadLogEntry) {
  const currentUser = useAuth();
  const createLead = useCreateLead();
  const updateLead = useUpdateLead();

  const isEditing = !!initialLead;

  const form = useForm<LeadFormInput>({
    resolver: zodResolver(leadFormSchema),
    shouldUnregister: true,
    mode: "all",
    defaultValues: {
      lead_date: initialLead?.date || new Date().toISOString().split('T')[0],
      lead_source: initialLead?.lead_source || undefined,
      lead_title: initialLead?.project_title || "",
      engagement_type: initialLead?.engagement_type || "Fixed",

      // Upwork-specific
      lead_upwork_link: initialLead?.upwork_link || "",
      lead_connect: initialLead?.connects_used || undefined,
      bid_type: initialLead?.bid_type || "Normal",

      // Engagement-specific
      proposed_hourly_rate: initialLead?.hourly_rate || undefined,
      proposed_duration: initialLead?.estimated_hours || undefined,
      lead_budget: initialLead?.proposal_value || undefined,

      lead_remarks: initialLead?.remarks || "",
      assigned_to_id: initialLead?.assigned_to_id || "",
    },
  });

  const lead_source = form.watch("lead_source");
  const engagement_type = form.watch("engagement_type");
  const proposedHourlyRate = form.watch("proposed_hourly_rate");
  const proposedDuration = form.watch("proposed_duration");
  
  const computedLeadBudget = useMemo(() => {
    const hourly = Number(proposedHourlyRate);
    const duration = Number(proposedDuration);
    if (engagement_type !== "Hourly") return undefined;
    if (!Number.isFinite(hourly) || !Number.isFinite(duration)) return undefined;
    if (hourly <= 0 || duration <= 0) return undefined;

    // Assumption: monthly contract value = hourly rate × duration in months × 160 hours
    return hourly * duration * 160;
  }, [engagement_type, proposedHourlyRate, proposedDuration]);

  useEffect(() => {
    if (engagement_type === "Hourly" && computedLeadBudget !== undefined) {
      form.setValue("lead_budget", computedLeadBudget, { shouldValidate: true, shouldDirty: true });
    }
  }, [engagement_type, computedLeadBudget]);

  const onSubmit = async (data: LeadFormValues, onSuccess?: () => void) => {
    if (!currentUser) {
      toast.error("You must be logged in to perform this action.");
      return;
    }

    try {
      // Map form data to API structure
      const payload = {
        date: data.lead_date,
        project_title: data.lead_title,
        lead_source: data.lead_source,
        upwork_link: data.lead_upwork_link || null,
        assigned_to_id: data.assigned_to_id,
        engagement_type: data.engagement_type,
        proposal_value: data.lead_budget || null,
        hourly_rate: data.proposed_hourly_rate || null,
        estimated_hours: data.proposed_duration || null,
        connects_used: data.lead_connect ?? 0,
        bid_type: data.bid_type ?? "Normal",
        status: initialLead?.status || "Submitted",
        remarks: data.lead_remarks || null,
        created_by_user_id: initialLead?.created_by_user_id || currentUser.id,
        updated_by_user_id: currentUser.id,
        is_hot: initialLead?.is_hot ?? false,
      };

      if (isEditing && initialLead) {
        await updateLead.mutateAsync({ id: initialLead.id, data: payload });
        toast.success("Lead updated successfully!");
      } else {
        await createLead.mutateAsync(payload);
        toast.success("Lead created successfully!");
      }

      if (!isEditing) form.reset();
      onSuccess?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred.");
    }
  };

  return {
    form,
    lead_source,
    engagement_type,
    computedLeadBudget,
    onSubmit,
    isSubmitting: createLead.isPending || updateLead.isPending,
    isEditing,
  };
}
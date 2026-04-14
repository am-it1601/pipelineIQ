"use client"
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { LeadFormInput, leadFormSchema } from '../components/leads/lead.schema';

export function useLeadForm() {
  const form = useForm<LeadFormInput>({
    resolver: zodResolver(leadFormSchema),
    shouldUnregister: true,
    mode: "all",
    defaultValues: {
      lead_date: "",
      lead_source: undefined,
      lead_title: "",
      engagement_type: "Fixed",

      // Upwork-specific
      lead_upwork_link: "",
      lead_connect: undefined,
      bid_type: "Normal",

      // Engagement-specific
      proposed_hourly_rate: undefined,
      proposed_duration: undefined,
      lead_budget: undefined,

      lead_remarks: "",
      assigned_to_id: "",
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
    console.log("Calling Use Effect");
    if (engagement_type === "Hourly" && computedLeadBudget !== undefined) {
      form.setValue("lead_budget", computedLeadBudget, { shouldValidate: true, shouldDirty: true });
    }
    if (engagement_type !== "Hourly") {
      // keep manual budget path clean
      form.resetField("lead_budget", { defaultValue: undefined, keepDirty: false, keepTouched: false, keepError: false });
    }
  }, [engagement_type, computedLeadBudget]);

  return {
    form,
    lead_source,
    engagement_type,
    computedLeadBudget,
  };
}
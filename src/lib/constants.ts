import { BidType, EngagementType, LeadSource, LeadStatus } from "../types/types";

export const LEAD_SOURCES: LeadSource[] = ["Upwork", "Referral", "LinkedIn", "Direct"] as const;
export const BID_TYPES: BidType[] = ["Normal", "Boosted"] as const;
export const ENGAGEMENT_TYPES: EngagementType[] = ["Fixed", "Hourly"] as const;
export const STATUSES: LeadStatus[] = [
  "Submitted",
  "Viewed",
  "Discussion",
  "Follow Up",
  "Waiting Client",
  "Won",
  "Lost",
] as const;

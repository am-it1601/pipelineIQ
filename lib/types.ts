import { Database } from '@/lib/supabase/database.types';

// ============================================================
// USER & AUTH TYPES
// ============================================================

export type UserRole = "admin" | "bd";

export type User = Database['public']['Tables']['profiles']['Row'] & {
  role: UserRole;
};

// ============================================================
// BD MEMBER TYPES
// ============================================================

export type MemberStatus = "active" | "inactive";

export type OmittedBDMember = Omit<Database['public']['Tables']['profiles']['Row'], 'status'>;
export interface BDMember extends OmittedBDMember {
  status: MemberStatus;
}

// ============================================================
// UPWORK PROFILE TYPES
// ============================================================

export type ProfileStatus = "active" | "inactive";

export type OmittedUpworkProfile = Omit<Database['public']['Tables']['upwork_profiles']['Row'], 'status'>;
export interface UpworkProfile extends OmittedUpworkProfile {
  status: ProfileStatus;
}

// ============================================================
// LEAD LOG ENTRY TYPES
// ============================================================

export type LeadSource = "Upwork" | "Referral" | "LinkedIn" | "Direct";
export type BidType = "Normal" | "Boosted";
export type EngagementType = "Fixed" | "Hourly";
export type LeadStatus =
  | "Submitted"
  | "Viewed"
  | "Discussion"
  | "Follow Up"
  | "Waiting Client"
  | "Won"
  | "Lost";

// We extract and augment the raw DB row just to provide stricter string literal types
// instead of just `string`.
export type RawLeadLogEntry = Database['public']['Tables']['lead_logs']['Row'];

export interface LeadLogEntry extends Omit<RawLeadLogEntry, 'lead_source' | 'engagement_type' | 'bid_type' | 'status'> {
  lead_source: LeadSource;
  engagement_type: EngagementType;
  bid_type: BidType;
  status: LeadStatus;
  assignee?: { full_name: string; avatar_initials: string } | null;
}

export type NewLeadEntry = Database['public']['Tables']['lead_logs']['Insert'];

// ============================================================
// KPI METRIC TYPES
// ============================================================

export interface ActivityKPIs {
  totalBids: number;
  weeklyBids: number;
  monthlyBids: number;
  totalConnectsUsed: number;
  avgBidsPerBD: number;
}

export interface EngagementKPIs {
  viewedCount: number;
  discussionCount: number;
  followUpCount: number;
  viewRate: number;
  discussionRate: number;
  clientResponseRate: number;
}

export interface ConversionKPIs {
  wonCount: number;
  lostCount: number;
  winRate: number;
  lossRate: number;
  discussionToWinRate: number;
  bidsPerWin: number;
}

export interface CostKPIs {
  avgConnectsPerBid: number;
  connectsPerWin: number;
  revenuePerConnect: number;
  boostedBidCount: number;
  normalBidCount: number;
  boostedWinRate: number;
  normalWinRate: number;
}

export interface PipelineKPIs {
  activeLeadsCount: number;
  pipelineValue: number;
  expectedRevenue: number;
  wonValue: number;
}

export interface WeeklyMetric {
  weekLabel: string;
  weekStart: string;
  bids: number;
  wins: number;
  connects_used: number;
  viewedCount: number;
}

export interface MonthlyMetric {
  monthLabel: string;
  month: string;
  bids: number;
  wins: number;
  connects_used: number;
  pipelineValue: number;
}

export interface FunnelStep {
  stage: string;
  count: number;
  rate: number;
}

export interface BDPerformanceRow {
  memberId: string;
  memberName: string;
  totalBids: number;
  wonCount: number;
  winRate: number;
  viewRate: number;
  totalConnects: number;
  pipelineValue: number;
  monthly_target: number;
  targetCompletion: number;
}

export interface ProfilePerformanceRow {
  profileId: string;
  profile_name: string;
  totalBids: number;
  wonCount: number;
  winRate: number;
  totalConnects: number;
  boostedBids: number;
  normalBids: number;
  pipelineValue: number;
}

// ============================================================
// FILTER TYPES
// ============================================================

export interface LeadFilters {
  dateFrom?: string;
  dateTo?: string;
  memberId?: string;
  profileId?: string;
  leadSource?: LeadSource | "";
  status?: LeadStatus | "";
  bidType?: BidType | "";
  search?: string;
}

// ============================================================
// PERMISSIONS
// ============================================================

export type Permission =
  | "viewAllLeads"
  | "editAnyLead"
  | "deleteAnyLead"
  | "viewTeamAnalytics"
  | "manageBDMembers"
  | "manageProfiles"
  | "viewComparisons"
  | "viewPipelineTeam";

export type LeadFilter = {
  status: string;
  date_from: Date;
  date_to: Date;
  assigned_to_id: String;
  lead_source: String;
};

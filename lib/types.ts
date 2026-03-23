// ============================================================
// USER & AUTH TYPES
// ============================================================

export type UserRole = 'admin' | 'bd';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  bdMemberId: string | null;
  avatarInitials: string;
}

// ============================================================
// BD MEMBER TYPES
// ============================================================

export type MemberStatus = 'active' | 'inactive';

export interface BDMember {
  id: string;
  name: string;
  status: MemberStatus;
  monthlyTarget: number;
  incentiveEligible: boolean;
  joinDate: string;
}

// ============================================================
// UPWORK PROFILE TYPES
// ============================================================

export type ProfileStatus = 'active' | 'inactive';

export interface UpworkProfile {
  id: string;
  profileName: string;
  status: ProfileStatus;
  focusArea: string;
}

// ============================================================
// LEAD LOG ENTRY TYPES
// ============================================================

export type LeadSource = 'Upwork' | 'Referral' | 'LinkedIn' | 'Direct';
export type BidType = 'Normal' | 'Boosted';
export type EngagementType = 'Fixed' | 'Hourly';
export type LeadStatus =
  | 'Submitted'
  | 'Viewed'
  | 'Discussion'
  | 'Follow Up'
  | 'Waiting Client'
  | 'Won'
  | 'Lost';

export interface LeadLogEntry {
  id: string;
  date: string; // YYYY-MM-DD
  projectTitle: string;
  leadSource: LeadSource;
  upworkLink?: string;
  profileUsedId?: string;
  assignedToId: string;

  /** Engagement type: Fixed (project price) or Hourly (rate × hours) */
  engagementType: EngagementType;

  /** For Fixed: the total project value. For Hourly: hourlyRate × estimatedHours (auto-computed). */
  proposalValue: number;

  /** Hourly bids only: proposed $/hr rate */
  hourlyRate?: number;

  /** Hourly bids only: estimated engagement duration in hours */
  estimatedHours?: number;

  connectsUsed: number;
  bidType: BidType;
  status: LeadStatus;
  remarks?: string;
  /** Starred/hot lead — surfaces in dashboard quick panels */
  isHot?: boolean;
  createdByUserId: string;
  updatedByUserId: string;
  createdAt: string;
  updatedAt: string;
}

export type NewLeadEntry = Omit<LeadLogEntry, 'id' | 'createdAt' | 'updatedAt'>;

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
  connectsUsed: number;
  viewedCount: number;
}

export interface MonthlyMetric {
  monthLabel: string;
  month: string;
  bids: number;
  wins: number;
  connectsUsed: number;
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
  monthlyTarget: number;
  targetCompletion: number;
}

export interface ProfilePerformanceRow {
  profileId: string;
  profileName: string;
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
  leadSource?: LeadSource | '';
  status?: LeadStatus | '';
  bidType?: BidType | '';
  search?: string;
}

// ============================================================
// PERMISSIONS
// ============================================================

export type Permission =
  | 'viewAllLeads'
  | 'editAnyLead'
  | 'deleteAnyLead'
  | 'viewTeamAnalytics'
  | 'manageBDMembers'
  | 'manageProfiles'
  | 'viewComparisons'
  | 'viewPipelineTeam';

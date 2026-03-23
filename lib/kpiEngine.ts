/**
 * KPI Engine — Pure calculation functions.
 * All functions are side-effect free: they accept arrays of LeadLogEntry
 * and return typed metric objects. No UI dependencies.
 */

import type {
  LeadLogEntry,
  User,
  BDMember,
  UpworkProfile,
  ActivityKPIs,
  EngagementKPIs,
  ConversionKPIs,
  CostKPIs,
  PipelineKPIs,
  WeeklyMetric,
  MonthlyMetric,
  FunnelStep,
  BDPerformanceRow,
  ProfilePerformanceRow,
} from '@/lib/types';
import {
  getWeekKey,
  getWeekLabel,
  getMonthKey,
  getMonthLabel,
  getCurrentWeekStart,
  getCurrentMonthKey,
} from '@/lib/utils';
import { subWeeks, subMonths, format, addWeeks, addMonths, parseISO } from 'date-fns';

// ─── Scoping ─────────────────────────────────────────────────────────────────

/**
 * Returns leads visible to the given user.
 * - Admins see all leads.
 * - BD users see only their own (matched via bdMemberId).
 */
export function getScopedLeads(leads: LeadLogEntry[], user: User): LeadLogEntry[] {
  if (user.role === 'admin') return leads;
  return leads.filter((l) => l.assignedToId === user.bdMemberId);
}

// ─── Active leads helper ──────────────────────────────────────────────────────

/** A lead is "active" if it is not Won or Lost */
function isActive(lead: LeadLogEntry): boolean {
  return lead.status !== 'Won' && lead.status !== 'Lost';
}

// ─── Activity KPIs ────────────────────────────────────────────────────────────

export function getActivityKPIs(
  leads: LeadLogEntry[],
  activeBDCount: number
): ActivityKPIs {
  const now = new Date();
  const currentWeek = getCurrentWeekStart();
  const currentMonth = getCurrentMonthKey();

  const weeklyBids = leads.filter((l) => getWeekKey(l.date) === currentWeek).length;
  const monthlyBids = leads.filter((l) => getMonthKey(l.date) === currentMonth).length;
  const totalConnectsUsed = leads.reduce((sum, l) => sum + l.connectsUsed, 0);

  void now; // suppress unused warning

  return {
    totalBids: leads.length,
    weeklyBids,
    monthlyBids,
    totalConnectsUsed,
    avgBidsPerBD: activeBDCount > 0 ? Math.round(leads.length / activeBDCount) : 0,
  };
}

// ─── Engagement KPIs ─────────────────────────────────────────────────────────

export function getEngagementKPIs(leads: LeadLogEntry[]): EngagementKPIs {
  const total = leads.length;
  const viewedCount = leads.filter(
    (l) => l.status === 'Viewed' || l.status === 'Discussion' || l.status === 'Won'
  ).length;
  const discussionCount = leads.filter(
    (l) => l.status === 'Discussion' || l.status === 'Won'
  ).length;
  const followUpCount = leads.filter((l) => l.status === 'Follow Up').length;
  const respondedCount = leads.filter(
    (l) => l.status !== 'Submitted'
  ).length;

  return {
    viewedCount,
    discussionCount,
    followUpCount,
    viewRate: total > 0 ? viewedCount / total : 0,
    discussionRate: total > 0 ? discussionCount / total : 0,
    clientResponseRate: total > 0 ? respondedCount / total : 0,
  };
}

// ─── Conversion KPIs ─────────────────────────────────────────────────────────

export function getConversionKPIs(leads: LeadLogEntry[]): ConversionKPIs {
  const total = leads.length;
  const wonCount = leads.filter((l) => l.status === 'Won').length;
  const lostCount = leads.filter((l) => l.status === 'Lost').length;
  const discussionCount = leads.filter(
    (l) => l.status === 'Discussion' || l.status === 'Won'
  ).length;

  return {
    wonCount,
    lostCount,
    winRate: total > 0 ? wonCount / total : 0,
    lossRate: total > 0 ? lostCount / total : 0,
    discussionToWinRate: discussionCount > 0 ? wonCount / discussionCount : 0,
    bidsPerWin: wonCount > 0 ? Math.round(total / wonCount) : 0,
  };
}

// ─── Cost / Efficiency KPIs ───────────────────────────────────────────────────

export function getCostKPIs(leads: LeadLogEntry[]): CostKPIs {
  const totalConnects = leads.reduce((sum, l) => sum + l.connectsUsed, 0);
  const wonLeads = leads.filter((l) => l.status === 'Won');
  const wonConnects = wonLeads.reduce((sum, l) => sum + l.connectsUsed, 0);
  const wonValue = wonLeads.reduce((sum, l) => sum + l.proposalValue, 0);

  const boosted = leads.filter((l) => l.bidType === 'Boosted');
  const normal = leads.filter((l) => l.bidType === 'Normal');
  const boostedWon = boosted.filter((l) => l.status === 'Won').length;
  const normalWon = normal.filter((l) => l.status === 'Won').length;

  return {
    avgConnectsPerBid: leads.length > 0 ? totalConnects / leads.length : 0,
    connectsPerWin: wonLeads.length > 0 ? wonConnects / wonLeads.length : 0,
    revenuePerConnect: totalConnects > 0 ? wonValue / totalConnects : 0,
    boostedBidCount: boosted.length,
    normalBidCount: normal.length,
    boostedWinRate: boosted.length > 0 ? boostedWon / boosted.length : 0,
    normalWinRate: normal.length > 0 ? normalWon / normal.length : 0,
  };
}

// ─── Pipeline KPIs ───────────────────────────────────────────────────────────

export function getPipelineKPIs(leads: LeadLogEntry[]): PipelineKPIs {
  const activeLeads = leads.filter(isActive);
  const wonLeads = leads.filter((l) => l.status === 'Won');
  const pipelineValue = activeLeads.reduce((sum, l) => sum + l.proposalValue, 0);
  const wonValue = wonLeads.reduce((sum, l) => sum + l.proposalValue, 0);
  const winRate = leads.length > 0 ? wonLeads.length / leads.length : 0;

  return {
    activeLeadsCount: activeLeads.length,
    pipelineValue,
    expectedRevenue: Math.round(pipelineValue * winRate),
    wonValue,
  };
}

// ─── Weekly Metrics ───────────────────────────────────────────────────────────

export function getWeeklyMetrics(leads: LeadLogEntry[], weeksBack = 8): WeeklyMetric[] {
  const weeks: WeeklyMetric[] = [];
  for (let i = weeksBack - 1; i >= 0; i--) {
    const weekStart = format(subWeeks(new Date(), i), 'yyyy-MM-dd');
    const weekEnd = format(addWeeks(parseISO(weekStart), 1), 'yyyy-MM-dd');
    const weekLeads = leads.filter((l) => l.date >= weekStart && l.date < weekEnd);

    weeks.push({
      weekLabel: getWeekLabel(weekStart),
      weekStart,
      bids: weekLeads.length,
      wins: weekLeads.filter((l) => l.status === 'Won').length,
      connectsUsed: weekLeads.reduce((s, l) => s + l.connectsUsed, 0),
      viewedCount: weekLeads.filter(
        (l) => l.status === 'Viewed' || l.status === 'Discussion' || l.status === 'Won'
      ).length,
    });
  }
  return weeks;
}

// ─── Monthly Metrics ──────────────────────────────────────────────────────────

export function getMonthlyMetrics(leads: LeadLogEntry[], monthsBack = 6): MonthlyMetric[] {
  const months: MonthlyMetric[] = [];
  for (let i = monthsBack - 1; i >= 0; i--) {
    const monthDate = subMonths(new Date(), i);
    const month = format(monthDate, 'yyyy-MM');
    const monthLeads = leads.filter((l) => getMonthKey(l.date) === month);
    const activeLeads = monthLeads.filter(isActive);

    months.push({
      monthLabel: getMonthLabel(month),
      month,
      bids: monthLeads.length,
      wins: monthLeads.filter((l) => l.status === 'Won').length,
      connectsUsed: monthLeads.reduce((s, l) => s + l.connectsUsed, 0),
      pipelineValue: activeLeads.reduce((s, l) => s + l.proposalValue, 0),
    });
  }
  return months;
}

// ─── Funnel Metrics ───────────────────────────────────────────────────────────

export function getFunnelMetrics(leads: LeadLogEntry[]): FunnelStep[] {
  const total = leads.length;
  const countStatus = (s: string) => leads.filter((l) => l.status === s).length;

  const submitted = total;
  const viewed =
    leads.filter(
      (l) => l.status === 'Viewed' || l.status === 'Discussion' || l.status === 'Won'
    ).length;
  const discussion = leads.filter(
    (l) => l.status === 'Discussion' || l.status === 'Won'
  ).length;
  const won = countStatus('Won');

  return [
    { stage: 'Submitted', count: submitted, rate: 1 },
    { stage: 'Viewed', count: viewed, rate: total > 0 ? viewed / total : 0 },
    { stage: 'Discussion', count: discussion, rate: total > 0 ? discussion / total : 0 },
    { stage: 'Won', count: won, rate: total > 0 ? won / total : 0 },
  ];
}

// ─── BD Performance ───────────────────────────────────────────────────────────

export function getBDPerformance(
  leads: LeadLogEntry[],
  members: BDMember[]
): BDPerformanceRow[] {
  const currentMonth = getCurrentMonthKey();

  return members.map((member) => {
    const memberLeads = leads.filter((l) => l.assignedToId === member.id);
    const monthlyLeads = memberLeads.filter((l) => getMonthKey(l.date) === currentMonth);
    const wonLeads = memberLeads.filter((l) => l.status === 'Won');
    const viewedLeads = memberLeads.filter(
      (l) => l.status === 'Viewed' || l.status === 'Discussion' || l.status === 'Won'
    );
    const activeLeads = memberLeads.filter(isActive);

    return {
      memberId: member.id,
      memberName: member.name,
      totalBids: memberLeads.length,
      wonCount: wonLeads.length,
      winRate: memberLeads.length > 0 ? wonLeads.length / memberLeads.length : 0,
      viewRate: memberLeads.length > 0 ? viewedLeads.length / memberLeads.length : 0,
      totalConnects: memberLeads.reduce((s, l) => s + l.connectsUsed, 0),
      pipelineValue: activeLeads.reduce((s, l) => s + l.proposalValue, 0),
      monthlyTarget: member.monthlyTarget,
      targetCompletion:
        member.monthlyTarget > 0 ? monthlyLeads.length / member.monthlyTarget : 0,
    };
  });
}

// ─── Profile Performance ─────────────────────────────────────────────────────

export function getProfilePerformance(
  leads: LeadLogEntry[],
  profiles: UpworkProfile[]
): ProfilePerformanceRow[] {
  return profiles.map((profile) => {
    const profileLeads = leads.filter((l) => l.profileUsedId === profile.id);
    const wonLeads = profileLeads.filter((l) => l.status === 'Won');
    const boostedLeads = profileLeads.filter((l) => l.bidType === 'Boosted');
    const normalLeads = profileLeads.filter((l) => l.bidType === 'Normal');
    const activeLeads = profileLeads.filter(isActive);

    return {
      profileId: profile.id,
      profileName: profile.profileName,
      totalBids: profileLeads.length,
      wonCount: wonLeads.length,
      winRate: profileLeads.length > 0 ? wonLeads.length / profileLeads.length : 0,
      totalConnects: profileLeads.reduce((s, l) => s + l.connectsUsed, 0),
      boostedBids: boostedLeads.length,
      normalBids: normalLeads.length,
      pipelineValue: activeLeads.reduce((s, l) => s + l.proposalValue, 0),
    };
  });
}

// ─── Source Breakdown ─────────────────────────────────────────────────────────

export function getSourceBreakdown(leads: LeadLogEntry[]) {
  const sources = ['Upwork', 'Referral', 'LinkedIn', 'Direct'] as const;
  return sources.map((source) => {
    const sourceLeads = leads.filter((l) => l.leadSource === source);
    const won = sourceLeads.filter((l) => l.status === 'Won').length;
    return {
      source,
      total: sourceLeads.length,
      won,
      winRate: sourceLeads.length > 0 ? won / sourceLeads.length : 0,
    };
  });
}

// ─── Week-on-Week / Month-on-Month ────────────────────────────────────────────

export function getWoWChange(leads: LeadLogEntry[]) {
  const thisWeek = getCurrentWeekStart();
  const lastWeek = format(subWeeks(parseISO(thisWeek), 1), 'yyyy-MM-dd');
  const nextWeekStart = format(addWeeks(parseISO(thisWeek), 1), 'yyyy-MM-dd');

  const tw = leads.filter((l) => l.date >= thisWeek && l.date < nextWeekStart);
  const lw = leads.filter((l) => l.date >= lastWeek && l.date < thisWeek);

  const delta = (a: number, b: number) => (b === 0 ? 0 : ((a - b) / b) * 100);

  return {
    thisWeekBids: tw.length,
    lastWeekBids: lw.length,
    bidsDelta: delta(tw.length, lw.length),
    thisWeekWins: tw.filter((l) => l.status === 'Won').length,
    lastWeekWins: lw.filter((l) => l.status === 'Won').length,
  };
}

export function getMoMChange(leads: LeadLogEntry[]) {
  const thisMonth = getCurrentMonthKey();
  const lastMonth = format(subMonths(new Date(), 1), 'yyyy-MM');

  const tm = leads.filter((l) => getMonthKey(l.date) === thisMonth);
  const lm = leads.filter((l) => getMonthKey(l.date) === lastMonth);

  const delta = (a: number, b: number) => (b === 0 ? 0 : ((a - b) / b) * 100);

  return {
    thisMonthBids: tm.length,
    lastMonthBids: lm.length,
    bidsDelta: delta(tm.length, lm.length),
    thisMonthWins: tm.filter((l) => l.status === 'Won').length,
    lastMonthWins: lm.filter((l) => l.status === 'Won').length,
  };
}

// ─── NEW: Average Bids Per Day (per BD Member) ───────────────────────────────

export interface AvgBidsPerDayRow {
  memberId: string;
  memberName: string;
  totalBids: number;
  activeDays: number;
  avgBidsPerDay: number;
  /** Bids in the last 7 days */
  last7DaysBids: number;
  /** Bids in the last 30 days */
  last30DaysBids: number;
  /** avg in last 30 days */
  avgLast30: number;
}

export function getAvgBidsPerDay(
  leads: LeadLogEntry[],
  members: BDMember[]
): AvgBidsPerDayRow[] {
  const today = format(new Date(), 'yyyy-MM-dd');
  const last7 = format(subWeeks(new Date(), 1), 'yyyy-MM-dd');
  const last30 = format(subWeeks(new Date(), 4), 'yyyy-MM-dd');

  return members.map((member) => {
    const memberLeads = leads.filter((l) => l.assignedToId === member.id);

    // compute distinct days the member logged at least one bid
    const distinctDays = new Set(memberLeads.map((l) => l.date));
    const activeDays = distinctDays.size;

    const last7Leads = memberLeads.filter((l) => l.date >= last7 && l.date <= today);
    const last30Leads = memberLeads.filter((l) => l.date >= last30 && l.date <= today);

    return {
      memberId: member.id,
      memberName: member.name,
      totalBids: memberLeads.length,
      activeDays,
      avgBidsPerDay: activeDays > 0 ? memberLeads.length / activeDays : 0,
      last7DaysBids: last7Leads.length,
      last30DaysBids: last30Leads.length,
      avgLast30: last30Leads.length / 30,
    };
  });
}

// ─── NEW: Weekly BD Comparison (each BD member across N weeks) ───────────────

export interface WeeklyBDRow {
  weekLabel: string;
  weekStart: string;
  [memberName: string]: number | string; // dynamic member columns
}

export function getWeeklyBDComparison(
  leads: LeadLogEntry[],
  members: BDMember[],
  weeksBack = 6
): WeeklyBDRow[] {
  const weeks: WeeklyBDRow[] = [];
  for (let i = weeksBack - 1; i >= 0; i--) {
    const weekStart = format(subWeeks(new Date(), i), 'yyyy-MM-dd');
    const weekEnd = format(addWeeks(parseISO(weekStart), 1), 'yyyy-MM-dd');
    const entry: WeeklyBDRow = {
      weekLabel: getWeekLabel(weekStart),
      weekStart,
    };
    for (const member of members) {
      const count = leads.filter(
        (l) => l.assignedToId === member.id && l.date >= weekStart && l.date < weekEnd
      ).length;
      // use first name for shorter chart labels
      entry[member.name.split(' ')[0]] = count;
    }
    weeks.push(entry);
  }
  return weeks;
}

// ─── NEW: Profile Weekly Momentum ────────────────────────────────────────────

export interface ProfileMomentumRow extends ProfilePerformanceRow {
  /** win rate last 4 weeks */
  recentWinRate: number;
  /** delta vs overall win rate (positive = improving) */
  momentumDelta: number;
  /** avg proposal value */
  avgProposalValue: number;
  /** bids in last 4 weeks */
  recentBids: number;
}

export function getProfileMomentum(
  leads: LeadLogEntry[],
  profiles: UpworkProfile[]
): ProfileMomentumRow[] {
  const last4Weeks = format(subWeeks(new Date(), 4), 'yyyy-MM-dd');

  return profiles.map((profile) => {
    const profileLeads = leads.filter((l) => l.profileUsedId === profile.id);
    const wonLeads = profileLeads.filter((l) => l.status === 'Won');
    const boostedLeads = profileLeads.filter((l) => l.bidType === 'Boosted');
    const normalLeads = profileLeads.filter((l) => l.bidType === 'Normal');
    const activeLeads = profileLeads.filter(isActive);

    const overallWinRate = profileLeads.length > 0 ? wonLeads.length / profileLeads.length : 0;

    // Recent performance (last 4 weeks)
    const recentLeads = profileLeads.filter((l) => l.date >= last4Weeks);
    const recentWon = recentLeads.filter((l) => l.status === 'Won').length;
    const recentWinRate = recentLeads.length > 0 ? recentWon / recentLeads.length : 0;

    const avgProposalValue =
      profileLeads.length > 0
        ? profileLeads.reduce((s, l) => s + l.proposalValue, 0) / profileLeads.length
        : 0;

    return {
      profileId: profile.id,
      profileName: profile.profileName,
      totalBids: profileLeads.length,
      wonCount: wonLeads.length,
      winRate: overallWinRate,
      totalConnects: profileLeads.reduce((s, l) => s + l.connectsUsed, 0),
      boostedBids: boostedLeads.length,
      normalBids: normalLeads.length,
      pipelineValue: activeLeads.reduce((s, l) => s + l.proposalValue, 0),
      recentWinRate,
      momentumDelta: recentWinRate - overallWinRate,
      avgProposalValue,
      recentBids: recentLeads.length,
    };
  });
}

// ─── Engagement Type KPIs (Fixed vs Hourly) ────────────────────────────────

export interface EngagementTypeKPIs {
  fixedCount: number;
  hourlyCount: number;
  fixedShare: number;
  hourlyShare: number;
  fixedWinRate: number;
  hourlyWinRate: number;
  avgFixedValue: number;
  avgHourlyValue: number;
  avgHourlyRate: number;
  avgEstimatedHours: number;
  totalHourlyHours: number;
  fixedPipelineValue: number;
  hourlyPipelineValue: number;
}

export function getEngagementTypeKPIs(leads: LeadLogEntry[]): EngagementTypeKPIs {
  const fixed  = leads.filter((l) => l.engagementType === 'Fixed');
  const hourly = leads.filter((l) => l.engagementType === 'Hourly');
  const total  = leads.length || 1;

  const winRate = (arr: LeadLogEntry[]) =>
    arr.length > 0 ? arr.filter((l) => l.status === 'Won').length / arr.length : 0;

  const avgVal = (arr: LeadLogEntry[]) =>
    arr.length > 0 ? arr.reduce((s, l) => s + l.proposalValue, 0) / arr.length : 0;

  const activeHourly = hourly.filter(isActive);
  const activeFixed  = fixed.filter(isActive);

  const avgHourlyRate =
    hourly.length > 0
      ? hourly.reduce((s, l) => s + (l.hourlyRate ?? 0), 0) / hourly.length
      : 0;

  const avgEstimatedHours =
    hourly.length > 0
      ? hourly.reduce((s, l) => s + (l.estimatedHours ?? 0), 0) / hourly.length
      : 0;

  return {
    fixedCount:  fixed.length,
    hourlyCount: hourly.length,
    fixedShare:  fixed.length / total,
    hourlyShare: hourly.length / total,
    fixedWinRate:  winRate(fixed),
    hourlyWinRate: winRate(hourly),
    avgFixedValue:  avgVal(fixed),
    avgHourlyValue: avgVal(hourly),
    avgHourlyRate,
    avgEstimatedHours,
    totalHourlyHours: activeHourly.reduce((s, l) => s + (l.estimatedHours ?? 0), 0),
    fixedPipelineValue:  activeFixed.reduce((s, l) => s + l.proposalValue, 0),
    hourlyPipelineValue: activeHourly.reduce((s, l) => s + l.proposalValue, 0),
  };
}

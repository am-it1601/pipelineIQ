'use client';

import { useState } from 'react';
import type { LeadLogEntry, BDMember, UpworkProfile, User } from '@/lib/types';
import {
  getActivityKPIs,
  getConversionKPIs,
  getCostKPIs,
  getPipelineKPIs,
  getWeeklyMetrics,
  getMonthlyMetrics,
  getFunnelMetrics,
  getScopedLeads,
  getAvgBidsPerDay,
  getProfileMomentum,
  getWoWChange,
  getEngagementTypeKPIs,
} from '@/lib/kpiEngine';
import { formatCurrency, formatPercent, formatDate, getDateRange, filterLeadsByDate } from '@/lib/utils';
import KPICard from '@/components/ui/KPICard';
import StatusBadge from '@/components/ui/StatusBadge';
import SectionHeader from '@/components/ui/SectionHeader';
import { Card } from '@/components/ui/card';
import DashboardFilter, { DEFAULT_FILTERS, DashboardFilters } from '@/components/ui/DashboardFilter';
import {
  BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { Target, Award, DollarSign, Zap, TrendingUp, TrendingDown, Minus, Activity, Star, ExternalLink } from 'lucide-react';

const COLORS = ['#0F6CBD', '#0078D4', '#107C41', '#D83B01', '#A4262C', '#605E5C'];
const PROFILE_COLORS = ['#0F6CBD', '#0078D4', '#107C41', '#D83B01', '#A4262C', '#605E5C'];

const customTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload) return null;
  return (
    <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 4, padding: '10px 14px' }}>
      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>{label}</div>
      {payload.map((p: any, i: number) => (
        <div key={i} style={{ fontSize: 13, fontWeight: 600, color: p.color }}>{p.name}: {p.value}</div>
      ))}
    </div>
  );
};

interface Props {
  leads: LeadLogEntry[];
  members: BDMember[];
  profiles: UpworkProfile[];
  user: User;
}

export default function BDDashboard({ leads, members, profiles, user }: Props) {
  const [hoverRowId, setHoverRowId] = useState<string | null>(null);
  const [dashFilter, setDashFilter] = useState<DashboardFilters>(DEFAULT_FILTERS);

  const myLeads = getScopedLeads(leads, user);

  // Apply global filter to my leads
  const dateRange = getDateRange(dashFilter.preset, dashFilter.customFrom, dashFilter.customTo);
  const filteredMyLeads = filterLeadsByDate(myLeads, dateRange.from, dateRange.to)
    .filter((l) => !dashFilter.profileId     || l.profile_used_id === dashFilter.profileId)
    .filter((l) => !dashFilter.engagement_type || l.engagement_type === dashFilter.engagement_type)
    .filter((l) => !dashFilter.lead_source     || l.lead_source === dashFilter.lead_source);

  const activity = getActivityKPIs(filteredMyLeads, 1);
  const conversion = getConversionKPIs(filteredMyLeads);
  const cost = getCostKPIs(filteredMyLeads);
  const pipeline = getPipelineKPIs(filteredMyLeads);
  const weekly = getWeeklyMetrics(filteredMyLeads, 8);
  const monthly = getMonthlyMetrics(filteredMyLeads, 6);
  const funnel = getFunnelMetrics(filteredMyLeads);
  const wow = getWoWChange(filteredMyLeads);
  const myEng = getEngagementTypeKPIs(filteredMyLeads);
  const recentLeads = [...filteredMyLeads].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 10);

  const myMember = members.find((m) => m.id === user.bd_member_id);
  const monthly_target = myMember?.monthly_target ?? 0;
  // Use total (unfiltered) bids for target completion to keep it meaningful
  const totalMonthlyBids = getActivityKPIs(myLeads, 1).monthlyBids;
  const targetCompletion = monthly_target > 0 ? totalMonthlyBids / monthly_target : 0;

  // Personal avg pace — unfiltered
  const myAvgBidsRow = getAvgBidsPerDay(myLeads, myMember ? [myMember] : [])[0];

  // Hot leads
  const myHotLeads = myLeads.filter((l) => l.is_hot).sort((a, b) => b.date.localeCompare(a.date));

  // Profile performance across all profiles (team-wide, read-only for BD)
  const profileMomentum = getProfileMomentum(leads, profiles);

  const cardStyle = "p-5 bg-card text-card-foreground border rounded-lg shadow-sm";

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }} className="animate-fade-in">

      {/* ── Dashboard Filter Bar ────────────────────────────── */}
      <DashboardFilter profiles={profiles} value={dashFilter} onChange={setDashFilter} />

      {/* ── My Hot Leads ───────────────────────────────────── */}
      {myHotLeads.length > 0 && (
        <div style={{ background: 'var(--surface-2)', border: '1px solid var(--warning)', borderRadius: 8, padding: '16px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <Star size={16} fill="#f59e0b" color="#f59e0b" />
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>My Hot Leads</span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 4 }}>{myHotLeads.length} starred</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ background: 'rgba(245,158,11,0.06)' }}>
                  {['Date', 'Project', 'Engagement', 'Value', 'Status', 'Remarks'].map(h => (
                    <th key={h} style={{ padding: '7px 12px', textAlign: 'left', fontSize: 11, color: '#f59e0b', fontWeight: 600, borderBottom: '1px solid rgba(245,158,11,0.2)', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {myHotLeads.map((lead, i) => (
                  <tr key={lead.id}
                    style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(245,158,11,0.03)', transition: 'background 0.1s' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(245,158,11,0.07)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = i % 2 === 0 ? 'transparent' : 'rgba(245,158,11,0.03)')}>
                    <td style={{ padding: '8px 12px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{formatDate(lead.date)}</td>
                    <td style={{ padding: '8px 12px', fontWeight: 600, color: 'var(--text)', maxWidth: 220 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lead.project_title}</span>
                        {lead.upwork_link && <a href={lead.upwork_link} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-muted)', flexShrink: 0 }}><ExternalLink size={11} /></a>}
                      </div>
                    </td>
                    <td style={{ padding: '8px 12px' }}><span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, background: lead.engagement_type === 'Hourly' ? 'rgba(34,211,238,0.12)' : 'rgba(99,102,241,0.12)', color: lead.engagement_type === 'Hourly' ? '#22d3ee' : '#818cf8', border: `1px solid ${lead.engagement_type === 'Hourly' ? 'rgba(34,211,238,0.3)' : 'rgba(99,102,241,0.3)'}` }}>{lead.engagement_type}</span></td>
                    <td style={{ padding: '8px 12px', color: '#22d3ee', fontWeight: 700, whiteSpace: 'nowrap' }}>{formatCurrency(lead.proposal_value)}</td>
                    <td style={{ padding: '8px 12px' }}><StatusBadge status={lead.status} size="sm" /></td>
                    <td style={{ padding: '8px 12px', color: 'var(--text-muted)', maxWidth: 160 }}><span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>{lead.remarks || '—'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Welcome Banner */}
      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8, padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>Welcome back, {(user.full_name || "").split(' ')[0]} 👋</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 3 }}>
            You've submitted <strong style={{ color: '#818cf8' }}>{activity.monthlyBids}</strong> bids this month — target is <strong style={{ color: '#22d3ee' }}>{monthly_target}</strong>
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: targetCompletion >= 1 ? '#10b981' : '#f59e0b' }}>
            {formatPercent(targetCompletion, 0)}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>of monthly target</div>
          <div style={{ height: 4, width: 120, background: 'var(--border)', borderRadius: 2, marginTop: 6, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${Math.min(targetCompletion * 100, 100)}%`, background: targetCompletion >= 1 ? '#10b981' : '#f59e0b', borderRadius: 2 }} />
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14 }}>
        <KPICard title="My Total Bids" value={activity.totalBids} subtitle="all time" icon={<Target size={16} />} accentColor="var(--primary)" />
        <KPICard title="My Win Rate" value={formatPercent(conversion.winRate)} subtitle={`${conversion.wonCount} won`} icon={<Award size={16} />} accentColor="var(--success)" highlight={conversion.winRate >= 0.15} />
        <KPICard title="My Pipeline" value={formatCurrency(pipeline.pipelineValue)} subtitle={`${pipeline.activeLeadsCount} active`} icon={<TrendingUp size={16} />} accentColor="var(--accent)" />
        <KPICard title="Won Revenue" value={formatCurrency(pipeline.wonValue)} icon={<DollarSign size={16} />} accentColor="var(--warning)" highlight />
        <KPICard title="Connects Used" value={activity.totalConnectsUsed} subtitle={`${cost.avgConnectsPerBid.toFixed(1)} avg/bid`} icon={<Zap size={16} />} accentColor="var(--text-muted)" />
      </div>

      {/* ── My Engagement Mix ─────────────────────────────────── */}
      {myLeads.length > 0 && (
        <Card className={cardStyle}>
          <SectionHeader title="My Engagement Mix" subtitle="Your Fixed-price vs Hourly breakdown" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            <div style={{ padding: '14px', background: 'rgba(99,102,241,0.1)', borderRadius: 10, border: '1px solid rgba(99,102,241,0.2)' }}>
              <div style={{ fontSize: 10, color: '#818cf8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Fixed Bids</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#818cf8' }}>{myEng.fixedCount}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>Win: {formatPercent(myEng.fixedWinRate)} · Avg: {formatCurrency(myEng.avgFixedValue)}</div>
            </div>
            <div style={{ padding: '14px', background: 'rgba(34,211,238,0.1)', borderRadius: 10, border: '1px solid rgba(34,211,238,0.2)' }}>
              <div style={{ fontSize: 10, color: '#22d3ee', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Hourly Bids</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#22d3ee' }}>{myEng.hourlyCount}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>Win: {formatPercent(myEng.hourlyWinRate)} · Avg: {formatCurrency(myEng.avgHourlyValue)}</div>
            </div>
            <div style={{ padding: '14px', background: 'rgba(16,185,129,0.1)', borderRadius: 10, border: '1px solid rgba(16,185,129,0.2)' }}>
              <div style={{ fontSize: 10, color: '#10b981', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Avg Hourly Rate</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#10b981' }}>{myEng.hourlyCount > 0 ? `$${myEng.avgHourlyRate.toFixed(0)}` : '—'}<span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{myEng.hourlyCount > 0 ? '/hr' : ''}</span></div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>Avg est. {myEng.avgEstimatedHours.toFixed(0)}h per engagement</div>
            </div>
            <div style={{ padding: '14px', background: 'rgba(245,158,11,0.1)', borderRadius: 10, border: '1px solid rgba(245,158,11,0.2)' }}>
              <div style={{ fontSize: 10, color: '#f59e0b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Hourly Pipeline</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#f59e0b' }}>{myEng.totalHourlyHours.toLocaleString()}<span style={{ fontSize: 12, color: 'var(--text-muted)' }}>h</span></div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>{formatCurrency(myEng.hourlyPipelineValue)} active hourly value</div>
            </div>
          </div>
        </Card>
      )}

      {/* ── Avg Bids Per Day + WoW Snapshot ──────────────── */}
      {myAvgBidsRow && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {/* Personal Pace Card */}
          <Card className={cardStyle}>
            <SectionHeader title="My Daily Bidding Pace" subtitle="Average bids submitted per active day" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
              <div style={{ textAlign: 'center', padding: '12px', background: 'rgba(99,102,241,0.1)', borderRadius: 10 }}>
                <div style={{ fontSize: 10, color: '#818cf8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>All-Time Avg/Day</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: '#818cf8' }}>{myAvgBidsRow.avgBidsPerDay.toFixed(1)}</div>
              </div>
              <div style={{ textAlign: 'center', padding: '12px', background: 'rgba(34,211,238,0.1)', borderRadius: 10 }}>
                <div style={{ fontSize: 10, color: '#22d3ee', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>30d Avg/Day</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: '#22d3ee' }}>{myAvgBidsRow.avgLast30.toFixed(1)}</div>
              </div>
              <div style={{ textAlign: 'center', padding: '12px', background: 'rgba(16,185,129,0.1)', borderRadius: 10 }}>
                <div style={{ fontSize: 10, color: '#10b981', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Last 7 Days</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: myAvgBidsRow.last7DaysBids >= 5 ? '#10b981' : '#f59e0b' }}>{myAvgBidsRow.last7DaysBids}</div>
              </div>
              <div style={{ textAlign: 'center', padding: '12px', background: 'rgba(245,158,11,0.1)', borderRadius: 10 }}>
                <div style={{ fontSize: 10, color: '#f59e0b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Active Days</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: '#f59e0b' }}>{myAvgBidsRow.activeDays}</div>
              </div>
            </div>
          </Card>

          {/* WoW Momentum */}
          <Card className={cardStyle}>
            <SectionHeader title="My Weekly Momentum" subtitle="This week vs last week" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div style={{ padding: '14px', background: 'var(--surface-2)', borderRadius: 4, border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>This Week Bids</div>
                <div style={{ fontSize: 30, fontWeight: 700, color: 'var(--text)' }}>{wow.thisWeekBids}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 4 }}>
                  {wow.bidsDelta >= 0
                    ? <TrendingUp size={14} color="#10b981" />
                    : <TrendingDown size={14} color="#ef4444" />}
                  <span style={{ fontSize: 12, fontWeight: 600, color: wow.bidsDelta >= 0 ? '#10b981' : '#ef4444' }}>
                    {wow.bidsDelta >= 0 ? '+' : ''}{wow.bidsDelta.toFixed(0)}% vs last week ({wow.lastWeekBids})
                  </span>
                </div>
              </div>
              <div style={{ padding: '14px', background: 'var(--surface-2)', borderRadius: 4, border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>This Week Wins</div>
                <div style={{ fontSize: 30, fontWeight: 700, color: '#10b981' }}>{wow.thisWeekWins}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                  Last week: <strong style={{ color: 'var(--text)' }}>{wow.lastWeekWins}</strong> wins
                </div>
              </div>
              <div style={{ padding: '12px', background: 'rgba(16,185,129,0.1)', borderRadius: 4, border: '1px solid rgba(16,185,129,0.2)' }}>
                <div style={{ fontSize: 10, color: '#10b981', fontWeight: 600, textTransform: 'uppercase' }}>Boosted Win%</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', marginTop: 2 }}>{formatPercent(cost.boostedWinRate)}</div>
              </div>
              <div style={{ padding: '12px', background: 'rgba(99,102,241,0.1)', borderRadius: 4, border: '1px solid rgba(99,102,241,0.2)' }}>
                <div style={{ fontSize: 10, color: '#818cf8', fontWeight: 600, textTransform: 'uppercase' }}>Normal Win%</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', marginTop: 2 }}>{formatPercent(cost.normalWinRate)}</div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 16 }}>
        <Card className={cardStyle}>
          <SectionHeader title="My Weekly Activity" subtitle="Bids & wins over last 8 weeks" />
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weekly} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
              <XAxis dataKey="weekLabel" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <Tooltip content={customTooltip} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="bids" name="Bids" fill="var(--primary)" radius={[2, 2, 0, 0]} />
              <Bar dataKey="wins" name="Wins" fill="var(--success)" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className={cardStyle}>
          <SectionHeader title="My Conversion Funnel" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
            {funnel.map((step, i) => (
              <div key={step.stage}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{step.stage}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>{step.count} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({formatPercent(step.rate)})</span></span>
                </div>
                <div style={{ height: 7, borderRadius: 4, background: 'var(--surface-2)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${step.rate * 100}%`, background: COLORS[i], borderRadius: 4, transition: 'width 0.6s ease' }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Monthly Trend */}
      <Card className={cardStyle}>
        <SectionHeader title="My Monthly Trend" subtitle="Last 6 months" />
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={monthly}>
            <defs>
              <linearGradient id="myBids" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
            <XAxis dataKey="monthLabel" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
            <Tooltip content={customTooltip} />
            <Area type="monotone" dataKey="bids" name="Bids" stroke="var(--primary)" fill="url(#myBids)" strokeWidth={2} dot={{ fill: 'var(--primary)', r: 3 }} />
            <Area type="monotone" dataKey="wins" name="Wins" stroke="var(--success)" strokeWidth={2} fill="none" dot={{ fill: 'var(--success)', r: 3 }} />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* ── Upwork Profile Performance (team-wide, read-only for BD) ── */}
      <Card className={cardStyle}>
        <SectionHeader
          title="Upwork Profile Performance"
          subtitle="Team-wide profile stats — overall vs recent 4-week win rate"
        />
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--surface-2)' }}>
                {[
                  'Profile', 'Total Bids', 'Won', 'Overall Win%', 'Recent Win% (4w)',
                  'Momentum', 'Avg Proposal', 'Pipeline',
                ].map(h => (
                  <th key={h} style={{ padding: '9px 12px', textAlign: 'left', fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {profileMomentum.map((row, i) => {
                const mom = row.momentumDelta;
                const MomIcon = mom > 0.02 ? TrendingUp : mom < -0.02 ? TrendingDown : Minus;
                const momColor = mom > 0.02 ? '#10b981' : mom < -0.02 ? '#ef4444' : '#94a3b8';
                const isHovered = hoverRowId === `prof-${row.profileId}`;
                return (
                  <tr key={row.profileId}
                    onMouseEnter={() => setHoverRowId(`prof-${row.profileId}`)}
                    onMouseLeave={() => setHoverRowId(null)}
                    style={{ background: isHovered ? 'rgba(99,102,241,0.08)' : i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)', transition: 'background 0.12s', cursor: 'default' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--text)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: PROFILE_COLORS[i % PROFILE_COLORS.length] }} />
                        {row.profile_name}
                      </div>
                    </td>
                    <td style={{ padding: '10px 12px' }}>{row.totalBids}</td>
                    <td style={{ padding: '10px 12px', color: '#10b981', fontWeight: 600 }}>{row.wonCount}</td>
                    <td style={{ padding: '10px 12px', color: row.winRate >= 0.15 ? '#10b981' : row.winRate >= 0.08 ? '#f59e0b' : '#ef4444', fontWeight: 600 }}>
                      {formatPercent(row.winRate)}
                    </td>
                    <td style={{ padding: '10px 12px', fontWeight: 600, color: row.recentWinRate >= 0.15 ? '#10b981' : '#f59e0b' }}>
                      {row.recentBids > 0 ? formatPercent(row.recentWinRate) : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: momColor, fontWeight: 600 }}>
                        <MomIcon size={14} />
                        <span style={{ fontSize: 12 }}>{mom > 0 ? '+' : ''}{(mom * 100).toFixed(1)}pp</span>
                      </div>
                    </td>
                    <td style={{ padding: '10px 12px', color: '#22d3ee' }}>{formatCurrency(row.avgProposalValue)}</td>
                    <td style={{ padding: '10px 12px', color: '#818cf8' }}>{formatCurrency(row.pipelineValue)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Recent Leads */}
      <Card className={cardStyle}>
        <SectionHeader title="My Recent Leads" subtitle={`Last ${recentLeads.length} entries`} />
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr>
              {['Date', 'Project', 'Source', 'Engagement', 'Value', 'Connects', 'Bid Type', 'Status'].map(h => (
                <th key={h} style={{ padding: '7px 10px', textAlign: 'left', fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, borderBottom: '1px solid var(--border)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recentLeads.map((lead, i) => {
              const isHovered = hoverRowId === `recent-${lead.id}`;
              return (
                <tr key={lead.id}
                  onMouseEnter={() => setHoverRowId(`recent-${lead.id}`)}
                  onMouseLeave={() => setHoverRowId(null)}
                  style={{ background: isHovered ? 'rgba(99,102,241,0.08)' : i % 2 === 0 ? 'transparent' : 'var(--surface-2)', transition: 'background 0.12s', cursor: 'default' }}>
                  <td style={{ padding: '9px 10px', color: 'var(--text-muted)', fontSize: 12 }}>{formatDate(lead.date)}</td>
                  <td style={{ padding: '9px 10px', color: 'var(--text)', fontWeight: 500, maxWidth: 220 }}>
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lead.project_title}</div>
                  </td>
                  <td style={{ padding: '9px 10px' }}>
                    <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, background: 'var(--surface-2)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>{lead.lead_source}</span>
                  </td>
                  <td style={{ padding: '9px 10px' }}>
                    <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, background: lead.engagement_type === 'Hourly' ? 'rgba(34,211,238,0.12)' : 'rgba(99,102,241,0.12)', color: lead.engagement_type === 'Hourly' ? '#22d3ee' : '#818cf8', border: `1px solid ${lead.engagement_type === 'Hourly' ? 'rgba(34,211,238,0.3)' : 'rgba(99,102,241,0.3)'}` }}>{lead.engagement_type}</span>
                  </td>
                  <td style={{ padding: '9px 10px', color: '#22d3ee', fontWeight: 600 }}>
                    <div>{formatCurrency(lead.proposal_value)}</div>
                    {lead.engagement_type === 'Hourly' && lead.hourly_rate && lead.estimated_hours && (
                      <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>${lead.hourly_rate}/hr × {lead.estimated_hours}h</div>
                    )}
                  </td>
                  <td style={{ padding: '9px 10px', color: 'var(--text-muted)' }}>{lead.connects_used}</td>
                  <td style={{ padding: '9px 10px' }}>
                    <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, background: lead.bid_type === 'Boosted' ? 'rgba(245,158,11,0.15)' : 'rgba(99,102,241,0.15)', color: lead.bid_type === 'Boosted' ? '#f59e0b' : '#818cf8', border: `1px solid ${lead.bid_type === 'Boosted' ? 'rgba(245,158,11,0.3)' : 'rgba(99,102,241,0.3)'}` }}>{lead.bid_type}</span>
                  </td>
                  <td style={{ padding: '9px 10px' }}><StatusBadge status={lead.status} size="sm" /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>

    </div>
  );
}

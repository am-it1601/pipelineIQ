'use client';

import { useState } from 'react';
import type { LeadLogEntry, BDMember, UpworkProfile } from '@/lib/types';
import {
  getActivityKPIs,
  getConversionKPIs,
  getCostKPIs,
  getPipelineKPIs,
  getBDPerformance,
  getProfilePerformance,
  getWeeklyMetrics,
  getMonthlyMetrics,
  getFunnelMetrics,
  getWoWChange,
  getMoMChange,
  getSourceBreakdown,
  getEngagementTypeKPIs,
} from '@/lib/kpiEngine';
import { formatCurrency, formatPercent, formatDate, getDateRange, filterLeadsByDate } from '@/lib/utils';
import KPICard from '@/components/ui/KPICard';
import SectionHeader from '@/components/ui/SectionHeader';
import DashboardFilter, { DEFAULT_FILTERS, DashboardFilters } from '@/components/ui/DashboardFilter';
import ExtendedKPISections from '@/components/dashboard/ExtendedKPISections';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, AreaChart, Area,
} from 'recharts';
import {
  Target, TrendingUp, DollarSign, Zap,
  Award, Activity, Star, ExternalLink,
} from 'lucide-react';

const COLORS = ['#0F6CBD', '#0078D4', '#107C41', '#D83B01', '#A4262C', '#605E5C'];

interface Props {
  leads: LeadLogEntry[];
  members: BDMember[];
  profiles: UpworkProfile[];
}

export default function AdminDashboard({ leads, members, profiles }: Props) {
  const [dashFilter, setDashFilter] = useState<DashboardFilters>(DEFAULT_FILTERS);

  // Apply global dashboard filter
  const dateRange  = getDateRange(dashFilter.preset, dashFilter.customFrom, dashFilter.customTo);
  const filteredLeads = filterLeadsByDate(leads, dateRange.from, dateRange.to)
    .filter((l) => !dashFilter.profileId     || l.profileUsedId === dashFilter.profileId)
    .filter((l) => !dashFilter.engagementType || l.engagementType === dashFilter.engagementType)
    .filter((l) => !dashFilter.leadSource     || l.leadSource === dashFilter.leadSource);

  const activeMembers = members.filter((m) => m.status === 'active');
  const activity    = getActivityKPIs(filteredLeads, activeMembers.length);
  const conversion  = getConversionKPIs(filteredLeads);
  const cost        = getCostKPIs(filteredLeads);
  const pipeline    = getPipelineKPIs(filteredLeads);
  const weekly      = getWeeklyMetrics(filteredLeads, 8);
  const monthly     = getMonthlyMetrics(filteredLeads, 6);
  const funnel      = getFunnelMetrics(filteredLeads);
  const bdPerf      = getBDPerformance(filteredLeads, members);
  const profilePerf = getProfilePerformance(filteredLeads, profiles);
  const wow         = getWoWChange(filteredLeads);
  const mom         = getMoMChange(filteredLeads);
  const sources     = getSourceBreakdown(filteredLeads);

  // Hot leads (not filtered by date — always show all hot leads)
  const hotLeads    = leads.filter((l) => l.isHot).sort((a, b) => b.date.localeCompare(a.date));

  const cardStyle = {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 8,
    padding: '20px',
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const customTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload) return null;
    return (
      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 4, padding: '10px 14px' }}>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>{label}</div>
        {payload.map((p: { color: string; name: string; value: number }, i: number) => (
          <div key={i} style={{ fontSize: 13, fontWeight: 600, color: p.color }}>
            {p.name}: {p.value}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }} className="animate-fade-in">

      {/* ── Dashboard Filter Bar ──────────────────────────────── */}
      <DashboardFilter profiles={profiles} value={dashFilter} onChange={setDashFilter} />

      {/* ── Hot Leads Panel ──────────────────────────────────── */}
      {hotLeads.length > 0 && (
        <div style={{ background: 'var(--surface-2)', border: '1px solid var(--warning)', borderRadius: 8, padding: '16px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <Star size={16} fill="#f59e0b" color="#f59e0b" />
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>Hot Leads</span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 4 }}>{hotLeads.length} starred across the team</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ background: 'rgba(245,158,11,0.06)' }}>
                  {['Date', 'Project', 'BD Member', 'Engagement', 'Value', 'Status'].map(h => (
                    <th key={h} style={{ padding: '7px 12px', textAlign: 'left', fontSize: 11, color: '#f59e0b', fontWeight: 600, borderBottom: '1px solid rgba(245,158,11,0.2)', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {hotLeads.map((lead, i) => (
                  <tr key={lead.id} style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(245,158,11,0.03)', transition: 'background 0.1s' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(245,158,11,0.07)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = i % 2 === 0 ? 'transparent' : 'rgba(245,158,11,0.03)')}>
                    <td style={{ padding: '8px 12px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{formatDate(lead.date)}</td>
                    <td style={{ padding: '8px 12px', fontWeight: 600, color: 'var(--text)', maxWidth: 240 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lead.projectTitle}</span>
                        {lead.upworkLink && <a href={lead.upworkLink} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-muted)', flexShrink: 0 }}><ExternalLink size={11} /></a>}
                      </div>
                    </td>
                    <td style={{ padding: '8px 12px', color: 'var(--text)', whiteSpace: 'nowrap' }}>{members.find(m => m.id === lead.assignedToId)?.name ?? '—'}</td>
                    <td style={{ padding: '8px 12px' }}><span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, background: lead.engagementType === 'Hourly' ? 'rgba(34,211,238,0.12)' : 'rgba(99,102,241,0.12)', color: lead.engagementType === 'Hourly' ? '#22d3ee' : '#818cf8', border: `1px solid ${lead.engagementType === 'Hourly' ? 'rgba(34,211,238,0.3)' : 'rgba(99,102,241,0.3)'}` }}>{lead.engagementType}</span></td>
                    <td style={{ padding: '8px 12px', color: '#22d3ee', fontWeight: 700, whiteSpace: 'nowrap' }}>{formatCurrency(lead.proposalValue)}</td>
                    <td style={{ padding: '8px 12px' }}>
                      <span style={{ fontSize: 11, padding: '2px 6px', borderRadius: 4, background: lead.status === 'Won' ? 'rgba(16,185,129,0.15)' : lead.status === 'Lost' ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.1)', color: lead.status === 'Won' ? '#10b981' : lead.status === 'Lost' ? '#ef4444' : '#f59e0b' }}>{lead.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── KPI Cards Row 1 ─────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14 }}>
        <KPICard
          title="Total Bids"
          value={activity.totalBids}
          subtitle={`+${activity.weeklyBids} this week`}
          delta={wow.bidsDelta}
          icon={<Target size={16} />}
          accentColor="var(--primary)"
        />
        <KPICard
          title="Win Rate"
          value={formatPercent(conversion.winRate)}
          subtitle={`${conversion.wonCount} won`}
          icon={<Award size={16} />}
          accentColor="var(--success)"
          highlight={conversion.winRate >= 0.15}
        />
        <KPICard
          title="Pipeline Value"
          value={formatCurrency(pipeline.pipelineValue)}
          subtitle={`${pipeline.activeLeadsCount} active leads`}
          icon={<TrendingUp size={16} />}
          accentColor="var(--accent)"
        />
        <KPICard
          title="Expected Revenue"
          value={formatCurrency(pipeline.expectedRevenue)}
          subtitle="pipeline × win rate"
          icon={<DollarSign size={16} />}
          accentColor="var(--warning)"
        />
        <KPICard
          title="Connects Used"
          value={activity.totalConnectsUsed.toLocaleString()}
          subtitle={`${cost.avgConnectsPerBid.toFixed(1)} avg/bid`}
          icon={<Zap size={16} />}
          accentColor="var(--text-muted)"
        />
      </div>

      {/* ── KPI Cards Row 2 ─────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        <KPICard title="Monthly Bids" value={activity.monthlyBids} subtitle="current month" delta={mom.bidsDelta} icon={<Activity size={16} />} accentColor="var(--primary)" />
        <KPICard title="View Rate" value={formatPercent(conversion.winRate > 0 ? (conversion.wonCount + conversion.wonCount * 2) / activity.totalBids : 0)} subtitle="viewed / submitted" accentColor="var(--accent)" />
        <KPICard title="Boosted Win Rate" value={formatPercent(cost.boostedWinRate)} subtitle={`${cost.boostedBidCount} boosted bids`} accentColor="var(--warning)" />
        <KPICard title="Won Revenue" value={formatCurrency(pipeline.wonValue)} subtitle="total closed value" icon={<DollarSign size={16} />} accentColor="var(--success)" highlight />
      </div>

      {/* ── Charts Row ──────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 16 }}>
        {/* Weekly Bids Trend */}
        <div style={cardStyle}>
          <SectionHeader title="Weekly Bids & Wins" subtitle="Last 8 weeks" />
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weekly} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="weekLabel" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <Tooltip content={customTooltip as any} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="bids" name="Bids" fill="var(--primary)" radius={[2, 2, 0, 0]} />
              <Bar dataKey="wins" name="Wins" fill="var(--success)" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Funnel */}
        <div style={cardStyle}>
          <SectionHeader title="Conversion Funnel" subtitle="All time" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
            {funnel.map((step, i) => (
              <div key={step.stage}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{step.stage}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>
                    {step.count} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({formatPercent(step.rate)})</span>
                  </span>
                </div>
                <div style={{ height: 8, borderRadius: 4, background: 'var(--surface-2)', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${step.rate * 100}%`,
                      background: `linear-gradient(90deg, ${COLORS[i]}, ${COLORS[i]}99)`,
                      borderRadius: 4,
                      transition: 'width 0.6s ease',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          {/* Conversion summary */}
          <div style={{ marginTop: 16, padding: '10px 12px', background: 'var(--surface-2)', borderRadius: 8, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div><div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Discussion → Win</div><div style={{ fontSize: 14, fontWeight: 700, color: '#10b981' }}>{formatPercent(conversion.discussionToWinRate)}</div></div>
            <div><div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Bids Per Win</div><div style={{ fontSize: 14, fontWeight: 700, color: '#f59e0b' }}>{conversion.bidsPerWin}</div></div>
          </div>
        </div>
      </div>

      {/* ── Monthly Trend ───────────────────────────────── */}
      <div style={cardStyle}>
        <SectionHeader title="Monthly Performance Trend" subtitle="Last 6 months" />
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={monthly}>
            <defs>
              <linearGradient id="bidsGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="winsGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--success)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--success)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="monthLabel" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
            <Tooltip content={customTooltip as any} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Area type="monotone" dataKey="bids" name="Bids" stroke="var(--primary)" fill="url(#bidsGrad)" strokeWidth={2} dot={{ fill: 'var(--primary)', r: 3 }} />
            <Area type="monotone" dataKey="wins" name="Wins" stroke="var(--success)" fill="url(#winsGrad)" strokeWidth={2} dot={{ fill: 'var(--success)', r: 3 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* ── BD Performance Table ─────────────────────────── */}
      <div style={cardStyle}>
        <SectionHeader title="BD Member Performance" subtitle="All time · current month target" />
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr>
                {['Member', 'Total Bids', 'Won', 'Win Rate', 'View Rate', 'Connects', 'Pipeline', 'Monthly Target', 'Completion'].map((h) => (
                  <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bdPerf.map((row, i) => (
                <tr key={row.memberId} style={{ background: i % 2 === 0 ? 'transparent' : 'var(--surface-2)' }}>
                  <td style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--text)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: `linear-gradient(135deg, ${COLORS[i % COLORS.length]}, ${COLORS[(i + 1) % COLORS.length]})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff' }}>
                        {row.memberName.split(' ').map(n => n[0]).join('')}
                      </div>
                      {row.memberName}
                    </div>
                  </td>
                  <td style={{ padding: '10px 12px', color: 'var(--text)' }}>{row.totalBids}</td>
                  <td style={{ padding: '10px 12px', color: '#10b981', fontWeight: 600 }}>{row.wonCount}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <span style={{ color: row.winRate >= 0.15 ? '#10b981' : row.winRate >= 0.08 ? '#f59e0b' : '#ef4444', fontWeight: 600 }}>
                      {formatPercent(row.winRate)}
                    </span>
                  </td>
                  <td style={{ padding: '10px 12px', color: 'var(--text)' }}>{formatPercent(row.viewRate)}</td>
                  <td style={{ padding: '10px 12px', color: 'var(--text)' }}>{row.totalConnects}</td>
                  <td style={{ padding: '10px 12px', color: '#22d3ee', fontWeight: 600 }}>{formatCurrency(row.pipelineValue)}</td>
                  <td style={{ padding: '10px 12px', color: 'var(--text-muted)' }}>{row.monthlyTarget}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'var(--border)', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${Math.min(row.targetCompletion * 100, 100)}%`, background: row.targetCompletion >= 1 ? '#10b981' : row.targetCompletion >= 0.6 ? '#f59e0b' : '#ef4444', borderRadius: 3 }} />
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', minWidth: 36 }}>{formatPercent(row.targetCompletion, 0)}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Extended KPI Sections ────────────────────── */}
      <ExtendedKPISections leads={leads} members={members} profiles={profiles} />

      {/* ── Profile Performance + Source Breakdown ────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16 }}>
        <div style={cardStyle}>
          <SectionHeader title="Upwork Profile Performance" />
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr>
                {['Profile', 'Bids', 'Won', 'Win Rate', 'Pipeline', 'Boosted / Normal'].map((h) => (
                  <th key={h} style={{ padding: '6px 10px', textAlign: 'left', fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, borderBottom: '1px solid var(--border)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {profilePerf.map((row, i) => (
                <tr key={row.profileId} style={{ background: i % 2 === 0 ? 'transparent' : 'var(--surface-2)' }}>
                  <td style={{ padding: '8px 10px', fontWeight: 600, color: 'var(--text)' }}>{row.profileName}</td>
                  <td style={{ padding: '8px 10px' }}>{row.totalBids}</td>
                  <td style={{ padding: '8px 10px', color: '#10b981', fontWeight: 600 }}>{row.wonCount}</td>
                  <td style={{ padding: '8px 10px', color: row.winRate >= 0.15 ? '#10b981' : '#f59e0b', fontWeight: 600 }}>{formatPercent(row.winRate)}</td>
                  <td style={{ padding: '8px 10px', color: '#22d3ee' }}>{formatCurrency(row.pipelineValue)}</td>
                  <td style={{ padding: '8px 10px', color: 'var(--text-muted)' }}>{row.boostedBids} / {row.normalBids}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Source Breakdown */}
        <div style={cardStyle}>
          <SectionHeader title="Lead Source Breakdown" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 4 }}>
            {sources.map((s, i) => (
              <div key={s.source}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS[i] }} />
                    <span style={{ fontSize: 13, color: 'var(--text)' }}>{s.source}</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    <span style={{ color: '#10b981', fontWeight: 600 }}>{s.won} won</span> / {s.total} bids
                  </div>
                </div>
                <div style={{ height: 6, borderRadius: 3, background: 'var(--surface-2)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${(s.total / leads.length) * 100}%`, background: COLORS[i], borderRadius: 3 }} />
                </div>
              </div>
            ))}
          </div>

          {/* Boost Analysis */}
          <div style={{ marginTop: 20, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 12 }}>Boost Analysis</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div style={{ padding: '12px', background: 'rgba(245,158,11,0.1)', borderRadius: 8, border: '1px solid rgba(245,158,11,0.2)' }}>
                <div style={{ fontSize: 10, color: '#f59e0b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Boosted</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', marginTop: 4 }}>{cost.boostedBidCount}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Win: {formatPercent(cost.boostedWinRate)}</div>
              </div>
              <div style={{ padding: '12px', background: 'rgba(99,102,241,0.1)', borderRadius: 8, border: '1px solid rgba(99,102,241,0.2)' }}>
                <div style={{ fontSize: 10, color: '#818cf8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Normal</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', marginTop: 4 }}>{cost.normalBidCount}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Win: {formatPercent(cost.normalWinRate)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* ── Engagement Mix Analysis ──────────────────────────────────────── */}
      {(() => {
        const eng = getEngagementTypeKPIs(leads);
        const engChartData = [
          { name: 'Fixed', bids: eng.fixedCount, pipeline: Math.round(eng.fixedPipelineValue / 1000), winRate: Math.round(eng.fixedWinRate * 100) },
          { name: 'Hourly', bids: eng.hourlyCount, pipeline: Math.round(eng.hourlyPipelineValue / 1000), winRate: Math.round(eng.hourlyWinRate * 100) },
        ];
        return (
          <div>
            <SectionHeader title="Engagement Mix Analysis" subtitle="Fixed-price vs Hourly breakdown across all bids" />
            {/* 4 KPI cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 16 }}>
              <div style={{ ...cardStyle, borderTop: '3px solid var(--primary)' }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Fixed Bids</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--text)', margin: '6px 0' }}>{eng.fixedCount}</div>
                <div style={{ fontSize: 12, color: 'var(--primary)' }}>{(eng.fixedShare * 100).toFixed(0)}% of all bids</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Win rate: {formatPercent(eng.fixedWinRate)}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Avg value: {formatCurrency(eng.avgFixedValue)}</div>
              </div>
              <div style={{ ...cardStyle, borderTop: '3px solid var(--accent)' }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Hourly Bids</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--text)', margin: '6px 0' }}>{eng.hourlyCount}</div>
                <div style={{ fontSize: 12, color: 'var(--accent)' }}>{(eng.hourlyShare * 100).toFixed(0)}% of all bids</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Win rate: {formatPercent(eng.hourlyWinRate)}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Avg value: {formatCurrency(eng.avgHourlyValue)}</div>
              </div>
              <div style={{ ...cardStyle, borderTop: '3px solid var(--success)' }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Avg Hourly Rate</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--success)', margin: '6px 0' }}>${eng.avgHourlyRate.toFixed(0)}<span style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 500 }}>/hr</span></div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Across {eng.hourlyCount} hourly bids</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Avg est. hours: {eng.avgEstimatedHours.toFixed(0)}h</div>
              </div>
              <div style={{ ...cardStyle, borderTop: '3px solid var(--warning)' }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Hourly Pipeline Hrs</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--warning)', margin: '6px 0' }}>{eng.totalHourlyHours.toLocaleString()}<span style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 500 }}>hrs</span></div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Active hourly engagements</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Hourly pipeline: {formatCurrency(eng.hourlyPipelineValue)}</div>
              </div>
            </div>

            {/* side-by-side bar chart */}
            <div style={{ ...cardStyle }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 14 }}>Fixed vs Hourly — Bids, Pipeline ($K) &amp; Win Rate (%)</div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={engChartData} barCategoryGap="30%">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                  <Tooltip content={customTooltip} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="bids" name="Bids" fill="var(--primary)" radius={[2,2,0,0]} />
                  <Bar dataKey="pipeline" name="Pipeline ($K)" fill="var(--accent)" radius={[2,2,0,0]} />
                  <Bar dataKey="winRate" name="Win Rate (%)" fill="var(--success)" radius={[2,2,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        );
      })()}

    </div>
  );
}

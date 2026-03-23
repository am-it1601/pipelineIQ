'use client';

import { useEffect, useState } from 'react';
import type { LeadLogEntry, BDMember, UpworkProfile } from '@/lib/types';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import {
  getBDPerformance,
  getProfilePerformance,
  getCostKPIs,
  getSourceBreakdown,
  getMonthlyMetrics,
  getWoWChange,
  getMoMChange,
} from '@/lib/kpiEngine';
import { formatPercent, formatCurrency } from '@/lib/utils';
import SectionHeader from '@/components/ui/SectionHeader';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';

const COLORS = ['#6366f1', '#22d3ee', '#10b981', '#f59e0b', '#ef4444', '#a78bfa'];

const customTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload) return null;
  return (
    <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px' }}>
      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>{label}</div>
      {payload.map((p: any, i: number) => (
        <div key={i} style={{ fontSize: 13, fontWeight: 600, color: p.color }}>{p.name}: {p.value}</div>
      ))}
    </div>
  );
};

export default function AnalyticsPage() {
  const user = useAuthStore((s) => s.currentUser);
  const router = useRouter();
  const [leads, setLeads] = useState<LeadLogEntry[]>([]);
  const [members, setMembers] = useState<BDMember[]>([]);
  const [profiles, setProfiles] = useState<UpworkProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== 'admin') { router.replace('/dashboard'); return; }
    Promise.all([
      fetch('/api/leads').then(r => r.json()),
      fetch('/api/members').then(r => r.json()),
      fetch('/api/profiles').then(r => r.json()),
    ]).then(([l, m, p]) => { setLeads(l); setMembers(m); setProfiles(p); setLoading(false); });
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: 12 }}>
      <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid var(--border)', borderTopColor: '#6366f1', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Loading analytics…</div>
    </div>
  );

  const bdPerf = getBDPerformance(leads, members);
  const profilePerf = getProfilePerformance(leads, profiles);
  const cost = getCostKPIs(leads);
  const sources = getSourceBreakdown(leads);
  const monthly = getMonthlyMetrics(leads, 6);
  const wow = getWoWChange(leads);
  const mom = getMoMChange(leads);

  const cardStyle = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '20px' };

  // Radar data for BD comparison
  const radarData = ['totalBids', 'wonCount', 'totalConnects'].map((key) => ({
    metric: key === 'totalBids' ? 'Bids' : key === 'wonCount' ? 'Wins' : 'Connects',
    ...Object.fromEntries(bdPerf.slice(0, 4).map((row) => [row.memberName, (row as any)[key]])),
  }));

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* WoW / MoM */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div style={{ ...cardStyle, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>This Week Bids</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--text)' }}>{wow.thisWeekBids}</div>
            <div style={{ fontSize: 11, color: wow.bidsDelta >= 0 ? '#10b981' : '#ef4444', fontWeight: 600 }}>
              {wow.bidsDelta >= 0 ? '▲' : '▼'} {Math.abs(wow.bidsDelta).toFixed(1)}% vs last week
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>This Week Wins</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: '#10b981' }}>{wow.thisWeekWins}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Last week: {wow.lastWeekWins}</div>
          </div>
        </div>
        <div style={{ ...cardStyle, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>This Month Bids</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--text)' }}>{mom.thisMonthBids}</div>
            <div style={{ fontSize: 11, color: mom.bidsDelta >= 0 ? '#10b981' : '#ef4444', fontWeight: 600 }}>
              {mom.bidsDelta >= 0 ? '▲' : '▼'} {Math.abs(mom.bidsDelta).toFixed(1)}% vs last month
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>This Month Wins</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: '#10b981' }}>{mom.thisMonthWins}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Last month: {mom.lastMonthWins}</div>
          </div>
        </div>
      </div>

      {/* BD Comparison Bar Chart */}
      <div style={cardStyle}>
        <SectionHeader title="BD Member Comparison" subtitle="Total bids, wins, and pipeline by member" />
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={bdPerf} barGap={2}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="memberName" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
            <Tooltip content={customTooltip} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="totalBids" name="Bids" fill="#6366f1" radius={[3, 3, 0, 0]} />
            <Bar dataKey="wonCount" name="Won" fill="#10b981" radius={[3, 3, 0, 0]} />
            <Bar dataKey="totalConnects" name="Connects" fill="#22d3ee" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Profile Comparison */}
      <div style={cardStyle}>
        <SectionHeader title="Profile Performance Comparison" subtitle="Bids, wins, and boost analysis by Upwork profile" />
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={profilePerf} barGap={2}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="profileName" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
            <Tooltip content={customTooltip} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="totalBids" name="Total Bids" fill="#6366f1" radius={[3, 3, 0, 0]} />
            <Bar dataKey="wonCount" name="Won" fill="#10b981" radius={[3, 3, 0, 0]} />
            <Bar dataKey="boostedBids" name="Boosted" fill="#f59e0b" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Source Analysis + Boost Side-by-Side */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Source */}
        <div style={cardStyle}>
          <SectionHeader title="Lead Source Analysis" subtitle="Bids and win rate by source" />
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr>
                {['Source', 'Total Bids', 'Won', 'Win Rate', 'Share'].map(h => (
                  <th key={h} style={{ padding: '6px 10px', textAlign: 'left', fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, borderBottom: '1px solid var(--border)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sources.map((s, i) => (
                <tr key={s.source} style={{ background: i % 2 === 0 ? 'transparent' : 'var(--surface-2)' }}>
                  <td style={{ padding: '8px 10px', fontWeight: 600, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS[i] }} />{s.source}
                  </td>
                  <td style={{ padding: '8px 10px' }}>{s.total}</td>
                  <td style={{ padding: '8px 10px', color: '#10b981', fontWeight: 600 }}>{s.won}</td>
                  <td style={{ padding: '8px 10px', color: s.winRate >= 0.15 ? '#10b981' : '#f59e0b', fontWeight: 600 }}>{formatPercent(s.winRate)}</td>
                  <td style={{ padding: '8px 10px' }}>
                    <div style={{ height: 5, width: 80, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${leads.length > 0 ? (s.total / leads.length) * 100 : 0}%`, background: COLORS[i], borderRadius: 3 }} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Boost analysis deep-dive */}
        <div style={cardStyle}>
          <SectionHeader title="Bid Type Deep Dive" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
            <div style={{ padding: '14px', background: 'rgba(245,158,11,0.1)', borderRadius: 10, border: '1px solid rgba(245,158,11,0.2)', textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: '#f59e0b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Boosted Bids</div>
              <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--text)', marginTop: 6 }}>{cost.boostedBidCount}</div>
              <div style={{ fontSize: 13, color: '#10b981', fontWeight: 600 }}>Win: {formatPercent(cost.boostedWinRate)}</div>
            </div>
            <div style={{ padding: '14px', background: 'rgba(99,102,241,0.1)', borderRadius: 10, border: '1px solid rgba(99,102,241,0.2)', textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: '#818cf8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Normal Bids</div>
              <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--text)', marginTop: 6 }}>{cost.normalBidCount}</div>
              <div style={{ fontSize: 13, color: '#10b981', fontWeight: 600 }}>Win: {formatPercent(cost.normalWinRate)}</div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Avg Connects/Bid</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{cost.avgConnectsPerBid.toFixed(1)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Connects/Win</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{cost.connectsPerWin.toFixed(1)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Revenue/Connect</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#22d3ee' }}>{formatCurrency(cost.revenuePerConnect)}</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

"use client";
import SectionHeader from "@/components/ui/SectionHeader";
import { Card } from "@/components/ui/card";
import { getAvgBidsPerDay, getProfileMomentum, getWeeklyBDComparison } from "@/lib/kpiEngine";
import { formatCurrency, formatPercent } from "@/lib/utils";
import type { BDMember, LeadLogEntry, UpworkProfile } from "@/types/types";
import { Minus, TrendingDown, TrendingUp } from "lucide-react";
import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const MEMBER_COLORS = ["#0F6CBD", "#0078D4", "#107C41", "#D83B01", "#A4262C", "#605E5C"];
const customTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload) return null;
  return (
    <div
      style={{
        background: "var(--surface-2)",
        border: "1px solid var(--border)",
        borderRadius: 4,
        padding: "10px 14px",
      }}
    >
      <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 6 }}>{label}</div>
      {payload.map((p: any, i: number) => (
        <div key={i} style={{ fontSize: 13, fontWeight: 600, color: p.color }}>
          {p.name}: {p.value}
        </div>
      ))}
    </div>
  );
};

interface Props {
  leads: LeadLogEntry[];
  members: BDMember[];
  profiles: UpworkProfile[];
}

export default function ExtendedKPISections({ leads, members, profiles }: Props) {
  const [hoverRowId, setHoverRowId] = useState<string | null>(null);

  const avgBids = getAvgBidsPerDay(
    leads,
    members.filter((m) => m.status === "active")
  );
  const weeklyBD = getWeeklyBDComparison(
    leads,
    members.filter((m) => m.status === "active"),
    6
  );
  const profileMomentum = getProfileMomentum(leads, profiles);

  const memberNames = members
    .filter((m) => m.status === "active")
    .map((m) => (m.full_name || "").split(" ")[0]);

  const cardStyle = "p-5 bg-card text-card-foreground border rounded-lg shadow-sm";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* ── 1. Average Bids Per Day ──────────────────────────── */}
      <Card className={cardStyle}>
        <SectionHeader
          title="Average Bids Per Day — by BD Member"
          subtitle="Measures daily bidding pace across the team"
        />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: 12,
            marginBottom: 20,
          }}
        >
          {avgBids.map((row, i) => (
            <div
              key={row.memberId}
              style={{
                padding: "14px 16px",
                borderRadius: 4,
                background: `${MEMBER_COLORS[i % MEMBER_COLORS.length]}15`,
                border: `1px solid ${MEMBER_COLORS[i % MEMBER_COLORS.length]}33`,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: MEMBER_COLORS[i % MEMBER_COLORS.length],
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 10,
                    fontWeight: 700,
                    color: "#fff",
                  }}
                >
                  {row.memberName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>
                  {row.memberName.split(" ")[0]}
                </span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <div>
                  <div
                    style={{
                      fontSize: 10,
                      color: "var(--text-muted)",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Avg/Day
                  </div>
                  <div
                    style={{
                      fontSize: 20,
                      fontWeight: 700,
                      color: MEMBER_COLORS[i % MEMBER_COLORS.length],
                    }}
                  >
                    {row.avgBidsPerDay.toFixed(1)}
                  </div>
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 10,
                      color: "var(--text-muted)",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Avg/Day (30d)
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: "var(--text)" }}>
                    {row.avgLast30.toFixed(1)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: "var(--text-muted)" }}>Active Days</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>
                    {row.activeDays}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: "var(--text-muted)" }}>Last 7d</div>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: row.last7DaysBids >= 5 ? "#10b981" : "#f59e0b",
                    }}
                  >
                    {row.last7DaysBids}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bar chart comparison */}
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={avgBids} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
            <XAxis
              dataKey="memberName"
              tickFormatter={(v) => v.split(" ")[0]}
              tick={{ fontSize: 11, fill: "var(--text-muted)" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "var(--text-muted)" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={customTooltip} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="avgBidsPerDay" name="Avg/Day (all time)" radius={[2, 2, 0, 0]}>
              {avgBids.map((_, i) => (
                <Cell key={i} fill={MEMBER_COLORS[i % MEMBER_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* ── 2. Weekly BD Comparison ──────────────────────────── */}
      <Card className={cardStyle}>
        <SectionHeader
          title="Weekly BD Comparison — Lead Volume & Momentum"
          subtitle="Bids submitted per BD member per week (last 6 weeks)"
        />
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={weeklyBD}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
            <XAxis
              dataKey="weekLabel"
              tick={{ fontSize: 11, fill: "var(--text-muted)" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "var(--text-muted)" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={customTooltip} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            {memberNames.map((name, i) => (
              <Line
                key={name}
                type="monotone"
                dataKey={name}
                name={name}
                stroke={MEMBER_COLORS[i % MEMBER_COLORS.length]}
                strokeWidth={2}
                dot={{ r: 4, fill: MEMBER_COLORS[i % MEMBER_COLORS.length] }}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>

        {/* Momentum summary row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${Math.min(memberNames.length, 4)}, 1fr)`,
            gap: 10,
            marginTop: 16,
          }}
        >
          {(() => {
            // Calculate trend for each member (last week vs week before last)
            const last = weeklyBD[weeklyBD.length - 1];
            const prev = weeklyBD[weeklyBD.length - 2];
            return memberNames.map((name, i) => {
              const thisW = Number(last?.[name] ?? 0);
              const lastW = Number(prev?.[name] ?? 0);
              const delta = lastW === 0 ? 0 : ((thisW - lastW) / lastW) * 100;
              const Icon = delta > 5 ? TrendingUp : delta < -5 ? TrendingDown : Minus;
              const color = delta > 5 ? "#10b981" : delta < -5 ? "#ef4444" : "#94a3b8";
              return (
                <div
                  key={name}
                  style={{
                    padding: "10px 12px",
                    background: "var(--surface-2)",
                    borderRadius: 4,
                    border: "1px solid var(--border)",
                  }}
                >
                  <div style={{ fontSize: 11, color: MEMBER_COLORS[i], fontWeight: 600 }}>
                    {name}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                    <Icon size={14} color={color} />
                    <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>
                      {thisW} bids
                    </span>
                    <span style={{ fontSize: 11, color }}>
                      {delta > 0 ? "+" : ""}
                      {delta.toFixed(0)}%
                    </span>
                  </div>
                  <div style={{ fontSize: 10, color: "var(--text-muted)" }}>
                    vs prior week ({lastW})
                  </div>
                </div>
              );
            });
          })()}
        </div>
      </Card>

      {/* ── 3. Profile Performance Deep Dive ─────────────────── */}
      <Card className={cardStyle}>
        <SectionHeader
          title="Profile Performance Deep Dive"
          subtitle="Overall vs recent (last 4 weeks) win rate — momentum shown"
        />
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "var(--surface-2)" }}>
                {[
                  "Profile",
                  "Total Bids",
                  "Won",
                  "Overall Win%",
                  "Recent Win% (4w)",
                  "Momentum",
                  "Avg Proposal",
                  "Pipeline",
                  "Boosted",
                  "Normal",
                ].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "9px 12px",
                      textAlign: "left",
                      fontSize: 11,
                      color: "var(--text-muted)",
                      fontWeight: 600,
                      borderBottom: "1px solid var(--border)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {profileMomentum.map((row, i) => {
                const mom = row.momentumDelta;
                const MomIcon = mom > 0.02 ? TrendingUp : mom < -0.02 ? TrendingDown : Minus;
                const momColor = mom > 0.02 ? "#10b981" : mom < -0.02 ? "#ef4444" : "#94a3b8";
                const isHovered = hoverRowId === row.profileId;
                return (
                  <tr
                    key={row.profileId}
                    onMouseEnter={() => setHoverRowId(row.profileId)}
                    onMouseLeave={() => setHoverRowId(null)}
                    style={{
                      background: isHovered
                        ? "rgba(15, 108, 189, 0.05)"
                        : i % 2 === 0
                          ? "transparent"
                          : "rgba(255,255,255,0.02)",
                      transition: "background 0.12s",
                      cursor: "default",
                    }}
                  >
                    <td style={{ padding: "10px 12px", fontWeight: 600, color: "var(--text)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            background: MEMBER_COLORS[i % MEMBER_COLORS.length],
                          }}
                        />
                        {row.profile_name}
                      </div>
                    </td>
                    <td style={{ padding: "10px 12px" }}>{row.totalBids}</td>
                    <td style={{ padding: "10px 12px", color: "#10b981", fontWeight: 600 }}>
                      {row.wonCount}
                    </td>
                    <td
                      style={{
                        padding: "10px 12px",
                        color:
                          row.winRate >= 0.15
                            ? "#10b981"
                            : row.winRate >= 0.08
                              ? "#f59e0b"
                              : "#ef4444",
                        fontWeight: 600,
                      }}
                    >
                      {formatPercent(row.winRate)}
                    </td>
                    <td
                      style={{
                        padding: "10px 12px",
                        fontWeight: 600,
                        color: row.recentWinRate >= 0.15 ? "#10b981" : "#f59e0b",
                      }}
                    >
                      {row.recentBids > 0 ? (
                        formatPercent(row.recentWinRate)
                      ) : (
                        <span style={{ color: "var(--text-muted)" }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: "10px 12px" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                          color: momColor,
                          fontWeight: 600,
                        }}
                      >
                        <MomIcon size={14} />
                        <span style={{ fontSize: 12 }}>
                          {mom > 0 ? "+" : ""}
                          {(mom * 100).toFixed(1)}pp
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: "10px 12px", color: "#22d3ee" }}>
                      {formatCurrency(row.avgProposalValue)}
                    </td>
                    <td style={{ padding: "10px 12px", color: "#818cf8" }}>
                      {formatCurrency(row.pipelineValue)}
                    </td>
                    <td style={{ padding: "10px 12px", color: "#f59e0b" }}>{row.boostedBids}</td>
                    <td style={{ padding: "10px 12px", color: "var(--text-muted)" }}>
                      {row.normalBids}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

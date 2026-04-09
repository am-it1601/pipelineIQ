"use client";

import { DATE_PRESETS, DatePreset } from "@/lib/utils";
import type { UpworkProfile } from "@/types/types";
import { SlidersHorizontal, X } from "lucide-react";
import { Badge } from "./badge";
import { Card, CardContent } from "./card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./select";

export type EngagementFilter = "" | "Fixed" | "Hourly";
export type LeadSourceFilter = "" | "Upwork" | "Referral" | "LinkedIn" | "Direct";

export interface DashboardFilters {
  preset: DatePreset;
  customFrom: string;
  customTo: string;
  profileId: string; // '' = all
  engagement_type: EngagementFilter;
  lead_source: LeadSourceFilter;
}

const DEFAULT: DashboardFilters = {
  preset: "this_month",
  customFrom: "",
  customTo: "",
  profileId: "",
  engagement_type: "",
  lead_source: "",
};

interface Props {
  profiles: UpworkProfile[];
  value: DashboardFilters;
  onChange: (f: DashboardFilters) => void;
}

export default function DashboardFilter({ profiles, value, onChange }: Props) {
  const patch = (update: Partial<DashboardFilters>) => onChange({ ...value, ...update });

  const activeCount = [
    value.preset !== "this_month",
    !!value.profileId,
    !!value.engagement_type,
    !!value.lead_source,
  ].filter(Boolean).length;

  const selStyle: React.CSSProperties = {
    background: "var(--surface-2)",
    border: "1px solid var(--border)",
    borderRadius: 4,
    padding: "7px 10px",
    fontSize: 12,
    color: "var(--text)",
    cursor: "pointer",
    outline: "none",
  };

  return (
    <>
      <Card>
        <CardContent className="flex flex-wrap items-center gap-4 py-[12px] px-[16px]">
          <div className="flex items-center gap-2 text-primary font-semibold">
            <SlidersHorizontal size={14} />
            Dashboard Filter
            {activeCount > 0 && <Badge>{activeCount}</Badge>}
          </div>
          <Select onValueChange={(e) => patch({ preset: e as DatePreset })}>
            <SelectTrigger className="py-[0.5rem] px-[0.625rem] w-full max-w-48 cursor-pointer outline-none">
              <SelectValue placeholder="Select a Date Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Date Range</SelectLabel>
                {DATE_PRESETS.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          {value.preset === "custom" && (
            <>
              <input
                type="date"
                value={value.customFrom}
                onChange={(e) => patch({ customFrom: e.target.value })}
                style={{ ...selStyle, cursor: "default" }}
              />
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>to</span>
              <input
                type="date"
                value={value.customTo}
                onChange={(e) => patch({ customTo: e.target.value })}
                style={{ ...selStyle, cursor: "default" }}
              />
            </>
          )}
        </CardContent>
      </Card>
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 8,
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          gap: 10,
          flexWrap: "wrap",
        }}
      >
        {/* Date Preset */}
        <select
          value={value.preset}
          onChange={(e) => patch({ preset: e.target.value as DatePreset })}
          style={selStyle}
        >
          {DATE_PRESETS.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>

        {/* Custom date inputs */}
        {value.preset === "custom" && (
          <>
            <input
              type="date"
              value={value.customFrom}
              onChange={(e) => patch({ customFrom: e.target.value })}
              style={{ ...selStyle, cursor: "default" }}
            />
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>to</span>
            <input
              type="date"
              value={value.customTo}
              onChange={(e) => patch({ customTo: e.target.value })}
              style={{ ...selStyle, cursor: "default" }}
            />
          </>
        )}

        {/* Divider */}
        <div style={{ width: 1, height: 20, background: "var(--border)" }} />

        {/* Profile */}
        <select
          value={value.profileId}
          onChange={(e) => patch({ profileId: e.target.value })}
          style={selStyle}
        >
          <option value="">All Profiles</option>
          {profiles.map((p) => (
            <option key={p.id} value={p.id}>
              {p.profile_name}
            </option>
          ))}
        </select>

        {/* Engagement Type */}
        <select
          value={value.engagement_type}
          onChange={(e) => patch({ engagement_type: e.target.value as EngagementFilter })}
          style={selStyle}
        >
          <option value="">All Engagements</option>
          <option value="Fixed">Fixed Price</option>
          <option value="Hourly">Hourly</option>
        </select>

        {/* Lead Source */}
        <select
          value={value.lead_source}
          onChange={(e) => patch({ lead_source: e.target.value as LeadSourceFilter })}
          style={selStyle}
        >
          <option value="">All Sources</option>
          <option value="Upwork">Upwork</option>
          <option value="Referral">Referral</option>
          <option value="LinkedIn">LinkedIn</option>
          <option value="Direct">Direct</option>
        </select>

        {/* Clear */}
        {activeCount > 0 && (
          <button
            onClick={() => onChange(DEFAULT)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              padding: "6px 10px",
              borderRadius: 4,
              border: "1px solid var(--danger)",
              background: "transparent",
              color: "var(--danger)",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <X size={12} />
            Clear
          </button>
        )}
      </div>
    </>
  );
}

export { DEFAULT as DEFAULT_FILTERS };

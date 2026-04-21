"use client";
import type { LeadStatus } from "@/types/types";

const STATUS_CONFIG: Record<LeadStatus, { bg: string; color: string; label: string }> = {
  Submitted: { bg: "rgba(99,102,241,0.1)", color: "#818cf8", label: "Submitted" },
  Viewed: { bg: "rgba(34,211,238,0.1)", color: "#22d3ee", label: "Viewed" },
  Discussion: { bg: "rgba(245,158,11,0.1)", color: "#f59e0b", label: "Discussion" },
  "Follow Up": { bg: "rgba(249,115,22,0.1)", color: "#fb923c", label: "Follow Up" },
  "Waiting Client": { bg: "rgba(168,85,247,0.1)", color: "#c084fc", label: "Waiting" },
  Won: { bg: "rgba(16,185,129,0.1)", color: "#10b981", label: "Won" },
  Lost: { bg: "rgba(239,68,68,0.1)", color: "#ef4444", label: "Lost" },
};

interface StatusBadgeProps {
  status: LeadStatus;
  size?: "sm" | "md";
}

export default function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? {
    bg: "rgba(148,163,184,0.15)",
    color: "#94a3b8",
    label: status,
  };
  const fontSize = size === "sm" ? 10 : 11;
  const padding = size === "sm" ? "2px 7px" : "3px 10px";

  return (
    <span
      className="inline-flex items-center gap-[5px] rounded-[20px] whitespace-nowrap font-semibold"
      style={{
        fontSize,
        background: config.bg,
        color: config.color,
        border: `1px solid ${config.color}60`,
        padding,
      }}
    >
      <span
        className="w-[5px] h-[5px] shrink-0 rounded-full animate-pulse tracking-widest"
        style={{
          background: config.color,
        }}
      />
      {config.label}
    </span>
  );
}

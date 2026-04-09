import type { LeadSource } from "@/types/types";
import { ArrowRight, Globe, Linkedin, Users } from "lucide-react";

type LeadSourceBadgeProps = {
  source: LeadSource;
  size?: "sm" | "md";
};

const SOURCE_CONFIG: Record<
  LeadSource,
  { label: string; className: string; Icon: React.ElementType }
> = {
  Upwork: {
    label: "Upwork",
    className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30 dark:text-emerald-400",
    Icon: Globe,
  },
  LinkedIn: {
    label: "LinkedIn",
    className: "bg-blue-500/10 text-blue-600 border-blue-500/30 dark:text-blue-400",
    Icon: Linkedin,
  },
  Referral: {
    label: "Referral",
    className: "bg-violet-500/10 text-violet-600 border-violet-500/30 dark:text-violet-400",
    Icon: Users,
  },
  Direct: {
    label: "Direct",
    className: "bg-amber-500/10 text-amber-600 border-amber-500/30 dark:text-amber-400",
    Icon: ArrowRight,
  },
};

export default function LeadSourceBadge({ source, size = "sm" }: LeadSourceBadgeProps) {
  const config = SOURCE_CONFIG[source] ?? {
    label: source,
    className: "bg-muted/50 text-muted-foreground border-border",
    Icon: Globe,
  };

  const { label, className, Icon } = config;

  const sizeClass = size === "sm" ? "text-[10px] px-1.5 py-0.5 gap-0.5" : "text-xs px-2 py-1 gap-1";

  return (
    <span
      className={`inline-flex items-center rounded border font-medium ${sizeClass} ${className}`}
    >
      <Icon className={size === "sm" ? "size-2.5" : "size-3"} strokeWidth={2} />
      {label}
    </span>
  );
}

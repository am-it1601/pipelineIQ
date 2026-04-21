import type { EngagementType } from "@/types/types";
import { Clock, Navigation } from "lucide-react";

type EngagementTypeBadgeProps = {
  type: EngagementType;
  size?: "sm" | "md";
};

const TYPE_CONFIG: Record<
  EngagementType,
  { label: string; className: string; Icon: React.ElementType }
> = {
  Hourly: {
    label: "Hourly",
    className: "bg-cyan-500/10 text-cyan-600 border-cyan-500/30 dark:text-cyan-400",
    Icon: Clock,
  },
  Fixed: {
    label: "Fixed",
    className: "bg-indigo-500/10 text-indigo-600 border-indigo-500/30 dark:text-indigo-400",
    Icon: Navigation,
  },
};

export default function EngagementTypeBadge({ type, size = "sm" }: EngagementTypeBadgeProps) {
  const config = TYPE_CONFIG[type] ?? {
    label: type,
    className: "bg-muted/50 text-muted-foreground border-border",
    Icon: Clock,
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

import { toggleLeadHotStatus } from "@/lib/actions/leads.action";
import type { LeadLogEntry } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import {
  Briefcase,
  Calendar,
  CheckCircle,
  DollarSign,
  Star,
  TrendingUp,
  User,
  Zap
} from "lucide-react";
import { useEffect, useRef, useState, useTransition } from "react";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import EngagementTypeBadge from "../ui/EngagementTypeBadge";
import LeadSourceBadge from "../ui/LeadSourceBadge";
import StatusBadge from "../ui/StatusBadge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";

const HotToggleCell = ({ lead }: { lead: LeadLogEntry }) => {
  const [isHot, setIsHot] = useState(lead.is_hot ?? false);
  const [isPending, startTransition] = useTransition();
  const cellRef = useRef<HTMLDivElement>(null);

  // Sync state if the parent re-fetches data
  useEffect(() => {
    setIsHot(lead.is_hot ?? false);
  }, [lead.is_hot]);

  // Update closest table row styling without modifying the generic Datatable component
  useEffect(() => {
    const tr = cellRef.current?.closest("tr");
    if (tr) {
      if (isHot) {
        tr.classList.add("bg-amber-100/40", "dark:bg-amber-700/40", "hover:!bg-amber-100/90", "dark:hover:bg-amber-900/30");
      } else {
        tr.classList.remove("bg-amber-100/40", "dark:bg-amber-700/40", "hover:bg-amber-100/50", "dark:hover:bg-amber-900/30");
      }
    }
  }, [isHot]);

  return (
    <div ref={cellRef} className="flex items-center gap-1 text-center align-middle place-content-center">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          const nextState = !isHot;

          // Optimistically update local state
          setIsHot(nextState);

          startTransition(async () => {
            try {
              await toggleLeadHotStatus(lead.id, nextState);
            } catch (error) {
              console.error("Failed to toggle hot status:", error);
              // Revert on failure
              setIsHot(!nextState);
            }
          });
        }}
        title={isHot ? "Unmark as hot" : "Mark as hot"}
      >
        <Star className={`size-4 ${isHot ? "text-amber-500 fill-amber-500" : "text-muted-foreground"}`} />
      </Button>
    </div>
  );
};

export const LeadTableColumns: ColumnDef<LeadLogEntry>[] = [
  {
    accessorKey: "is_hot",
    meta: { className: "w-0" },
    header: () => (
      <div className="flex items-center gap-1">
        <Star className="h-4 w-4" />
        <span>Hot</span>
      </div>
    ),
    cell: ({ row }) => {
      return <HotToggleCell lead={row.original} />;
    },
  },
  {
    accessorKey: "date",
    meta: { className: "w-0" },
    header: () => (
      <div className="flex items-center gap-1">
        <Calendar className="h-4 w-4" />
        <span>Date</span>
      </div>
    ),
    cell: ({ row }) => {
      const dateStr = row.getValue<string>("date");
      if (!dateStr) return null;
      const dateObj = new Date(dateStr);
      const day = dateObj.getDate().toString().padStart(2, '0');
      const month = dateObj.toLocaleString('default', { month: 'short' });

      return (
        <div className="flex flex-col items-center justify-center bg-background border border-border/50 rounded-md shrink-0 w-9 h-10 shadow-sm mt-1 mb-1 relative overflow-hidden group">
          <div className="absolute top-0 w-full h-1.5 bg-primary/20 group-hover:bg-primary/40 transition-colors"></div>
          <span className="text-xs font-bold leading-none mt-1 group-hover:text-primary transition-colors">{day}</span>
          <span className="text-[9px] text-muted-foreground uppercase font-semibold mt-0.5 tracking-wider">{month}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "project_title",
    header: () => (
      <div className="flex items-center gap-1">
        <Briefcase className="h-4 w-4" />
        <span>Project Title</span>
      </div>
    ),
    cell: ({ row }) => {
      const title = row.getValue("project_title");
      const eType = row.original.engagement_type;
      const source = row.original.lead_source;
      const bid_type = row.original.bid_type;

      return (
        <div className="flex items-center gap-2">
          <span className="max-w-xs truncate font-semibold text-sm" title={String(title)}>{String(title)}</span>
          <EngagementTypeBadge type={eType} />
          <LeadSourceBadge source={source} />
          {
            bid_type === 'Boosted' && (
              <Tooltip>
                <TooltipTrigger>
                  <TrendingUp className="size-4 dark:text-amber-300 text-amber-500 motion-safe:animate-bounce" />
                </TooltipTrigger>
                <TooltipContent>
                  <TrendingUp className="size-4 text-amber-400 fill-amber-400" />
                  <p>Boosted proposal</p>
                </TooltipContent>
              </Tooltip>)
          }
        </div>
      );
    },
  },
  {
    accessorKey: "proposal_value",
    meta: { className: "w-0" },
    header: () => (
      <div className="flex items-center gap-1 place-content-center">
        <DollarSign className="h-4 w-4" />
        <span>Proposal Value</span>
      </div>
    ),
    cell: ({ row }) => {
      const value = row.getValue<number>("proposal_value");
      const eType = row.original.engagement_type;
      return (
        <div className="flex flex-col items-center justify-between gap-0.5 p-2.5 text-green-700 dark:text-green-400 font-semibold whitespace-nowrap align-top">
          <div className="text-sm">{formatCurrency(value)}</div>
          {eType === "Hourly" && row.original.hourly_rate && row.original.estimated_hours && (
            <div className="text-[10px] text-muted-foreground font-normal tracking-wider">
              ${row.original.hourly_rate}/hr × {row.original.estimated_hours}h
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    meta: { className: "w-0" },
    header: () => (
      <div className="flex items-center gap-1 place-content-center">
        <CheckCircle className="h-4 w-4" />
        <span>Status</span>
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-1 place-content-center">
        <StatusBadge status={row.original.status} size="sm" />
      </div>
    ),
  },
  {
    accessorKey: "connects_used",
    meta: { className: "w-0" },
    header: () => (
      <div className="flex items-center gap-1 place-content-center">
        <Zap className="h-4 w-4" />
        <span>Connects</span>
      </div>
    ),
    cell: ({ row }) => {
      const value = row.getValue<number>('connects_used');
      return value > 0 && <div className="flex place-content-center" >
        <Badge variant="default">{value}</Badge>
      </div >
    }
    ,
  },

  {
    accessorKey: "assigned_to_id",
    meta: { className: "w-0" },
    header: () => (
      <div className="flex items-center gap-1 place-content-center">
        <User className="h-4 w-4" />
        <span>Assigned To</span>
      </div>
    ),
    cell: ({ row }) => {
      const assignee = row.original.assignee;
      if (!assignee) return <span className="text-muted-foreground italic text-xs">Unassigned</span>;

      return (
        <div className="flex justify-center items-center text-center place-content-center">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Avatar className="h-8 w-8 cursor-help border border-border">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                    {assignee.avatar_initials}
                  </AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent>
                <p>{assignee.full_name}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      );
    },
  },
];

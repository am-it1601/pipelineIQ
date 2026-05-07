'use client';

import { format } from "date-fns";
import StatusBadge from "@/components/custom/StatusBadge";
import { ExternalLink, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import type { LeadLogEntry } from "@/types/types";
import LeadDialog from "./LeadDialog";
import { useDeleteLead } from "@/hooks/http/leads/lead.mutations";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { 
  Item, 
  ItemActions, 
  ItemContent, 
  ItemDescription, 
  ItemMedia, 
  ItemTitle,
  ItemGroup
} from "@/components/ui/item";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function LeadsTable({ leads }: { leads: LeadLogEntry[] }) {
  const router = useRouter();
  const deleteLead = useDeleteLead();

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this lead?")) {
      try {
        await deleteLead.mutateAsync(id);
        toast.success("Lead deleted successfully");
      } catch (error) {
        toast.error("Failed to delete lead");
      }
    }
  };

  if (!leads || leads.length === 0) return null;

  return (
    <ItemGroup className="flex flex-col gap-4">
      {leads.map((lead) => (
        <Item 
          key={lead.id} 
          variant="muted" 
          className="cursor-pointer group hover:border-primary/20 transition-colors bg-card p-4 rounded-xl shadow-sm border border-border"
          onClick={() => router.push(`/leads/${lead.id}`)}
        >
          <ItemMedia>
            <Avatar size="lg" className="h-12 w-12">
              <AvatarFallback className="border-2 border-primary/50 text-primary font-bold bg-primary/5">
                {lead.project_title?.substring(0, 2).toUpperCase() || "LD"}
              </AvatarFallback>
            </Avatar>
          </ItemMedia>
          
          <ItemContent className="gap-1 max-w-5xl ml-3">
            <ItemTitle className="flex items-center gap-2">
              <span className="md:text-lg text-primary font-semibold line-clamp-1">{lead.project_title}</span>
              {lead.upwork_link && (
                <a 
                  href={lead.upwork_link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors flex items-center shrink-0" 
                  onClick={(e) => e.stopPropagation()}
                  title="View on Upwork"
                >
                  <ExternalLink size={14} />
                </a>
              )}
            </ItemTitle>
            <ItemDescription className="flex items-center flex-wrap gap-2 text-xs text-muted-foreground mt-1">
              <span className="px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground font-medium whitespace-nowrap">
                {lead.lead_source}
              </span>
              <span>•</span>
              <span className="font-medium whitespace-nowrap">{lead.engagement_type}</span>
              {lead.date && (
                <>
                  <span>•</span>
                  <span className="whitespace-nowrap">{format(new Date(lead.date), "MMM dd, yyyy")}</span>
                </>
              )}
            </ItemDescription>
          </ItemContent>
          
          <ItemActions className="justify-end flex-1 gap-4 ml-auto">
            <div className="hidden sm:flex flex-col items-center justify-center gap-0.5 p-2 min-w-[100px] text-primary font-extrabold whitespace-nowrap border bg-card shadow-sm border-primary/10 rounded-xl">
              <div className="text-lg">
                {lead.proposal_value ? `$${lead.proposal_value.toLocaleString()}` : "—"}
              </div>
              {lead.engagement_type === "Hourly" && lead.hourly_rate ? (
                <div className="text-[10px] text-muted-foreground font-normal tracking-wider">
                  ${lead.hourly_rate}/hr
                </div>
              ) : (
                <div className="text-[10px] text-muted-foreground font-normal tracking-wider uppercase">
                  Budget
                </div>
              )}
            </div>
             
            <div className="flex items-center gap-3 ml-2" onClick={(e) => e.stopPropagation()}>
              <StatusBadge status={lead.status} />
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted">
                    <MoreHorizontal size={16} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <LeadDialog 
                    lead={lead} 
                    trigger={
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="gap-2">
                        <Pencil size={14} /> Edit
                      </DropdownMenuItem>
                    }
                  />
                  <DropdownMenuItem 
                    className="gap-2 text-destructive"
                    onSelect={() => handleDelete(lead.id)}
                  >
                    <Trash2 size={14} /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </ItemActions>
        </Item>
      ))}
    </ItemGroup>
  );
}

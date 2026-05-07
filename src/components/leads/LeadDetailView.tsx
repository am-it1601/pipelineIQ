'use client';

import { useLeadDetail } from "@/hooks/http/leads/lead.queries";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Pencil, Trash2, ExternalLink, Calendar, User, Link as LinkIcon, Clock, MessageSquare, Info } from "lucide-react";
import StatusBadge from "@/components/custom/StatusBadge";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import LeadDialog from "@/components/leads/LeadDialog";
import { useDeleteLead } from "@/hooks/http/leads/lead.mutations";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { LeadLogEntry } from "@/types/types";
import LeadComments from "@/components/leads/LeadComments";
import { useEffect, useState } from "react";

interface LeadDetailViewProps {
  id: string;
  initialData?: LeadLogEntry;
}

interface MentionUser {
  id: string;
  full_name: string;
  avatar_initials: string;
}

export default function LeadDetailView({ id, initialData }: LeadDetailViewProps) {
  const router = useRouter();
  const { data: lead, isLoading, isError } = useLeadDetail(id);
  const deleteLead = useDeleteLead();
  const [mentionableUsers, setMentionableUsers] = useState<MentionUser[]>([]);

  // Use initialData if available and no data is loaded yet
  const displayLead = lead || initialData;

  // Fetch users for @mention autocomplete
  useEffect(() => {
    fetch('/api/mentions')
      .then((r) => r.json())
      .then((json) => {
        const users = json?.data ?? json?.users ?? [];
        setMentionableUsers(
          users.map((u: any) => ({
            id: u.id,
            full_name: u.full_name ?? u.name ?? '',
            avatar_initials: u.avatar_initials ?? u.full_name?.slice(0, 2).toUpperCase() ?? '??',
          }))
        );
      })
      .catch(() => {});
  }, []);

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this lead?")) {
      try {
        await deleteLead.mutateAsync(id);
        toast.success("Lead deleted successfully");
        router.push("/leads");
      } catch (error) {
        toast.error("Failed to delete lead");
      }
    }
  };

  if (isLoading && !displayLead) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-10 w-48 bg-muted rounded mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !displayLead) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="text-4xl">🔍</div>
        <h2 className="text-xl font-semibold">Lead not found</h2>
        <p className="text-muted-foreground text-center max-w-sm">
          We couldn&apos;t find the lead you&apos;re looking for. It may have been deleted or the ID is incorrect.
        </p>
        <Button variant="outline" onClick={() => router.push("/leads")}>
          <ChevronLeft className="mr-2 h-4 w-4" /> Back to Leads
        </Button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => router.push("/leads")} className="-ml-2">
          <ChevronLeft className="mr-2 h-4 w-4" /> Back to Leads
        </Button>
        <div className="flex items-center gap-2">
          <LeadDialog 
            lead={displayLead} 
            trigger={
              <Button variant="outline" size="sm">
                <Pencil className="mr-2 h-4 w-4" /> Edit Lead
              </Button>
            } 
          />
          <Button variant="destructive" size="sm" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" /> Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Hero Section */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <StatusBadge status={displayLead.status} />
                    {displayLead.is_hot && (
                      <span className="bg-amber-500/10 text-amber-500 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border border-amber-500/20">
                        🔥 Hot Lead
                      </span>
                    )}
                  </div>
                  <h1 className="text-2xl font-bold tracking-tight text-foreground">
                    {displayLead.project_title}
                  </h1>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase mb-1">Source</p>
                  <div className="flex items-center gap-2">
                    <div className="bg-secondary p-1 rounded">
                      <Info className="size-3" />
                    </div>
                    <span className="font-semibold">{displayLead.lead_source}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase mb-1">Submitted On</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="size-4 text-primary" />
                    <span className="font-semibold">{format(new Date(displayLead.date), "MMM dd, yyyy")}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase mb-1">Assignee</p>
                  <div className="flex items-center gap-2">
                    <User className="size-4 text-primary" />
                    <span className="font-semibold text-primary">{displayLead.assignee?.full_name || "Unassigned"}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase mb-1">Engagement</p>
                  <div className="flex items-center gap-2">
                    <Clock className="size-4 text-primary" />
                    <span className="font-semibold">{displayLead.engagement_type}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Details Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Info className="size-5 text-primary" />
                Project Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {displayLead.upwork_link && (
                <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/50">
                  <div className="flex items-center gap-3">
                    <LinkIcon className="size-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium">Upwork Job Listing</p>
                      <p className="text-xs text-muted-foreground truncate max-w-md">{displayLead.upwork_link}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <a href={displayLead.upwork_link} target="_blank" rel="noopener noreferrer">
                      Open Link <ExternalLink className="ml-2 size-3" />
                    </a>
                  </Button>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="text-sm font-bold border-b pb-1">Proposal Info</h3>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Bid Type</span>
                    <span className="font-medium">{displayLead.bid_type}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Connects Used</span>
                    <span className="font-medium">{displayLead.connects_used}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-bold border-b pb-1">Budget & Rates</h3>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Budget</span>
                    <span className="font-bold text-primary">${displayLead.proposal_value?.toLocaleString()}</span>
                  </div>
                  {displayLead.engagement_type === "Hourly" && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Hourly Rate</span>
                        <span className="font-medium">${displayLead.hourly_rate}/hr</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Estimated Hours</span>
                        <span className="font-medium">{displayLead.estimated_hours} hrs</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {displayLead.remarks && (
                <div className="space-y-2">
                  <h3 className="text-sm font-bold border-b pb-1 flex items-center gap-2">
                    <MessageSquare className="size-4" />
                    Remarks
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap p-4 bg-muted/30 rounded-lg italic">
                    &ldquo;{displayLead.remarks}&rdquo;
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Comments section */}
          <LeadComments leadId={id} mentionableUsers={mentionableUsers} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground">Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  {displayLead.assignee?.avatar_initials || "U"}
                </div>
                <div>
                  <p className="text-sm font-medium">{displayLead.assignee?.full_name || "Unassigned"}</p>
                  <p className="text-xs text-muted-foreground">Lead Owner</p>
                </div>
              </div>
              <Separator />
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Created At</p>
                <p className="text-sm font-medium">{displayLead.created_at ? format(new Date(displayLead.created_at), "PPP p") : "—"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Last Updated</p>
                <p className="text-sm font-medium">{displayLead.updated_at ? format(new Date(displayLead.updated_at), "PPP p") : "—"}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

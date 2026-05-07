'use client';

import { useState, useEffect } from "react";
import { useLeadList } from "@/hooks/http/leads/lead.queries";
import LeadsTable from "./LeadsTable";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LeadsTableWrapper() {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [source, setSource] = useState<string>("all");
  const [engagement, setEngagement] = useState<string>("all");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const filters = {
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
    ...(status && status !== "all" ? { status } : {}),
    ...(source && source !== "all" ? { source } : {}),
    ...(engagement && engagement !== "all" ? { engagement } : {}),
  };

  const { data: response, isLoading, isError } = useLeadList(filters);
  const leads = response?.data;

  const handleClearFilters = () => {
    setSearchTerm("");
    setDebouncedSearch("");
    setStatus("all");
    setSource("all");
    setEngagement("all");
  };

  const hasActiveFilters = searchTerm || status !== "all" || source !== "all" || engagement !== "all";

  return (
    <div className="space-y-4">
      {/* Filters Section */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-card p-4 rounded-xl border">
        <div className="flex flex-1 w-full gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-background"
            />
          </div>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[160px] bg-background">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Submitted">Submitted</SelectItem>
              <SelectItem value="Viewed">Viewed</SelectItem>
              <SelectItem value="Discussion">Discussion</SelectItem>
              <SelectItem value="Follow Up">Follow Up</SelectItem>
              <SelectItem value="Waiting Client">Waiting Client</SelectItem>
              <SelectItem value="Won">Won</SelectItem>
              <SelectItem value="Lost">Lost</SelectItem>
            </SelectContent>
          </Select>
          <Select value={source} onValueChange={setSource}>
            <SelectTrigger className="w-[160px] bg-background">
              <SelectValue placeholder="Source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              <SelectItem value="Upwork">Upwork</SelectItem>
              <SelectItem value="Referral">Referral</SelectItem>
              <SelectItem value="LinkedIn">LinkedIn</SelectItem>
              <SelectItem value="Direct">Direct</SelectItem>
            </SelectContent>
          </Select>
          <Select value={engagement} onValueChange={setEngagement}>
            <SelectTrigger className="w-[160px] bg-background">
              <SelectValue placeholder="Engagement" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Engagements</SelectItem>
              <SelectItem value="Fixed">Fixed</SelectItem>
              <SelectItem value="Hourly">Hourly</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {hasActiveFilters && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleClearFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="mr-2 h-4 w-4" />
            Clear
          </Button>
        )}
      </div>

      {/* Content Section */}
      {isLoading ? (
        <div className="space-y-4 mt-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-center gap-3 border rounded-xl bg-destructive/5 border-destructive/20 p-8 mt-4">
          <span className="text-4xl">⚠️</span>
          <h3 className="text-lg font-semibold text-destructive">Failed to load leads</h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            There was an error fetching your leads. Please try refreshing the page.
          </p>
        </div>
      ) : !leads || leads.length === 0 ? (
        <section className="flex flex-col items-center justify-center min-h-[40vh] text-center gap-3 border-2 border-dashed rounded-xl p-8 mt-4">
          <span className="text-4xl">⚡</span>
          <h3 className="text-lg font-semibold text-muted-foreground">No leads found</h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            {hasActiveFilters 
              ? "Try adjusting your filters to find what you're looking for."
              : "Click \"Add New Lead\" above to create your first lead and start tracking your pipeline."}
          </p>
        </section>
      ) : (
        <div className="mt-4">
          <LeadsTable leads={leads} />
        </div>
      )}
    </div>
  );
}

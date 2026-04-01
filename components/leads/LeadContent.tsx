"use client";
import { Funnel, PlusIcon, SearchIcon, Star } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible";

import { usePagination } from "@/hooks/usePagination";
import { getLeads } from "@/lib/actions/leads.action";
import type { LeadFiltersInput } from "@/lib/services/leads.service";
import { BID_TYPES, ENGAGEMENT_TYPES, LEAD_SOURCES, STATUSES } from "@/lib/constants";
import { useAuth } from "@/lib/hooks/useAuth";
import type { LeadLogEntry } from "@/lib/types";
import Datatable from "../custom/Datatable";
import ProfileDropdown from "../profiles/ProfileDropdown";
import { Field, FieldLabel } from "../ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput } from "../ui/input-group";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Toggle } from "../ui/toggle";
import UserDropDown from "../users/UserDropDown";
import AddLeadForm, { LeadFormHandle } from "./AddLeadForm";
import { LeadTableColumns } from "./lead.table.colum";

const PAGE_SIZES = [10, 20, 50, 100];
const LeadContent = () => {
  const addLeadFormRef = useRef<LeadFormHandle>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [leads, setLeads] = useState<LeadLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const user = useAuth();
  const isAdmin = user?.role === "admin";

  // Pagination state and methods
  const {
    currentPage,
    pageSize,
    paginationInfo,
    handlePageChange,
    handlePageSizeChange,
    getPageNumbers,
    updatePaginationInfo,
    setCurrentPage,
  } = usePagination();

  // Filter state
  const [filters, setFilters] = useState<LeadFiltersInput>({});

  // Fetch leads with filters
  useEffect(() => {
    const fetchLeads = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await getLeads(currentPage, pageSize, filters);
        setLeads(response.data || []);
        updatePaginationInfo(response.pagination);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch leads";
        setError(errorMessage);
        console.error("Error fetching leads:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeads();
  }, [currentPage, pageSize, filters]);

  const handleFilterChange = (newFilters: Partial<LeadFiltersInput>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const getActiveFilterCount = (): number => {
    return Object.values(filters).filter((val) => {
      if (typeof val === "string") return val && val !== "";
      if (typeof val === "boolean") return val;
      return false;
    }).length;
  };

  return (
    <div className="flex flex-col gap-2 py-2">
      <Card>
        <CardHeader>
          <CardAction>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addLeadFormRef.current?.toggleSheet()}
            >
              <PlusIcon className="mr-2 h-4 w-4" />
              Add Lead
            </Button>
          </CardAction>
          <CardTitle>Lead Entries</CardTitle>
          <CardDescription>View and manage your lead entries.</CardDescription>
        </CardHeader>
      </Card>
      {/* Lead Filters and table*/}
      <Card>
        <CardContent className="flex flex-col gap-4 overflow-y-auto">
          {/* Filters */}
          <Collapsible
            open={showFilters}
            onOpenChange={setShowFilters}
            className="flex flex-col gap-2"
          >
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-lg font-semibold font-stretch-expanded">
                {paginationInfo.total} Lead Entries
              </h3>
              <div className="flex gap-4 items-center">
                <div className="flex gap-2 items-center justify-between">
                  <h4 className="text-sm font-semibold text-muted-foreground w-fit">
                    {getActiveFilterCount() > 0
                      ? `${getActiveFilterCount()} Filters Applied`
                      : "Filter Leads"}
                  </h4>
                  <CollapsibleTrigger>
                    <Toggle
                      aria-label="Toggle bookmark"
                      size="sm"
                      variant={getActiveFilterCount() > 0 ? "default" : "outline"}
                    >
                      <Funnel className="group-data-[state=on]/toggle:fill-foreground" />
                      Bookmark
                    </Toggle>
                    {/* <Button variant="ghost" size="icon" className="size-8">
                      <FunnelIcon />
                      <span className="sr-only">Toggle details</span>
                    </Button> */}
                  </CollapsibleTrigger>
                </div>
              </div>
            </div>
            <CollapsibleContent className="flex flex-col gap-4 border border-accent p-4 shadow">
              <div className="grid grid-cols-4 gap-4 grid-auto-flow auto-rows-auto">
                {/* Search Field */}
                <Field>
                  <FieldLabel htmlFor="search-input">Search</FieldLabel>
                  <InputGroup>
                    <InputGroupInput
                      id="search-input"
                      value={filters.search || ""}
                      onChange={(e) => handleFilterChange({ search: e.target.value })}
                      placeholder="Project name..."
                    />
                    <InputGroupAddon align="inline-start">
                      <SearchIcon />
                    </InputGroupAddon>
                  </InputGroup>
                </Field>

                {/* Status Filter */}
                <Field>
                  <FieldLabel htmlFor="lead_status">Status</FieldLabel>
                  <Select
                    value={filters.status || ""}
                    onValueChange={(v) => handleFilterChange({ status: v || undefined })}
                  >
                    <SelectTrigger id="lead_status">
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                {/* Source Filter */}
                <Field>
                  <FieldLabel htmlFor="lead_source">Source</FieldLabel>
                  <Select
                    value={filters.source || ""}
                    onValueChange={(v) => handleFilterChange({ source: v || undefined })}
                  >
                    <SelectTrigger id="lead_source">
                      <SelectValue placeholder="All Sources" />
                    </SelectTrigger>
                    <SelectContent>
                      {LEAD_SOURCES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                {/* Engagement Type Filter */}
                <Field>
                  <FieldLabel htmlFor="lead_eng_type">Engagement Type</FieldLabel>
                  <Select
                    value={filters.engagement || ""}
                    onValueChange={(v) => handleFilterChange({ engagement: v || undefined })}
                  >
                    <SelectTrigger id="lead_eng_type">
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      {ENGAGEMENT_TYPES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                {/* Bid Type Filter */}
                <Field>
                  <FieldLabel htmlFor="lead_bidType">Bid Type</FieldLabel>
                  <Select
                    value={filters.bid_type || ""}
                    onValueChange={(v) => handleFilterChange({ bid_type: v || undefined })}
                  >
                    <SelectTrigger id="lead_bidType">
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      {BID_TYPES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                {/* Profile Filter */}
                <Field>
                  <FieldLabel htmlFor="lead_profiles">Profile</FieldLabel>
                  <ProfileDropdown
                    value={filters.profile || ""}
                    onChangeHandler={(v) => handleFilterChange({ profile: v || undefined })}
                  />
                </Field>

                {/* Assignee Filter (Admin Only) */}
                {isAdmin && (
                  <Field>
                    <FieldLabel htmlFor="lead_assignee">Assignee</FieldLabel>
                    <UserDropDown
                      value={filters.member || ""}
                      onChangeHandler={(v) => handleFilterChange({ member: v || undefined })}
                    />
                  </Field>
                )}

                {/* Starred Filter */}
                <Field className="w-24">
                  <FieldLabel htmlFor="isHot">Starred</FieldLabel>
                  <Button
                    id="isHot"
                    variant={filters.hot ? "default" : "outline"}
                    size="sm"
                    className={`h-9 text-xs ${filters.hot ? "bg-amber-500 hover:bg-amber-600" : ""}`}
                    onClick={() => handleFilterChange({ hot: !filters.hot })}
                  >
                    <Star className={`w-3.5 h-3.5 mr-1 ${filters.hot ? "fill-current" : ""}`} />
                    Starred
                  </Button>
                </Field>
              </div>
            </CollapsibleContent>
          </Collapsible>
          {error && <div className="text-sm text-red-500">Error: {error}</div>}
          {isLoading ? (
            <div className="text-sm text-muted-foreground max-w-3/4 mx-auto">Loading leads...</div>
          ) : (
            <Datatable columns={LeadTableColumns} data={leads} />
          )}
        </CardContent>
        <CardFooter className="flex justify-between items-center gap-4">
          {/* Page Size Selector */}
          <div className="flex flex-1 w-full items-center gap-2 text-sm">
            <span className="text-muted-foreground min-w-fit">Rows per page:</span>
            <Select value={String(pageSize)} onValueChange={handlePageSizeChange}>
              <SelectTrigger>
                <SelectValue placeholder={"Page Size"} />
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZES.map((size) => (
                  <SelectItem value={String(size)} key={`page_${size}`}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Pagination */}
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageChange(currentPage - 1);
                  }}
                  className={!paginationInfo.hasPrevPage ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>

              {(() => {
                const pageNums = getPageNumbers();
                const firstInRange = pageNums[0] ?? 1;
                const lastInRange = pageNums[pageNums.length - 1] ?? 1;
                const totalPages = paginationInfo.totalPages;
                return (
                  <>
                    {/* First page + ellipsis */}
                    {firstInRange > 1 && (
                      <>
                        <PaginationItem>
                          <PaginationLink href="#" onClick={(e) => { e.preventDefault(); handlePageChange(1); }}>
                            1
                          </PaginationLink>
                        </PaginationItem>
                        {firstInRange > 2 && (
                          <PaginationItem><PaginationEllipsis /></PaginationItem>
                        )}
                      </>
                    )}

                    {/* Window of pages */}
                    {pageNums.map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          href="#"
                          onClick={(e) => { e.preventDefault(); handlePageChange(page); }}
                          isActive={page === currentPage}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}

                    {/* Ellipsis + last page */}
                    {lastInRange < totalPages && (
                      <>
                        {lastInRange < totalPages - 1 && (
                          <PaginationItem><PaginationEllipsis /></PaginationItem>
                        )}
                        <PaginationItem>
                          <PaginationLink href="#" onClick={(e) => { e.preventDefault(); handlePageChange(totalPages); }}>
                            {totalPages}
                          </PaginationLink>
                        </PaginationItem>
                      </>
                    )}
                  </>
                );
              })()}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageChange(currentPage + 1);
                  }}
                  className={!paginationInfo.hasNextPage ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </CardFooter>
      </Card>
      <AddLeadForm ref={addLeadFormRef} />
    </div>
  );
};
export default LeadContent;

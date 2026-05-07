import type { LeadLogEntry } from "@/types/types";
import type { SupabaseClient } from "@supabase/supabase-js";

// ============================================================
// SHARED TYPES
// ============================================================

export interface LeadFiltersInput {
  search?: string;
  status?: string;
  source?: string;
  engagement?: string;
  bid_type?: string;
  profile?: string;
  member?: string;
  hot?: boolean;
}

export interface PaginatedLeadsResponse {
  data: LeadLogEntry[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

// Maps valid sort fields
export const LEAD_SORT_FIELD_MAP: Record<string, string> = {
  date: "date",
  project_title: "project_title",
  assigned_to_id: "assigned_to_id",
  lead_source: "lead_source",
  profile_used_id: "profile_used_id",
  engagement_type: "engagement_type",
  proposal_value: "proposal_value",
  connects_used: "connects_used",
  bid_type: "bid_type",
  status: "status",
  created_at: "created_at",
};

// ============================================================
// QUERY HELPERS
// ============================================================

/**
 * Applies filter predicates to a Supabase query builder.
 * Returns the augmented query — chainable.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function applyLeadFilters(query: any, filters?: LeadFiltersInput): any {
  if (!filters) return query;
  if (filters.status) query = query.eq("status", filters.status);
  if (filters.source) query = query.eq("lead_source", filters.source);
  if (filters.engagement) query = query.eq("engagement_type", filters.engagement);
  if (filters.bid_type) query = query.eq("bid_type", filters.bid_type);
  if (filters.profile) query = query.eq("profile_used_id", filters.profile);
  if (filters.member) query = query.eq("assigned_to_id", filters.member);
  if (filters.hot) query = query.eq("is_hot", true);
  if (filters.search) query = query.ilike("project_title", `%${filters.search}%`);
  return query;
}

// ============================================================
// SERVICE FUNCTIONS
// ============================================================

export interface QueryLeadsOptions {
  page?: number;
  pageSize?: number;
  filters?: LeadFiltersInput;
  sortBy?: string;
  sortDir?: "asc" | "desc";
}

/**
 * Returns a paginated list of leads.
 * Works with both the RLS-aware client (Server Actions) and the admin client (API Routes).
 */
export async function queryLeads(
  supabase: SupabaseClient,
  options: QueryLeadsOptions = {}
): Promise<PaginatedLeadsResponse> {
  const { page = 1, pageSize = 20, filters, sortBy = "created_at", sortDir = "desc" } = options;

  const offset = (page - 1) * pageSize;
  const dbSortField = LEAD_SORT_FIELD_MAP[sortBy] ?? "created_at";

  // Count query
  let countQuery = supabase.from("lead_logs").select("*", { count: "exact", head: true });
  countQuery = applyLeadFilters(countQuery, filters);
  const { count, error: countError } = await countQuery;
  if (countError) throw new Error(`Failed to fetch leads count: ${countError.message}`);

  const total = count ?? 0;
  const totalPages = Math.ceil(total / pageSize);

  // Data query
  let dataQuery = supabase
    .from("lead_logs")
   .select(`
  *,
  assignee:users!lead_logs_assigned_to_id_fkey(
    id,
    full_name,
    avatar_initials,
    email
  )
`);
  dataQuery = applyLeadFilters(dataQuery, filters);
  dataQuery = dataQuery
    .order(dbSortField, { ascending: sortDir === "asc" })
    .range(offset, offset + pageSize - 1);

  const { data, error } = await dataQuery;
  if (error) throw new Error(`Failed to fetch leads: ${error.message}`);

  return {
    data: (data ?? []) as unknown as LeadLogEntry[],
    pagination: {
      page,
      pageSize,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
}

export async function getLeadById(supabase: SupabaseClient, id: string): Promise<LeadLogEntry> {
  const { data, error } = await supabase
    .from("lead_logs")
    .select(`
  *,
  assignee:users!lead_logs_assigned_to_id_fkey(
    id,
    full_name,
    avatar_initials,
    email
  )
`)
    .eq("id", id)
    .single();

  if (error || !data) throw new Error("Lead not found");
  return data as unknown as LeadLogEntry;
}

export interface CreateLeadData {
  date: string;
  project_title: string;
  lead_source: string;
  upwork_link?: string | null;
  profile_used_id?: string | null;
  assigned_to_id: string;
  engagement_type: string;
  proposal_value?: number | null;
  hourly_rate?: number | null;
  estimated_hours?: number | null;
  connects_used?: number | null;
  bid_type?: string | null;
  status: string;
  remarks?: string | null;
  is_hot?: boolean;
  created_by_user_id: string;
  updated_by_user_id: string;
}

/**
 * Inserts a new lead record. Returns the created LeadLogEntry.
 */
export async function createLeadRecord(
  supabase: SupabaseClient,
  data: CreateLeadData
): Promise<LeadLogEntry> {
  const { data: row, error } = await supabase
    .from("lead_logs")
    .insert(data)
    .select(`
  *,
  assigned_user:users!lead_logs_assigned_to_id_fkey(*)
`)
    .single();

  if (error || !row) {
    throw new Error(`Failed to create lead: ${error.message}`);
  }

  return row as LeadLogEntry;
}

/**
 * Partially updates a lead by ID. Returns the updated LeadLogEntry.
 */
export async function updateLeadRecord(
  supabase: SupabaseClient,
  id: string,
  patch: Partial<LeadLogEntry>
): Promise<LeadLogEntry> {
  const dbPatch = {
    ...patch,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("lead_logs")
    .update(dbPatch)
    .eq("id", id)
    .select(`
  *,
  assignee:users!lead_logs_assigned_to_id_fkey(
    id,
    full_name,
    avatar_initials,
    email
  )
`)
    .single();

  if (error || !data) throw new Error("Lead not found or update failed");
  return data as unknown as LeadLogEntry;
}

/**
 * Deletes a lead by ID.
 */
export async function deleteLeadRecord(supabase: SupabaseClient, id: string): Promise<void> {
  const { error } = await supabase.from("lead_logs").delete().eq("id", id);
  if (error) throw new Error(`Failed to delete lead: ${error.message}`);
}

import type { LeadLogEntry } from '@/types/types';
import { useQuery } from '@tanstack/react-query';
import { leadKeys } from './lead.keys';

async function leadFetch<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error ?? `Request failed (${res.status})`);
  }
  return res.json() as Promise<T>;
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

export function useLeadList(filters?: Record<string, any>) {
  const queryParams = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, String(value));
      }
    });
  }

  const queryString = queryParams.toString();
  const url = queryString ? `/api/leads?${queryString}` : '/api/leads';

  return useQuery({
    queryKey: leadKeys.list(filters),
    queryFn: () => leadFetch<PaginatedLeadsResponse>(url),
    staleTime: 2 * 60 * 1000, // 2 min
    refetchOnWindowFocus: false,
  });
}

/**
 * Fetch a single lead by ID.
 */
export function useLeadDetail(id: string | undefined) {
  return useQuery({
    queryKey: leadKeys.detail(id ?? ''),
    queryFn: () => leadFetch<LeadLogEntry>(`/api/leads/${id}`),
    enabled: !!id,
  });
}

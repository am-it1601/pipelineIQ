"use client";

import { apiCall } from "@/lib/utils";
import { LeadLogEntry } from "@/types/types";
import { useQuery } from "@tanstack/react-query";
import { PROSPECT_KEYS } from "./prospect.keys";

// TODO: implement filters and pagination
export function useProspectLists(filters?: any) {
    const url = "/api/prospects";

    return useQuery({
        queryKey: PROSPECT_KEYS.list({ filters }),
        queryFn: () => apiCall<LeadLogEntry[]>(url),
        staleTime: 5 * 60 * 1000, // 5 min
        refetchOnWindowFocus: false,
    });
}

/**
 * Fetch a single profile by ID.
 */
// export function useProfileDetail(id: string | undefined) {
//     return useQuery({
//         queryKey: profileKeys.detail(id ?? ""),
//         queryFn: () => profileFetch<UpworkProfile>(`/api/profiles/${id}`),
//         enabled: !!id,
//     });
// }

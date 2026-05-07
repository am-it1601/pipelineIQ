/**
 * Leads — TanStack Mutation Hooks
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { leadKeys } from "./lead.keys";

async function leadMutate<T>(url: string, method: "POST" | "PATCH" | "DELETE", body?: unknown): Promise<T> {
    const res = await fetch(url, {
        method,
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? `Request failed (${res.status})`);
    }

    return res.json() as Promise<T>;
}

export function useCreateLead() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: unknown) => leadMutate("/api/leads", "POST", data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: leadKeys.lists() });
        },
    });
}

export function useUpdateLead() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: unknown }) => 
            leadMutate(`/api/leads/${id}`, "PATCH", data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: leadKeys.lists() });
            queryClient.invalidateQueries({ queryKey: leadKeys.detail(id) });
        },
    });
}

export function useDeleteLead() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => leadMutate(`/api/leads/${id}`, "DELETE"),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: leadKeys.lists() });
        },
    });
}

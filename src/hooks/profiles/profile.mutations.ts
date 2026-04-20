/**
 * Upwork Profiles — TanStack Mutation Hooks
 *
 * Mutation hooks for creating, updating, and deleting profiles.
 * Each mutation auto-invalidates relevant query caches on success.
 */

import { UpworkProfileFormInput } from "@/forms/profile.schema";
import type { UpworkProfile } from "@/types/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { profileKeys } from "./profile.keys";

// ============================================================
// Helpers
// ============================================================

async function profileMutate<T>(url: string, method: "POST" | "PATCH" | "DELETE", body?: unknown): Promise<T> {
    const res = await fetch(url, {
        method,
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? `Request failed (${res.status})`);
    }

    // DELETE returns { success: true }; others return entity
    return res.json() as Promise<T>;
}

// ============================================================
// Types
// ============================================================

// ============================================================
// Mutation Hooks
// ============================================================

/**
 * Create a new upwork profile.
 *
 * Invalidates the profile list cache on success.
 */
export function useCreateProfile() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: UpworkProfileFormInput) => profileMutate<UpworkProfile>("/api/profiles", "POST", data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: profileKeys.lists() });
        },
    });
}

/**
 * Update an existing upwork profile.
 *
 * Invalidates both the list and the specific detail cache.
 */
export function useUpdateProfile(id: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: UpworkProfileFormInput) =>
            profileMutate<UpworkProfile>(`/api/profiles/${id}`, "PATCH", data),
        onSuccess: (updatedProfile) => {
            // Update the detail cache in-place for instant UI response
            queryClient.setQueryData(profileKeys.detail(id), updatedProfile);
            queryClient.invalidateQueries({ queryKey: profileKeys.lists() });
        },
    });
}

/**
 * Delete an upwork profile.
 *
 * Invalidates list and removes the detail from cache.
 */
export function useDeleteProfile() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => profileMutate<{ success: boolean }>(`/api/profiles/${id}`, "DELETE"),
        onSuccess: (_data, id) => {
            queryClient.removeQueries({ queryKey: profileKeys.detail(id) });
            queryClient.invalidateQueries({ queryKey: profileKeys.lists() });
        },
    });
}

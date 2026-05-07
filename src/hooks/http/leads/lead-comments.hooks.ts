import type { LeadComment } from "@/lib/services/lead-comments.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
export const commentKeys = {
  all: ["lead_comments"] as const,
  byLead: (leadId: string) => [...commentKeys.all, leadId] as const,
};

async function commentFetch<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error ?? `Request failed (${res.status})`);
  }
  return res.json() as Promise<T>;
}


export function useLeadComments(leadId: string) {
  return useQuery({
    queryKey: commentKeys.byLead(leadId),
    queryFn: () => commentFetch<LeadComment[]>(`/api/leads/${leadId}/comments`),
    enabled: !!leadId,
    staleTime: 30 * 1000,
  });
}

export function useCreateComment(leadId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ author_id, content, parent_id }: { author_id: string; content: string; parent_id?: string | null }) => {
      const res = await fetch(`/api/leads/${leadId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ author_id, content, parent_id }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? "Failed to post comment");
      }
      return res.json() as Promise<LeadComment>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: commentKeys.byLead(leadId) });
    },
  });
}

export function useDeleteComment(leadId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (commentId: string) => {
      const res = await fetch(`/api/leads/${leadId}/comments/${commentId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete comment");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: commentKeys.byLead(leadId) });
    },
  });
}

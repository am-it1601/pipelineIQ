/**
 * Notifications — TanStack Query Hooks
 */

import type { AppNotification } from "@/lib/services/notifications.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// ============================================================
// Key factory
// ============================================================

export const notifKeys = {
  all: ["notifications"] as const,
  byUser: (userId: string) => [...notifKeys.all, userId] as const,
};

// ============================================================
// Queries
// ============================================================

export function useNotifications(userId: string | undefined) {
  return useQuery({
    queryKey: notifKeys.byUser(userId ?? ""),
    queryFn: async () => {
      const res = await fetch(`/api/notifications?userId=${userId}`);
      if (!res.ok) throw new Error("Failed to fetch notifications");
      return res.json() as Promise<AppNotification[]>;
    },
    enabled: !!userId,
    refetchInterval: 30_000, // poll every 30 s
    staleTime: 20_000,
  });
}

// ============================================================
// Mutations
// ============================================================

export function useMarkAllRead(userId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (!res.ok) throw new Error("Failed to mark all as read");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notifKeys.byUser(userId ?? "") });
    },
  });
}

export function useMarkOneRead(userId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const res = await fetch(`/api/notifications/${notificationId}`, {
        method: "PATCH",
      });
      if (!res.ok) throw new Error("Failed to mark notification as read");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notifKeys.byUser(userId ?? "") });
    },
  });
}

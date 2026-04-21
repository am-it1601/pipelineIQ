/**
 * Upwork Profiles — TanStack Query Key Factory
 *
 * Centralised query keys for cache management.
 * Follows the key-factory pattern for consistent invalidation.
 */

export const profileKeys = {
  all: ['profiles'] as const,
  lists: () => [...profileKeys.all, 'list'] as const,
  list: (filters: { status?: string }) =>
    [...profileKeys.lists(), filters] as const,
  details: () => [...profileKeys.all, 'detail'] as const,
  detail: (id: string) => [...profileKeys.details(), id] as const,
};

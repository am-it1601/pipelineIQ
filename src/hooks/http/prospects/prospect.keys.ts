export const PROSPECT_KEYS = {
    all: ["prospects"] as const,
    lists: () => [...PROSPECT_KEYS.all, "list"] as const,
    list: (filters: any) => [...PROSPECT_KEYS.lists(), { filters }] as const,
    details: () => [...PROSPECT_KEYS.all, "detail"] as const,
    detail: (id: string) => [...PROSPECT_KEYS.details(), id] as const,
};

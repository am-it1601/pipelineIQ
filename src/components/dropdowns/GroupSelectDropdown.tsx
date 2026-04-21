"use client";

/**
 * GroupSelectDropdown — Reusable Group Selection Component
 *
 * Dynamically fetches user groups via TanStack Query (cached for 10 min).
 * Renders a shadcn Select with loading/error states.
 *
 * Usage:
 *   <GroupSelectDropdown value={groupSlug} onChange={setGroupSlug} />
 *   <GroupSelectDropdown value={groupSlug} onChange={setGroupSlug} includeAllOption />
 */

import { Select, SelectContent, SelectItem, SelectSeparator, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useGroupList } from "@/hooks/http/auth/auth.queries";
import type { GroupInfo } from "@/lib/auth/types/auth.types";
import { Code2, Eye, Layers, ShieldCheck, Users } from "lucide-react";
import type { ComponentProps } from "react";

// ============================================================
// Icon mapping — maps known group slugs to icons
// ============================================================

const GROUP_ICON_MAP: Record<string, React.ReactNode> = {
    administrator: <ShieldCheck className="size-4 text-amber-500" />,
    team_manager: <Users className="size-4 text-blue-500" />,
    team_member: <Layers className="size-4 text-emerald-500" />,
    auditor: <Eye className="size-4 text-violet-500" />,
    developer: <Code2 className="size-4 text-cyan-500" />,
};

const DEFAULT_ICON = <Layers className="size-4 text-muted-foreground" />;

function getGroupIcon(slug: string): React.ReactNode {
    return GROUP_ICON_MAP[slug] ?? DEFAULT_ICON;
}

// ============================================================
// Props
// ============================================================

export interface GroupSelectDropdownProps extends Omit<ComponentProps<typeof Select>, "children"> {
    /** Current selected group slug */
    value?: string;
    /** Change handler — receives the group slug */
    onChange?: (slug: string) => void;
    /** If true, adds an "All Groups" option with value "" */
    includeAllOption?: boolean;
    /** Placeholder text */
    placeholder?: string;
    /** Trigger class override */
    triggerClassName?: string;
    /** If provided, filters out groups by slug */
    excludeSlugs?: string[];
}

// ============================================================
// Component
// ============================================================

export default function GroupSelectDropdown({
    value,
    onChange,
    includeAllOption = false,
    placeholder = "Select a group",
    triggerClassName,
    excludeSlugs = [],
    ...selectProps
}: GroupSelectDropdownProps) {
    const { data: groups, isLoading, isError } = useGroupList();

    // Filter out excluded slugs
    const filteredGroups: GroupInfo[] = (groups ?? []).filter((g) => !excludeSlugs.includes(g.slug));

    // Loading state
    if (isLoading) {
        return <Skeleton className="h-9 w-full rounded-3xl" />;
    }

    // Error state — render a disabled select
    if (isError || !groups) {
        return (
            <Select disabled>
                <SelectTrigger className={triggerClassName}>
                    <SelectValue placeholder="Failed to load groups" />
                </SelectTrigger>
            </Select>
        );
    }

    return (
        <Select value={value} onValueChange={onChange} {...selectProps}>
            <SelectTrigger className={triggerClassName}>
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
                {includeAllOption && (
                    <>
                        <SelectItem value="__all__">
                            <Users className="size-4 text-muted-foreground" />
                            All Groups
                        </SelectItem>
                        {filteredGroups.length > 0 && <SelectSeparator />}
                    </>
                )}

                {filteredGroups.map((group) => (
                    <SelectItem key={group.slug} value={group.slug}>
                        {getGroupIcon(group.slug)}
                        {group.display_name}
                    </SelectItem>
                ))}

                {filteredGroups.length === 0 && !includeAllOption && (
                    <div className="px-3 py-2 text-sm text-muted-foreground">No groups available</div>
                )}
            </SelectContent>
        </Select>
    );
}

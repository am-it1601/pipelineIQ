"use client";

/**
 * User Directory Card — Client Component
 *
 * Fetches and renders the user list via TanStack Query.
 * Mutations from UserActionMenu auto-invalidate the query cache,
 * so the list refreshes automatically after any action.
 */

import State from "@/components/custom/State";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserList } from "@/hooks/api_hooks/auth.queries";
import { UserWithDetails } from "@/lib/auth/types/auth.types";
import { useState } from "react";
import { Separator } from "../ui/separator";
import UserItem from "./UserItem";

const PER_PAGE = 10;

export default function UserDirectoryCard() {
    const [page, setPage] = useState(1);

    const { data, isLoading, isError, error } = useUserList({
        page,
        perPage: PER_PAGE,
    });

    const totalPages = data?.meta?.lastPage ?? 1;

    /** Build the page numbers to display with ellipsis logic */
    function getPageNumbers(): (number | "ellipsis")[] {
        if (totalPages <= 7) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }

        const pages: (number | "ellipsis")[] = [1];

        if (page > 3) pages.push("ellipsis");

        const start = Math.max(2, page - 1);
        const end = Math.min(totalPages - 1, page + 1);

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }

        if (page < totalPages - 2) pages.push("ellipsis");

        pages.push(totalPages);

        return pages;
    }

    return (
        <Card className="shadow">
            <CardHeader>
                <CardTitle className="flex gap-2 items-center">
                    <div>User Directory</div>
                    {data && <Badge variant="default">{data?.meta.total}</Badge>}
                </CardTitle>
                <CardDescription>
                    Manage user accounts, assigned roles, and access status across the platform.
                </CardDescription>
                <Separator orientation="horizontal" decorative className="h-px" />
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Loading State */}
                {isLoading && (
                    <div className="space-y-4">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="flex items-center gap-4 p-3">
                                <Skeleton className="size-10 rounded-full" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-4 w-36" />
                                    <Skeleton className="h-3 w-48" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Error State */}
                {error && <State variant="error" description={error?.message ?? "Failed to load users"} />}

                {/* User List */}
                {data?.users.map((user: UserWithDetails) => (
                    <UserItem user={user} key={user.id} />
                ))}

                {/* Empty State */}
                {data && data.users.length === 0 && (
                    <p className="py-8 text-center text-sm text-muted-foreground">No users found.</p>
                )}
            </CardContent>

            {/* Pagination */}
            {data && (
                <CardFooter className="justify-between">
                    <p className="text-xs text-muted-foreground">
                        Showing {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, data.meta.total)} of{" "}
                        {data.meta.total} users
                    </p>
                    <Pagination className="mx-0 w-auto">
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    size="xs"
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    aria-disabled={page <= 1}
                                    className={page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                />
                            </PaginationItem>

                            {getPageNumbers().map((p, idx) =>
                                p === "ellipsis" ? (
                                    <PaginationItem key={`ellipsis-${idx}`}>
                                        <PaginationEllipsis />
                                    </PaginationItem>
                                ) : (
                                    <PaginationItem key={p}>
                                        <PaginationLink
                                            size="icon-xs"
                                            isActive={p === page}
                                            onClick={() => setPage(p)}
                                            className="cursor-pointer"
                                        >
                                            {p}
                                        </PaginationLink>
                                    </PaginationItem>
                                )
                            )}

                            <PaginationItem>
                                <PaginationNext
                                    size="xs"
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                    aria-disabled={page >= totalPages}
                                    className={page >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </CardFooter>
            )}
        </Card>
    );
}

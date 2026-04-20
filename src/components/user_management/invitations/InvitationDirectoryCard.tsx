"use client";

/**
 * Invitation Directory Card — Client Component
 *
 * Lists users with status='invited' (pending invitations).
 * Supports resend and revoke actions.
 */

import State from "@/components/custom/State";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useResendInvitation, useRevokeInvitation } from "@/hooks/api_hooks/auth.mutations";
import { useInvitationList } from "@/hooks/api_hooks/auth.queries";
import type { UserWithDetails } from "@/lib/auth/types/auth.types";
import { formatDistanceToNow } from "date-fns";
import { Clock, Mail, RefreshCw, Trash2 } from "lucide-react";

export default function InvitationDirectoryCard() {
    const { data, isLoading, error } = useInvitationList({ perPage: 50 });
    const resendMutation = useResendInvitation();
    const revokeMutation = useRevokeInvitation();

    const invitations = data?.invitations ?? [];
    const total = data?.meta?.total ?? 0;

    return (
        <Card className="shadow">
            <CardHeader>
                <CardTitle className="flex gap-2 items-center">
                    <div>Pending Invitations</div>
                    {total > 0 && <Badge variant="secondary">{total}</Badge>}
                </CardTitle>
                <CardDescription>
                    Track sent invitations, review assigned roles or groups, and manage pending user onboarding.
                </CardDescription>
                <Separator orientation="horizontal" decorative className="h-px" />
            </CardHeader>
            <CardContent className="space-y-2">
                {/* Loading */}
                {isLoading && (
                    <div className="space-y-3">
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

                {/* Error */}
                {error && <State variant="error" description={error?.message ?? "Failed to load invitations"} />}

                {/* Invitation List */}
                {invitations.map((inv: UserWithDetails) => (
                    <InvitationItem
                        key={inv.id}
                        invitation={inv}
                        onResend={() => resendMutation.mutate(inv.id)}
                        onRevoke={() => revokeMutation.mutate(inv.id)}
                        isResending={resendMutation.isPending}
                        isRevoking={revokeMutation.isPending}
                    />
                ))}

                {/* Empty */}
                {!isLoading && !error && invitations.length === 0 && (
                    <p className="py-8 text-center text-sm text-muted-foreground">No pending invitations.</p>
                )}
            </CardContent>
        </Card>
    );
}

// ============================================================
// Invitation Item
// ============================================================

function InvitationItem({
    invitation,
    onResend,
    onRevoke,
    isResending,
    isRevoking,
}: {
    invitation: UserWithDetails;
    onResend: () => void;
    onRevoke: () => void;
    isResending: boolean;
    isRevoking: boolean;
}) {
    const isExpired = invitation.invitation_expires_at && new Date(invitation.invitation_expires_at) < new Date();

    const expiryLabel = invitation.invitation_expires_at
        ? isExpired
            ? "Expired"
            : `Expires ${formatDistanceToNow(new Date(invitation.invitation_expires_at), { addSuffix: true })}`
        : "No expiry";

    const initials = invitation.avatar_initials || invitation.email.slice(0, 2).toUpperCase();

    return (
        <div className="flex items-center gap-3 rounded-lg border p-3">
            <Avatar className="size-9">
                <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <Mail className="size-3.5 text-muted-foreground shrink-0" />
                    <span className="text-sm font-medium truncate">{invitation.email}</span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                    <Clock className="size-3 text-muted-foreground shrink-0" />
                    <span className={`text-xs ${isExpired ? "text-destructive" : "text-muted-foreground"}`}>
                        {expiryLabel}
                    </span>
                    {invitation.invitation_resent_count > 0 && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                            Resent {invitation.invitation_resent_count}×
                        </Badge>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-1">
                <Tooltip>
                    <TooltipTrigger>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="size-8"
                            onClick={onResend}
                            disabled={isResending}
                        >
                            <RefreshCw className={`size-4 ${isResending ? "animate-spin" : ""}`} />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Resend invitation</TooltipContent>
                </Tooltip>

                <Tooltip>
                    <TooltipTrigger>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-destructive hover:text-destructive"
                            onClick={onRevoke}
                            disabled={isRevoking}
                        >
                            <Trash2 className="size-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Revoke invitation</TooltipContent>
                </Tooltip>
            </div>
        </div>
    );
}

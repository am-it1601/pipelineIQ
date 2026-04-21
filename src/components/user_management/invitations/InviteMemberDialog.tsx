"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { authKeys } from "@/hooks/http/auth/auth.queries";

import State from "@/components/custom/State";
import { useQueryClient } from "@tanstack/react-query";
import { AlertCircle, Loader, MailCheck, Mails, UserPlus } from "lucide-react";
import { useState } from "react";
import InvitationForm from "../../invitations/InvitationForm";
import { InviteFormData } from "../../invitations/invitation.form";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "../../ui/empty";
import { Separator } from "../../ui/separator";

interface InviteMemberDialogProps {
    onInviteSent?: () => void;
}

export function InviteMemberDialog({ onInviteSent }: InviteMemberDialogProps) {
    const queryClient = useQueryClient();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    let email = "";
    const onInvite = async (data: InviteFormData) => {
        setLoading(true);
        setApiError(null);
        email = data.email;
        try {
            const res = await fetch("/api/users/invitations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            const responseData = await res.json();

            if (!res.ok) {
                setApiError(responseData?.error?.message || "Failed to send invitation");
                setLoading(false);
                return;
            }
            setSuccess(true);
            // Invalidate caches so lists refresh
            queryClient.invalidateQueries({ queryKey: authKeys.invitations() });
            queryClient.invalidateQueries({ queryKey: authKeys.users() });
            setTimeout(() => {
                setOpen(false);
                setSuccess(false);
                onInviteSent?.();
            }, 2000);
        } catch {
            setApiError("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(open) => {
                setApiError(null);
                setSuccess(false);
                setLoading(false);
                setOpen(open);
            }}
        >
            <DialogTrigger>
                <Button size="lg">
                    <UserPlus className="size-4" />
                    Invite Member
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader className="pt-2">
                    <DialogTitle className="flex items-center gap-2">
                        <Mails className="size-5 text-primary" />
                        Invite Team
                    </DialogTitle>
                    <DialogDescription>
                        <p className="whitespace-pre-wrap">Add members to your workspace</p>
                        <Separator className="my-1 h-px" />
                    </DialogDescription>
                </DialogHeader>
                {loading && <InvitationSendProcessing />}
                {success && (
                    <State
                        variant="success"
                        icon={MailCheck}
                        title="Invitation Sent!"
                        description={`The invitation has been sent successfully to ${email}.`}
                    >
                        <p className="text-sm text-muted-foreground">
                            The recipient should receive an email shortly. If they don't see it, please ask them to
                            check their spam folder.
                        </p>
                    </State>
                )}
                {apiError && <InvitationError message={apiError} />}
                {!success && !apiError && !loading && (
                    <InvitationForm
                        onCancel={() => {
                            setOpen(false);
                        }}
                        onInvite={onInvite}
                    />
                )}
            </DialogContent>
        </Dialog>
    );
}

const InvitationError = ({ message }: { message: string }) => (
    <Empty className="bg-destructive/10">
        <EmptyHeader>
            <EmptyMedia>
                <AlertCircle className="size-10 text-destructive" />
            </EmptyMedia>
            <EmptyTitle>Failed to Send Invitation</EmptyTitle>
            <EmptyDescription className="max-w-xs text-pretty">{message}</EmptyDescription>
            <EmptyContent>
                <p className="text-sm text-muted-foreground">
                    Please check the email address and try again. If the problem persists, contact support.
                </p>
            </EmptyContent>
        </EmptyHeader>
    </Empty>
);

const InvitationSendProcessing = () => (
    <Empty className="bg-muted/30">
        <EmptyHeader>
            <EmptyMedia variant="default">
                <Loader className="size-10 text-primary animate-[spin_2.5s_linear_infinite]" />
            </EmptyMedia>
            <EmptyTitle>Sending Invitation...</EmptyTitle>
            <EmptyDescription className="max-w-xs text-pretty">
                Please wait while we send the invitation email.
            </EmptyDescription>
        </EmptyHeader>
    </Empty>
);
